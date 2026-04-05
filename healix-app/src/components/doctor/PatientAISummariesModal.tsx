"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Sparkles, User, FileText, ChevronDown, ChevronUp, Pill, Activity } from "lucide-react";

interface SummaryResult {
  patientOverview?: string;
  symptoms?: string[];
  medicines?: string[];
  dosage?: string;
  notes?: string;
  rawSummary?: string;
  warning?: string;
}

interface PatientSummary {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  summaryText: string;
  createdAt: string;
  parsedData?: SummaryResult;
}

interface PatientAISummariesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PatientAISummariesModal({ isOpen, onClose }: PatientAISummariesModalProps) {
  const [summaries, setSummaries] = useState<PatientSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch("/api/doctor/patient-summaries")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const parsed = data.summaries.map((s: PatientSummary) => {
            try {
              return { ...s, parsedData: JSON.parse(s.summaryText) };
            } catch {
              return { ...s, parsedData: undefined };
            }
          });
          setSummaries(parsed);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-violet-500/30 bg-violet-500/10 text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Patient Summaries</h2>
              <p className="text-xs text-white/40">Clinical history compiled via LLM models</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 rounded-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/40 text-xs">
              <Loader2 className="w-6 h-6 animate-spin" />
              Retrieving NLP histories...
            </div>
          ) : summaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/30 text-xs border border-dashed border-white/10">
              <FileText className="w-8 h-8 text-white/15" />
              No AI summaries found for your patients.
            </div>
          ) : (
            summaries.map((summary) => (
              <div key={summary.id} className="border border-white/10 bg-black">
                {/* Row header — clickable */}
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === summary.id ? null : summary.id)}
                  className="w-full px-5 py-4 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 border border-white/10 bg-black flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-white/50" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{summary.patientName}</p>
                      <p className="text-[10px] text-white/30 font-mono truncate">{summary.patientEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-0.5 font-bold">
                      {new Date(summary.createdAt).toLocaleDateString()}
                    </span>
                    {expandedId === summary.id ? (
                      <ChevronUp className="w-4 h-4 text-white/30" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/30" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {expandedId === summary.id && (
                  <div className="p-5 border-t border-white/10 space-y-4 bg-white/[0.01]">
                    {summary.parsedData ? (
                      <>
                        {summary.parsedData.patientOverview && (
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Overview</p>
                            <p className="text-sm text-white/80 leading-relaxed">{summary.parsedData.patientOverview}</p>
                          </div>
                        )}

                        {summary.parsedData.symptoms && summary.parsedData.symptoms.length > 0 && (
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 flex items-center gap-1.5">
                              <Activity className="w-3 h-3" /> Reported Symptoms
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {summary.parsedData.symptoms.map((s, idx) => (
                                <span key={idx} className="px-2 py-1 text-xs bg-white/5 border border-white/10 text-white/80 rounded-sm">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {summary.parsedData.medicines && summary.parsedData.medicines.length > 0 && (
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 flex items-center gap-1.5">
                              <Pill className="w-3 h-3" /> Extracted Medications
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {summary.parsedData.medicines.map((m, idx) => (
                                <span key={idx} className="px-2 py-1 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-sm">{m}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {(summary.parsedData.dosage || summary.parsedData.notes) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {summary.parsedData.dosage && (
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Dosage / Plan</p>
                                <p className="text-sm text-white/60 leading-relaxed">{summary.parsedData.dosage}</p>
                              </div>
                            )}
                            {summary.parsedData.notes && (
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-amber-500/50 mb-1.5">Precautions / Notes</p>
                                <p className="text-sm text-amber-200/60 leading-relaxed">{summary.parsedData.notes}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {summary.parsedData.rawSummary && !summary.parsedData.patientOverview && !summary.parsedData.medicines?.length && (
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Raw Extraction Output</p>
                            <p className="text-xs text-white/50 leading-relaxed whitespace-pre-wrap">{summary.parsedData.rawSummary}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-white/50 whitespace-pre-wrap">
                        {summary.summaryText}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
