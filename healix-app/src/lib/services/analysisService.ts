/**
 * Analysis Service
 * ----------------
 * Abstracts all calls for:
 *  1. Clinical summarisation   → /api/ai/summarize   (proxies to healthcare AI backend)
 *  2. Disease prediction       → /api/ai/predict      (proxies to disease prediction API)
 *
 * This file runs ONLY in the browser. It never touches keys directly.
 * Secrets live in backend env vars read by the Next.js API routes.
 */

export interface SummaryResult {
  patientOverview?: string;
  symptoms?: string[];
  medicines?: string[];
  dosage?: string;
  notes?: string;
  rawSummary?: string;
  warning?: string;
}

export interface PredictionEntry {
  disease: string;
  confidence: number; // 0-100
}

export interface PredictionResult {
  mainPrediction: string;
  mainConfidence: number;
  topPredictions: PredictionEntry[];
  raw?: unknown;
  warning?: string;
}

// ─── Summary ────────────────────────────────────────────────────────────────

export async function fetchMedicalSummary(ocrText: string): Promise<SummaryResult> {
  const res = await fetch("/api/ai/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: ocrText }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Summary API failed (${res.status})`);
  }

  const data = await res.json();
  return data as SummaryResult;
}

// ─── Prediction ──────────────────────────────────────────────────────────────

export async function fetchDiseasePrediction(symptoms: string): Promise<PredictionResult> {
  const res = await fetch("/api/ai/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Prediction API failed (${res.status})`);
  }

  const data = await res.json();
  return data as PredictionResult;
}
