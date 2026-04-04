"use client";

import { useState } from "react";
import { X, Search, FileText, User, Download, Lock, Loader2, Info, ScanFace } from "lucide-react";
import { FaceCapture } from "@/components/auth/FaceCapture";

interface Patient {
  id: string;
  name: string;
  email: string;
}

interface AccessibleDocument {
  id: string;
  fileName: string;
  documentType: string;
  fileUrl: string;
  createdAt: string;
}

interface FaceMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FaceMatchModal({ isOpen, onClose }: FaceMatchModalProps) {
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFetchingDocs, setIsFetchingDocs] = useState(false);
  const [documents, setDocuments] = useState<AccessibleDocument[] | null>(null);

  const resetState = () => {
    setIsMatching(false);
    setMatchError(null);
    setSelectedPatient(null);
    setDocuments(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleCapture = async (file: File | null) => {
    if (!file) return;

    setIsMatching(true);
    setMatchError(null);
    setSelectedPatient(null);
    setDocuments(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // 1. Send to Local Python DeepFace Engine
      const matchRes = await fetch("http://localhost:5000/match", {
        method: "POST",
        body: formData,
      });
      
      const matchData = await matchRes.json();
      
      if (!matchRes.ok || !matchData.success) {
        throw new Error(matchData.error || "Face Match Failed");
      }

      const patientId = matchData.patient_id;

      // 2. Fetch Patient Details via standard Hospital API
      const searchRes = await fetch(`/api/hospital/search-patient?q=${encodeURIComponent(patientId)}`);
      const searchData = await searchRes.json();
      
      if (!searchRes.ok || !searchData.success || searchData.patients.length === 0) {
        throw new Error("Patient found in ML Cache but missing from DB Sandbox.");
      }

      const patient = searchData.patients[0];
      setSelectedPatient(patient);

      // 3. Fetch specific documents
      setIsFetchingDocs(true);
      const docsRes = await fetch("/api/hospital/patient-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id })
      });
      const docsData = await docsRes.json();
      
      if (docsRes.ok && docsData.success) {
        setDocuments(docsData.documents);
      } else {
        setDocuments([]);
      }
      setIsFetchingDocs(false);

    } catch (err: any) {
      console.error(err);
      setMatchError(err.message || "Failed to locate Patient.");
      setIsMatching(false);
      setIsFetchingDocs(false);
    }
  };

  const formatDocType = (type: string) => type.replace("_", " ");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <ScanFace className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Emergency Face ID Match</h2>
              <p className="text-xs text-white/40">Utilizing DeepFace Neural Networks for biometric cross-referencing</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-[500px]">
          
          {/* Left panel: Camera input */}
          <div className="w-full lg:w-1/2 border-r border-white/10 flex flex-col bg-black p-6 space-y-4">
             {!selectedPatient && !isMatching ? (
                 <FaceCapture onCapture={handleCapture} />
             ) : isMatching && !selectedPatient ? (
                <div className="flex-1 border border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center p-8 text-center text-emerald-400/80 text-xs gap-4">
                  <div className="w-16 h-16 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin shrink-0"></div>
                  <p className="font-mono tracking-widest uppercase">Abstracting Facial Vector Geometry...</p>
                  <p className="text-white/40 max-w-[250px]">Running multi-layer CNN calculations against local secure database cache.</p>
                </div>
             ) : (
                <div className="flex-1 border border-emerald-500/30 bg-emerald-500/10 flex flex-col items-center justify-center p-8 text-center text-emerald-400 text-xs gap-4">
                  <User className="w-12 h-12" />
                  <p className="font-bold text-lg">PATIENT IDENTIFIED</p>
                  <button 
                     onClick={() => {
                        setSelectedPatient(null);
                        setDocuments(null);
                        setIsMatching(false);
                     }}
                     className="mt-4 px-4 py-2 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all font-mono"
                  >
                     SCAN NEW PATIENT
                  </button>
                </div>
             )}

             {matchError && (
                 <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono text-center">
                     Match Error: {matchError}
                     <button onClick={() => setMatchError(null)} className="block mt-2 underline opacity-80 hover:opacity-100 mx-auto">Try Again</button>
                 </div>
             )}
          </div>

          {/* Right panel: Patient Details & Documents */}
          <div className="w-full lg:w-1/2 flex flex-col bg-[#050505]">
            {!selectedPatient ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/30 text-xs gap-3">
                <FileText className="w-10 h-10 text-white/10" />
                Capture a patient Face ID vector to autonomously unlock & decrypt their associated medical vault.
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Selected Patient Header */}
                <div className="p-6 bg-white/[0.02] border-b border-white/10 shrink-0">
                  <h3 className="font-bold text-lg text-emerald-400 mb-1 flex items-center gap-2">
                     {selectedPatient.name} 
                     <span className="text-[10px] bg-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-400/30">100% MATCH</span>
                  </h3>
                  <p className="text-xs text-white/40 font-mono mb-4">ID: {selectedPatient.id}</p>
                  
                  <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-emerald-400/80 bg-emerald-400/10 border border-emerald-400/20 px-3 py-2 shrink-0">
                    <Info className="w-3 h-3" />
                    Viewing these records actively generates an audit log and notifies the patient.
                  </div>
                </div>

                {/* Documents List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  {isFetchingDocs ? (
                    <div className="text-center text-white/50 text-xs flex flex-col justify-center items-center py-12 gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                      Fetching permitted medical documents...
                    </div>
                  ) : documents && documents.length === 0 ? (
                    <div className="text-center text-white/50 text-xs flex flex-col justify-center items-center py-12 gap-3 border border-white/10 bg-black/50 border-dashed">
                      <Lock className="w-8 h-8 text-white/20" />
                      This patient has no documents specifically accessible by hospitals. They must explicitly grant access to their medical records via their Patient Dashboard.
                    </div>
                  ) : documents ? (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="p-4 border border-white/10 bg-black flex items-center justify-between group hover:border-white/20 transition-all">
                          <div className="overflow-hidden pr-4">
                            <p className="text-sm font-bold text-white mb-1 truncate">{doc.fileName}</p>
                            <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                              <span className="uppercase tracking-widest text-white/60 bg-white/10 px-1 py-0.5 rounded-sm">
                                {formatDocType(doc.documentType)}
                              </span>
                              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-2 px-3 py-2 text-xs font-bold text-white/70 border border-white/15 hover:text-black hover:bg-white transition-all bg-white/5"
                          >
                            <Download className="w-3 h-3" />
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
