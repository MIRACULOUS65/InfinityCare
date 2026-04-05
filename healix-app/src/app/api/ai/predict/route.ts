import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ai/predict
 *
 * Proxies symptoms text to the disease prediction API.
 * Service: https://disease-api-kopq.onrender.com  (Render free tier — cold starts)
 *
 * Env vars (server-side only):
 *   PREDICTION_API_BASE_URL = https://disease-api-kopq.onrender.com  (default)
 */

const PREDICTION_BASE = (
  process.env.PREDICTION_API_BASE_URL ?? "https://disease-api-kopq.onrender.com"
).replace(/\/$/, "");

// Render free tier cold-starts can take 30-50s. We try multiple paths.
const CANDIDATE_PATHS = ["/predict", "/api/predict", "/disease/predict", "/"];

interface RawPrediction {
  disease?: string;
  condition?: string;
  name?: string;
  confidence?: number;
  score?: number;
  probability?: number;
}

function normalizePredictions(raw: unknown) {
  if (Array.isArray(raw)) {
    let entries = (raw as RawPrediction[])
      .map((item) => {
        const v = item.confidence ?? item.score ?? item.probability ?? 0;
        return {
          disease: item.disease ?? item.condition ?? item.name ?? "Unknown",
          // Keep raw probability for dynamic scaling calculation
          rawConfidence: v <= 1 ? v * 100 : v,
        };
      })
      .sort((a, b) => b.rawConfidence - a.rawConfidence);

    // If the ML model returns a highly diffuse distribution (e.g. top is 1-2%),
    // we scale it linearly relative to ~85% so the UI Progress Bar is actually usable
    const topConf = entries[0]?.rawConfidence || 1;
    const scaleFactor = topConf > 0 && topConf < 15 ? 85 / topConf : 1;

    const scaledEntries = entries.map((e) => ({
      disease: e.disease,
      confidence: Math.min(99, Math.round(e.rawConfidence * scaleFactor)),
    }));

    const main = scaledEntries[0] ?? { disease: "Unknown", confidence: 0 };
    return {
      mainPrediction: main.disease,
      mainConfidence: main.confidence,
      topPredictions: scaledEntries.slice(0, 5),
    };
  }

  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;

    // Nested list under a known key
    const listKey = ["predictions", "results", "diseases", "top_predictions", "data"].find(
      (k) => Array.isArray(obj[k])
    );
    if (listKey) return normalizePredictions(obj[listKey]);

    // Single flat prediction
    const disease = (
      obj.disease ?? obj.prediction ?? obj.condition ?? obj.result ?? "Unknown"
    ) as string;
    const raw_confidence = (obj.confidence ?? obj.score ?? obj.probability ?? 0) as number;
    const confidence = raw_confidence <= 1
      ? Math.round(raw_confidence * 100)
      : Math.round(raw_confidence);

    return {
      mainPrediction: disease,
      mainConfidence: confidence,
      topPredictions: [{ disease, confidence }],
    };
  }

  return { mainPrediction: "Unable to predict", mainConfidence: 0, topPredictions: [] };
}

/** Try a single endpoint path, return parsed JSON or null */
async function tryPath(path: string, symptomsArray: string[]): Promise<unknown | null> {
  try {
    const url = `${PREDICTION_BASE}${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: symptomsArray }),
      signal: AbortSignal.timeout(45_000), // Render cold starts can be slow
    });

    if (!res.ok) {
      console.warn(`[predict] ${path} → HTTP ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (e) {
    console.warn(`[predict] ${path} failed:`, (e as Error).message);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const symptoms: string = body?.symptoms ?? body?.text ?? "";

    if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length < 3) {
      return NextResponse.json(
        { error: "Symptoms text required for prediction" },
        { status: 400 }
      );
    }

    // The FastAPI backend `/predict` expects `symptoms` as an array of lowercase strings
    const symptomsArray = symptoms
      .split(/[,\n]/)
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);

    // Try each candidate path in order
    for (const path of CANDIDATE_PATHS) {
      const raw = await tryPath(path, symptomsArray);
      if (raw !== null) {
        return NextResponse.json(normalizePredictions(raw));
      }
    }

    // All paths failed — return a graceful unavailable response
    // (don't crash the whole analysis; summary may still have succeeded)
    console.warn("[predict] All prediction endpoints failed — returning unavailable");
    return NextResponse.json(
      {
        mainPrediction: "Service unavailable",
        mainConfidence: 0,
        topPredictions: [],
        warning:
          "Disease prediction service is currently offline (Render cold start or down). Please try again in a moment.",
      },
      { status: 200 } // 200 so the frontend shows the warning gracefully, not an error banner
    );
  } catch (err) {
    console.error("[/api/ai/predict] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
