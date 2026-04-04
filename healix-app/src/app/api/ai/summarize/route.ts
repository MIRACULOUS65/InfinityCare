import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ai/summarize
 *
 * Fallback chain:
 *   1. Gemini 1.5 Flash         (GEMINI_API_KEY)
 *   2. Ollama Cloud             (OLLAMA_API_KEY + OLLAMA_BASE_URL + OLLAMA_MODEL)
 *      → https://ollama.com/v1  (OpenAI-compatible, Bearer token auth)
 *   3. Custom Healthcare AI     (HEALTHCARE_AI_BASE_URL)
 *   4. Degraded response        (returns raw OCR text with warning)
 *
 * All keys are server-side only — never sent to the browser.
 */

const GEMINI_KEY        = process.env.GEMINI_API_KEY ?? "";
const OLLAMA_API_KEY    = process.env.OLLAMA_API_KEY ?? "";
const OLLAMA_BASE       = (process.env.OLLAMA_BASE_URL ?? "https://ollama.com/v1").replace(/\/$/, "");
const OLLAMA_MODEL      = process.env.OLLAMA_MODEL ?? "llama3.2";
const HEALTHCARE_BASE   = process.env.HEALTHCARE_AI_BASE_URL ?? "http://13.60.2.198";

// ─── Shared prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT =
  "You are a clinical assistant. Extract a structured summary from medical prescription text. " +
  "Always respond with valid JSON only — no markdown fences, no explanation.";

function buildUserPrompt(text: string): string {
  return `Analyze this prescription/medical document and return JSON with these exact keys:
- patientOverview: brief patient description (string)
- symptoms: array of symptom/finding strings
- medicines: array of medicine name strings
- dosage: dosage/frequency as a single string
- notes: special precautions or additional notes (string)

Use empty string or empty array if information is not present.

Document text:
"""
${text}
"""`;
}

// ─── 1. Gemini ────────────────────────────────────────────────────────────────

async function tryGemini(text: string): Promise<string | null> {
  if (!GEMINI_KEY) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: SYSTEM_PROMPT + "\n\n" + buildUserPrompt(text) }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
        signal: AbortSignal.timeout(20_000),
      }
    );
    if (!res.ok) {
      console.warn(`[summarize] Gemini → HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (e) {
    console.warn("[summarize] Gemini failed:", (e as Error).message);
    return null;
  }
}

// ─── 2. Ollama Cloud (https://ollama.com/v1) ──────────────────────────────────
//
// Official Ollama cloud exposes an OpenAI-compatible /chat/completions endpoint.
// Auth: Authorization: Bearer <OLLAMA_API_KEY>
// Docs: https://ollama.com/blog/openai-compatibility

async function tryOllama(text: string): Promise<string | null> {
  if (!OLLAMA_API_KEY) return null;

  try {
    const res = await fetch(`${OLLAMA_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OLLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: buildUserPrompt(text) },
        ],
        temperature: 0.2,
        stream: false,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[summarize] Ollama cloud → HTTP ${res.status}: ${body}`);
      return null;
    }

    const data = await res.json();
    // OpenAI-compatible response: choices[0].message.content
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.warn("[summarize] Ollama cloud failed:", (e as Error).message);
    return null;
  }
}

// ─── 3. Custom Healthcare AI ──────────────────────────────────────────────────

async function tryHealthcareAI(text: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${HEALTHCARE_BASE}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) {
      console.warn(`[summarize] Healthcare AI → HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn("[summarize] Healthcare AI failed:", (e as Error).message);
    return null;
  }
}

// ─── JSON parser (strips markdown fences if model misbehaves) ─────────────────

function parseLLMJson(raw: string): Record<string, unknown> {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  return JSON.parse(cleaned);
}

// ─── Normalize healthcare AI response shape ───────────────────────────────────

function normalizeHealthcareAI(obj: Record<string, unknown>) {
  return {
    patientOverview: (obj.patient_overview ?? obj.patientOverview ?? "") as string,
    symptoms:        (obj.symptoms        ?? [])                          as string[],
    medicines:       (obj.medicines       ?? obj.medications ?? [])       as string[],
    dosage:          (obj.dosage          ?? obj.dosage_instructions ?? "") as string,
    notes:           (obj.notes           ?? obj.precautions ?? "")       as string,
    rawSummary:      (obj.summary         ?? obj.raw_summary ?? "")       as string,
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text: string = body?.text ?? "";

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Insufficient text provided for analysis." },
        { status: 400 }
      );
    }

    // ── 1. Gemini ────────────────────────────────────────────────────────────
    const geminiRaw = await tryGemini(text);
    if (geminiRaw) {
      try {
        return NextResponse.json({ ...parseLLMJson(geminiRaw), source: "gemini" });
      } catch {
        console.warn("[summarize] Gemini JSON parse failed — trying Ollama");
      }
    }

    // ── 2. Ollama Cloud ──────────────────────────────────────────────────────
    const ollamaRaw = await tryOllama(text);
    if (ollamaRaw) {
      try {
        return NextResponse.json({ ...parseLLMJson(ollamaRaw), source: "ollama" });
      } catch {
        console.warn("[summarize] Ollama JSON parse failed — trying Healthcare AI");
      }
    }

    // ── 3. Custom Healthcare AI ───────────────────────────────────────────────
    const aiResult = await tryHealthcareAI(text);
    if (aiResult) {
      return NextResponse.json({ ...normalizeHealthcareAI(aiResult), source: "healthcare-ai" });
    }

    // ── 4. Degraded fallback ─────────────────────────────────────────────────
    console.warn("[summarize] All AI services failed — returning degraded response");
    return NextResponse.json({
      patientOverview: "",
      symptoms:        [],
      medicines:       [],
      dosage:          "",
      notes:           "",
      rawSummary:      text.slice(0, 600),
      warning:
        "AI summarisation services are currently unavailable. Showing raw extracted text.",
      source: "degraded",
    });
  } catch (err) {
    console.error("[/api/ai/summarize] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
