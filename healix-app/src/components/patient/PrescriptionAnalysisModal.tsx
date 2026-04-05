"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  DragEvent,
  ChangeEvent,
} from "react";
import {
  X,
  Upload,
  ScanText,
  Sparkles,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  FlaskConical,
  Pill,
  FileText,
  Activity,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";
import {
  fetchMedicalSummary,
  fetchDiseasePrediction,
  SummaryResult,
  PredictionResult,
} from "@/lib/services/analysisService";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = "upload" | "ocr" | "results";

interface OcrProgress {
  status: string;
  progress: number; // 0–100
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type))
    return "Unsupported format. Please upload JPG, PNG, or WebP.";
  if (file.size > MAX_SIZE_MB * 1024 * 1024)
    return `File too large. Maximum size is ${MAX_SIZE_MB} MB.`;
  return null;
}

const preprocessImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }

      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        let gray = 0.299 * r + 0.587 * g + 0.114 * b;

        if (gray > 170) gray = 255;
        else if (gray < 110) gray = 0;

        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      ctx.putImageData(imageData, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressBar({ value, color = "white" }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-white/30 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "upload", label: "Upload" },
    { key: "ocr", label: "Scan" },
    { key: "results", label: "Results" },
  ];
  const currentIdx = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-2 text-xs">
      {steps.map((step, idx) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
              idx < currentIdx
                ? "bg-white text-black"
                : idx === currentIdx
                ? "bg-white/20 text-white ring-1 ring-white/40"
                : "bg-white/5 text-white/30"
            }`}
          >
            {idx < currentIdx ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
          </div>
          <span
            className={`hidden sm:block transition-colors duration-300 ${
              idx === currentIdx ? "text-white" : idx < currentIdx ? "text-white/60" : "text-white/20"
            }`}
          >
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <ChevronRight className="w-3 h-3 text-white/20 hidden sm:block" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Panels ──────────────────────────────────────────────────────────────────

function SummaryPanel({ summary }: { summary: SummaryResult }) {
  return (
    <div className="space-y-4">
      {summary.warning && (
        <div className="flex items-start gap-2.5 px-4 py-3 border border-amber-500/20 bg-amber-500/5 rounded-none">
          <TriangleAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300/80">{summary.warning}</p>
        </div>
      )}

      {summary.patientOverview && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
            Patient Overview
          </p>
          <p className="text-sm text-white/80 leading-relaxed">{summary.patientOverview}</p>
        </div>
      )}

      {summary.symptoms && summary.symptoms.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2 flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Symptoms / Findings
          </p>
          <div className="flex flex-wrap gap-2">
            {summary.symptoms.map((s, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs border border-white/10 bg-white/5 text-white/70"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {summary.medicines && summary.medicines.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2 flex items-center gap-1.5">
            <Pill className="w-3 h-3" /> Medicines Mentioned
          </p>
          <div className="flex flex-wrap gap-2">
            {summary.medicines.map((m, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs border border-emerald-500/20 bg-emerald-500/5 text-emerald-300/80"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {summary.dosage && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
            Dosage / Instructions
          </p>
          <p className="text-sm text-white/70 leading-relaxed">{summary.dosage}</p>
        </div>
      )}

      {summary.notes && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
            Precautions / Notes
          </p>
          <p className="text-sm text-white/70 leading-relaxed">{summary.notes}</p>
        </div>
      )}

      {summary.rawSummary &&
        !summary.patientOverview &&
        !summary.medicines?.length && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">
              Raw Summary
            </p>
            <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
              {summary.rawSummary}
            </p>
          </div>
        )}
    </div>
  );
}

function PredictionPanel({ prediction }: { prediction: PredictionResult }) {
  if (prediction.warning) {
    return (
      <div className="text-center py-10 px-6 border border-white/10 bg-white/5 rounded-xl">
        <FlaskConical className="w-10 h-10 text-orange-500/50 mx-auto mb-4" />
        <p className="text-sm text-orange-200/90 font-medium mb-2">Service Unavailable</p>
        <p className="text-xs text-white/50 leading-relaxed">{prediction.warning}</p>
      </div>
    );
  }

  if (!prediction.topPredictions.length) {
    return (
      <div className="text-center py-10">
        <FlaskConical className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/40">No predictions available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Main prediction highlight */}
      <div className="border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-[0.06] pointer-events-none">
          <FlaskConical className="w-20 h-20" />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
          Primary Prediction
        </p>
        <p className="text-2xl font-heading italic text-white mb-2">
          {prediction.mainPrediction}
        </p>
        <div className="flex items-center gap-3">
          <ProgressBar value={prediction.mainConfidence} color="rgba(255,255,255,0.9)" />
          <span className="text-sm text-white font-medium w-12 text-right shrink-0">
            {prediction.mainConfidence}%
          </span>
        </div>
      </div>

      {/* Top predictions list */}
      {prediction.topPredictions.length > 1 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-3">
            Top Predictions
          </p>
          <div className="space-y-3">
            {prediction.topPredictions.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-4 shrink-0">{i + 1}</span>
                <span className="text-sm text-white/80 flex-1 min-w-0 truncate">
                  {p.disease}
                </span>
                <div className="w-24">
                  <ProgressBar
                    value={p.confidence}
                    color={i === 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)"}
                  />
                </div>
                <span className="text-xs text-white/50 w-10 text-right shrink-0">
                  {p.confidence}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-white/20 leading-relaxed">
        Predictions are generated by AI and are for informational purposes only.
        Always consult a qualified medical professional for diagnosis.
      </p>
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────────────

interface PrescriptionAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrescriptionAnalysisModal({
  isOpen,
  onClose,
}: PrescriptionAnalysisModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // OCR state
  const [ocrProgress, setOcrProgress] = useState<OcrProgress>({ status: "", progress: 0 });
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrDone, setOcrDone] = useState(false);

  // Analysis state
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Active tab in results
  const [activeTab, setActiveTab] = useState<"summary" | "prediction">("summary");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileError(null);
    setOcrProgress({ status: "", progress: 0 });
    setOcrLoading(false);
    setOcrText("");
    setOcrDone(false);
    setSummaryLoading(false);
    setPredictionLoading(false);
    setSummaryResult(null);
    setPredictionResult(null);
    setSummaryError(null);
    setPredictionError(null);
    setActiveTab("summary");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // ── File selection ──────────────────────────────────────────────────────

  const applyFile = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setFileError(err);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setOcrDone(false);
    setOcrText("");
  };

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) applyFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  };

  // ── OCR ────────────────────────────────────────────────────────────────

  const runOcr = async () => {
    if (!selectedFile) return;

    setStep("ocr");
    setOcrLoading(true);
    setOcrDone(false);
    setOcrText("");
    setOcrProgress({ status: "Preparing image…", progress: 5 });

    let worker: any = null;

    try {
      const processedImage = await preprocessImage(selectedFile);

      setOcrProgress({ status: "Loading OCR engine…", progress: 15 });

      const { createWorker, PSM } = await import("tesseract.js");

      worker = await createWorker("eng", 1, {
        logger: (m: any) => {
          if (m.status === "recognizing text") {
            setOcrProgress({
              status: "Recognising text…",
              progress: Math.min(95, Math.round(m.progress * 70) + 25),
            });
          } else if (m.status === "loading language traineddata") {
            setOcrProgress({ status: "Loading language model…", progress: 20 });
          } else if (m.status === "initializing api") {
            setOcrProgress({ status: "Initialising OCR engine…", progress: 25 });
          }
        },
      });

      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        preserve_interword_spaces: "1",
      });

      setOcrProgress({ status: "Scanning image…", progress: 35 });

      const { data } = await worker.recognize(processedImage);

      const cleanedText = data.text
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      setOcrText(cleanedText);
      setOcrDone(true);
      setOcrProgress({ status: "Done", progress: 100 });
    } catch (err) {
      console.error("[OCR]", err);
      setOcrText("");
      setOcrDone(false);
      setOcrProgress({ status: "OCR failed", progress: 0 });
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setOcrLoading(false);
    }
  };

  // ── Analysis ────────────────────────────────────────────────────────────

  const runAnalysis = async () => {
    const textToAnalyze = ocrText.trim();
    if (!textToAnalyze) return;

    setStep("results");
    setSummaryResult(null);
    setPredictionResult(null);
    setSummaryError(null);
    setPredictionError(null);
    setSummaryLoading(true);
    setPredictionLoading(true);

    // 1. First get the summary (which extracts structured symptoms)
    let summaryData: SummaryResult | null = null;
    try {
      summaryData = await fetchMedicalSummary(textToAnalyze);
      setSummaryResult(summaryData);
      setIsSaved(false); // Reset saved status on fresh analysis
    } catch (err) {
      setSummaryError((err as Error).message ?? "Summary failed");
    }
    setSummaryLoading(false);

    // 2. Use extracted symptoms for prediction, fallback to raw text if none extracted
    const extractedSymptoms = summaryData?.symptoms?.join(", ") || textToAnalyze;

    try {
      const predData = await fetchDiseasePrediction(extractedSymptoms);
      setPredictionResult(predData);
    } catch (err) {
      setPredictionError((err as Error).message ?? "Prediction failed");
    }
    setPredictionLoading(false);
  };

  const handleSaveSummary = async () => {
    if (!summaryResult || isSaved) return;
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/patient/save-ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryText: JSON.stringify(summaryResult) }),
      });
      
      if (res.ok) {
        setIsSaved(true);
      } else {
        console.error("Failed to save summary:", await res.text());
      }
    } catch (err) {
      console.error("Network error when saving summary:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const anyLoading = ocrLoading || summaryLoading || predictionLoading;
  const canRunOcr = !!selectedFile && !ocrLoading;
  const canAnalyze = ocrDone && ocrText.trim().length > 0 && !anyLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-violet-500/25 bg-violet-500/10">
              <Sparkles className="w-4 h-4 text-violet-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Prescription Analysis</h2>
              <p className="text-xs text-white/40">
                Upload a prescription to generate OCR summary and disease predictions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StepIndicator current={step} />
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 rounded-sm ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ══ STEP: UPLOAD ══════════════════════════════════════════════ */}
          {step === "upload" && (
            <div className="p-6 space-y-5">
              {/* Drop zone */}
              <div>
                <label className="block text-xs text-white/50 mb-2 uppercase tracking-widest">
                  Prescription Image
                </label>
                <div
                  className={`relative border-2 border-dashed p-0 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                    dragOver
                      ? "border-violet-500/50 bg-violet-500/5"
                      : "border-white/15 hover:border-white/30"
                  }`}
                  style={{ minHeight: 200 }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                  />

                  {previewUrl ? (
                    // Image preview
                    <div className="relative w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Prescription preview"
                        className="w-full object-contain max-h-64"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
                        <p className="text-xs text-white/70 font-medium truncate max-w-[70%]">
                          {selectedFile?.name}
                        </p>
                        <span className="text-[10px] text-white/40 ml-2 shrink-0">
                          Click to change
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-10 text-center">
                      <ImageIcon className="w-10 h-10 text-white/15" />
                      <div>
                        <p className="text-sm text-white/50">
                          Drop prescription image here, or click to browse
                        </p>
                        <p className="text-xs text-white/25 mt-1">
                          JPG, PNG, WebP · Max {MAX_SIZE_MB} MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {fileError && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <p className="text-xs text-red-400">{fileError}</p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex items-start gap-2.5 px-4 py-3 border border-white/8 bg-white/[0.02]">
                <FileText className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                <p className="text-xs text-white/40 leading-relaxed">
                  Upload a clear photo of a medical prescription or lab report. The AI will
                  extract text using browser-based OCR, then generate a clinical summary
                  and disease predictions.
                </p>
              </div>
            </div>
          )}

          {/* ══ STEP: OCR ═════════════════════════════════════════════════ */}
          {step === "ocr" && (
            <div className="p-6 space-y-5">
              {/* Preview thumbnail */}
              {previewUrl && (
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Prescription"
                    className="w-24 h-24 object-cover border border-white/10 shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium truncate">
                      {selectedFile?.name}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {((selectedFile?.size ?? 0) / 1024).toFixed(0)} KB ·{" "}
                      {selectedFile?.type}
                    </p>

                    {/* OCR Progress */}
                    {ocrLoading && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                          <p className="text-xs text-white/60">{ocrProgress.status}</p>
                        </div>
                        <ProgressBar
                          value={ocrProgress.progress}
                          color="rgba(139,92,246,0.8)"
                        />
                      </div>
                    )}

                    {ocrDone && !ocrLoading && (
                      <div className="flex items-center gap-2 mt-4">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <p className="text-xs text-emerald-400">OCR complete</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* OCR text area */}
              <div>
                <label className="block text-xs text-white/50 mb-2 uppercase tracking-widest">
                  {ocrDone ? "Extracted Text (editable)" : "Extracted Text"}
                </label>
                <textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  placeholder={
                    ocrLoading
                      ? "Scanning image\u2026"
                      : "Click \u2018Scan Prescription\u2019 to extract text from the image."
                  }
                  disabled={ocrLoading}
                  rows={12}
                  className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white/80 font-mono resize-none focus:outline-none focus:border-white/25 placeholder:text-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {ocrDone && ocrText.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1.5">
                    OCR completed but no text was detected. Try a clearer image.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ══ STEP: RESULTS ═════════════════════════════════════════════ */}
          {step === "results" && (
            <div className="p-6">
              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-6">
                {(["summary", "prediction"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 text-xs uppercase tracking-widest font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? "border-white text-white"
                        : "border-transparent text-white/40 hover:text-white/70"
                    }`}
                  >
                    {tab === "summary" ? "Clinical Summary" : "Disease Predictions"}
                  </button>
                ))}
              </div>

              {/* Summary tab */}
              {activeTab === "summary" && (
                <>
                  {summaryLoading && (
                    <div className="flex flex-col items-center py-14 gap-4">
                      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                      <p className="text-sm text-white/50">Generating clinical summary…</p>
                    </div>
                  )}
                  {!summaryLoading && summaryError && (
                    <div className="flex items-start gap-3 px-4 py-3 border border-red-500/20 bg-red-500/5">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-red-400 font-medium">Summary failed</p>
                        <p className="text-xs text-white/40 mt-0.5">{summaryError}</p>
                      </div>
                    </div>
                  )}
                  {!summaryLoading && summaryResult && (
                    <SummaryPanel summary={summaryResult} />
                  )}
                </>
              )}

              {/* Prediction tab */}
              {activeTab === "prediction" && (
                <>
                  {predictionLoading && (
                    <div className="flex flex-col items-center py-14 gap-4">
                      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                      <p className="text-sm text-white/50">Running disease prediction model…</p>
                    </div>
                  )}
                  {!predictionLoading && predictionError && (
                    <div className="flex items-start gap-3 px-4 py-3 border border-red-500/20 bg-red-500/5">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-red-400 font-medium">Prediction failed</p>
                        <p className="text-xs text-white/40 mt-0.5">{predictionError}</p>
                      </div>
                    </div>
                  )}
                  {!predictionLoading && predictionResult && (
                    <PredictionPanel prediction={predictionResult} />
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-white/10 shrink-0">
          {/* Left: Reset/Back */}
          {step !== "upload" && (
            <button
              onClick={handleReset}
              disabled={anyLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-white/40 border border-white/10 hover:text-white hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-3 h-3" />
              Start Over
            </button>
          )}

          <div className="flex-1" />

          {/* Right: Primary action */}
          {step === "upload" && (
            <button
              onClick={runOcr}
              disabled={!canRunOcr}
              id="btn-scan-prescription"
              className="px-6 py-2.5 text-xs font-medium flex items-center gap-2 bg-white text-black hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ScanText className="w-3.5 h-3.5" />
              Scan Prescription
            </button>
          )}

          {step === "ocr" && (
            <button
              onClick={ocrDone ? runAnalysis : runOcr}
              disabled={ocrLoading}
              id="btn-analyze-prescription"
              className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                ocrDone
                  ? "bg-violet-500 text-white hover:bg-violet-400"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {ocrLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Scanning…
                </>
              ) : ocrDone ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze Prescription
                </>
              ) : (
                <>
                  <ScanText className="w-3.5 h-3.5" />
                  Scan Prescription
                </>
              )}
            </button>
          )}

          {step === "results" && !anyLoading && (
            <div className="flex gap-3">
              <button
                onClick={handleSaveSummary}
                disabled={isSaving || isSaved}
                className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 transition-all ${
                  isSaved
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed"
                    : "bg-indigo-500 text-white hover:bg-indigo-400 border border-transparent shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                }`}
              >
                {isSaving ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                ) : isSaved ? (
                  <><Sparkles className="w-3.5 h-3.5" /> Saved to DB</>
                ) : (
                  <><Activity className="w-3.5 h-3.5" /> Push to DB</>
                )}
              </button>
              <button
                onClick={() => {
                  // Re-run analysis
                  setSummaryResult(null);
                  setPredictionResult(null);
                  runAnalysis();
                }}
                className="px-6 py-2.5 text-xs font-medium flex items-center gap-2 bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-analyze
              </button>
            </div>
          )}

          {/* Cancel / Close */}
          <button
            onClick={handleClose}
            className="px-4 py-2.5 text-xs text-white/50 border border-white/10 hover:text-white hover:border-white/30 transition-all"
          >
            {step === "results" ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
