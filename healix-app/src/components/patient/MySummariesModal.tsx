"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X, Loader2, FileText, ChevronDown, ChevronUp, Share2, User,
  Sparkles, Activity, Pill, CheckCircle2, Search, XCircle
} from "lucide-react";

interface SummaryData {
  patientOverview?: string;
  symptoms?: string[];
  medicines?: string[];
  dosage?: string;
  notes?: string;
}

interface AISummary {
  id: string;
  summaryText: string;
  sharedWithDoctorId: string | null;
  createdAt: string;
}

interface DoctorResult {
  id: string;
  name: string;
  email: string;
}

interface MySummariesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MySummariesModal({ isOpen, onClose }: MySummariesModalProps) {
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null); // which summary is showing share UI
  const [doctorQuery, setDoctorQuery] = useState("");
  const [doctorResults, setDoctorResults] = useState<DoctorResult[]>([]);
  const [searchingDoctors, setSearchingDoctors] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null); // which summary is being shared right now
  const [sharedDoctorNames, setSharedDoctorNames] = useState<Record<string, string>>({});

  const fetchSummaries = useCallback(() => {
    setIsLoading(true);
    fetch("/api/patient/my-summaries")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSummaries(data.summaries);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchSummaries();
  }, [isOpen, fetchSummaries]);

  // Search doctors — loads all on open, filters by query
  const fetchDoctors = useCallback(async (q: string) => {
    setSearchingDoctors(true);
    try {
      const res = await fetch(`/api/patient/search-doctors?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) setDoctorResults(data.doctors || []);
    } catch { /* ignore */ } finally {
      setSearchingDoctors(false);
    }
  }, []);

  // Load all doctors when share panel opens
  useEffect(() => {
    if (!sharingId) return;
    fetchDoctors("");
  }, [sharingId, fetchDoctors]);

  // Filter as user types
  useEffect(() => {
    if (!sharingId) return;
    const timeout = setTimeout(() => fetchDoctors(doctorQuery), 300);
    return () => clearTimeout(timeout);
  }, [doctorQuery, sharingId, fetchDoctors]);

  const handleShare = async (summaryId: string, doctor: DoctorResult) => {
    setSharing(summaryId);
    try {
      const res = await fetch("/api/patient/share-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId, doctorId: doctor.id }),
      });
      if (res.ok) {
        setSummaries((prev) =>
          prev.map((s) => s.id === summaryId ? { ...s, sharedWithDoctorId: doctor.id } : s)
        );
        setSharedDoctorNames((prev) => ({ ...prev, [summaryId]: doctor.name }));
        setSharingId(null);
        setDoctorQuery("");
        setDoctorResults([]);
      }
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setSharing(null);
    }
  };

  const handleUnshare = async (summaryId: string) => {
    setSharing(summaryId);
    try {
      const res = await fetch("/api/patient/share-summary", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId }),
      });
      if (res.ok) {
        setSummaries((prev) =>
          prev.map((s) => s.id === summaryId ? { ...s, sharedWithDoctorId: null } : s)
        );
        setSharedDoctorNames((prev) => {
          const next = { ...prev };
          delete next[summaryId];
          return next;
        });
      }
    } catch (err) {
      console.error("Unshare failed:", err);
    } finally {
      setSharing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">My AI Summaries</h2>
              <p className="text-xs text-white/40">View and share your clinical history with a doctor</p>
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
              Loading your summaries…
            </div>
          ) : summaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/30 text-xs border border-dashed border-white/10">
              <Sparkles className="w-8 h-8 text-white/10" />
              <p>No summaries yet. Scan a prescription to generate one.</p>
            </div>
          ) : (
            summaries.map((summary) => {
              let parsed: SummaryData | undefined;
              try { parsed = JSON.parse(summary.summaryText); } catch { /* ignore */ }
              const isShared = !!summary.sharedWithDoctorId;
              const sharedName = sharedDoctorNames[summary.id];

              return (
                <div key={summary.id} className="border border-white/10 bg-black">
                  {/* Row header */}
                  <div className="px-5 py-4 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.03] transition-colors">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === summary.id ? null : summary.id)}
                      className="flex items-center gap-3 overflow-hidden flex-1 text-left"
                    >
                      <div className="w-8 h-8 border border-white/10 bg-black flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-white/40" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">
                          {parsed?.patientOverview || "Clinical Summary"}
                        </p>
                        <p className="text-[10px] text-white/30 font-mono">
                          {new Date(summary.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {/* Share status badge */}
                      {isShared ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Shared{sharedName ? ` with Dr. ${sharedName}` : ""}
                          </span>
                          <button
                            onClick={() => handleUnshare(summary.id)}
                            disabled={sharing === summary.id}
                            className="text-[10px] text-white/30 hover:text-red-400 transition-colors px-1"
                            title="Revoke access"
                          >
                            {sharing === summary.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setSharingId(sharingId === summary.id ? null : summary.id); setDoctorQuery(""); setDoctorResults([]); }}
                          className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 font-medium flex items-center gap-1 hover:bg-indigo-500/20 transition-colors"
                        >
                          <Share2 className="w-3 h-3" />
                          Share
                        </button>
                      )}

                      <button onClick={() => setExpandedId(expandedId === summary.id ? null : summary.id)} className="text-white/20 hover:text-white/50 transition-colors">
                        {expandedId === summary.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Share panel */}
                  {sharingId === summary.id && !isShared && (
                    <div className="px-5 py-4 border-t border-indigo-500/20 bg-indigo-500/5 space-y-3">
                      <p className="text-[11px] text-indigo-300/70 font-medium">Search for your doctor by name or email</p>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                        <input
                          value={doctorQuery}
                          onChange={(e) => setDoctorQuery(e.target.value)}
                          placeholder="Dr. Sharma, doctor@hospital.com …"
                          className="w-full bg-black border border-white/10 pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50"
                        />
                        {searchingDoctors && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 animate-spin" />}
                      </div>

                      {doctorResults.length > 0 && (
                        <div className="space-y-1">
                          {doctorResults.map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() => handleShare(summary.id, doc)}
                              disabled={sharing === summary.id}
                              className="w-full flex items-center gap-3 px-3 py-2.5 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all text-left"
                            >
                              <div className="w-7 h-7 border border-white/10 flex items-center justify-center bg-black shrink-0">
                                <User className="w-3 h-3 text-white/40" />
                              </div>
                              <div className="overflow-hidden flex-1">
                                <p className="text-xs font-medium text-white truncate">{doc.name}</p>
                                <p className="text-[10px] text-white/30 font-mono truncate">{doc.email}</p>
                              </div>
                              {sharing === summary.id
                                ? <Loader2 className="w-3 h-3 text-indigo-400 animate-spin shrink-0" />
                                : <Share2 className="w-3 h-3 text-indigo-400 shrink-0" />
                              }
                            </button>
                          ))}
                        </div>
                      )}

                      {!searchingDoctors && doctorResults.length === 0 && (
                        <p className="text-[11px] text-white/30 text-center py-2">
                          {doctorQuery.length > 0
                            ? `No doctors found matching "${doctorQuery}"`
                            : "No doctors registered in the system yet."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Expanded clinical data */}
                  {expandedId === summary.id && (
                    <div className="p-5 border-t border-white/10 space-y-4 bg-white/[0.01]">
                      {parsed ? (
                        <>
                          {parsed.patientOverview && (
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Overview</p>
                              <p className="text-sm text-white/80 leading-relaxed">{parsed.patientOverview}</p>
                            </div>
                          )}
                          {parsed.symptoms && parsed.symptoms.length > 0 && (
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 flex items-center gap-1.5">
                                <Activity className="w-3 h-3" /> Symptoms
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {parsed.symptoms.map((s, i) => (
                                  <span key={i} className="px-2 py-1 text-xs bg-white/5 border border-white/10 text-white/80 rounded-sm">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {parsed.medicines && parsed.medicines.length > 0 && (
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 flex items-center gap-1.5">
                                <Pill className="w-3 h-3" /> Medications
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {parsed.medicines.map((m, i) => (
                                  <span key={i} className="px-2 py-1 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-sm">{m}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {parsed.dosage && (
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Dosage</p>
                              <p className="text-sm text-white/60">{parsed.dosage}</p>
                            </div>
                          )}
                          {parsed.notes && (
                            <div className="p-3 border border-amber-500/20 bg-amber-500/5">
                              <p className="text-[10px] uppercase tracking-widest text-amber-500/60 mb-1">Precautions</p>
                              <p className="text-sm text-amber-200/70">{parsed.notes}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-white/40 whitespace-pre-wrap">{summary.summaryText}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
