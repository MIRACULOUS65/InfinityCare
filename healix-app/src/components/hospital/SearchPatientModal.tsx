"use client";

import { useState } from "react";
import { X, Search, FileText, User, Download, Lock, Loader2, Info } from "lucide-react";

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

interface SearchPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPatientModal({ isOpen, onClose }: SearchPatientModalProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFetchingDocs, setIsFetchingDocs] = useState(false);
  const [documents, setDocuments] = useState<AccessibleDocument[] | null>(null);

  const resetState = () => {
    setQuery("");
    setPatients([]);
    setHasSearched(false);
    setSelectedPatient(null);
    setDocuments(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setPatients([]);
    setHasSearched(false);
    setSelectedPatient(null);
    setDocuments(null);

    try {
      const res = await fetch(`/api/hospital/search-patient?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const selectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setIsFetchingDocs(true);
    setDocuments(null);

    try {
      const res = await fetch("/api/hospital/patient-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setDocuments(data.documents);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error(err);
      setDocuments([]);
    } finally {
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
      <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-white/20 bg-white/5">
              <Search className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Patient Search</h2>
              <p className="text-xs text-white/40">Locate patient medical records by ID, Name or Email</p>
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
        <div className="flex flex-1 overflow-hidden min-h-[500px]">
          
          {/* Left panel: Search & Results */}
          <div className="w-1/2 border-r border-white/10 flex flex-col bg-black">
            <div className="p-6 border-b border-white/10 shrink-0">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Name, Email, or Patient ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="px-4 py-2 bg-white text-black text-xs font-bold uppercase disabled:opacity-50 hover:bg-white/90 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {isSearching ? (
                <div className="p-8 text-center text-white/50 text-xs flex flex-col justify-center items-center gap-2 h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                  Querying patient registry...
                </div>
              ) : hasSearched && patients.length === 0 ? (
                <div className="p-8 text-center text-white/50 text-xs h-full flex items-center justify-center flex-col gap-2">
                  <User className="w-8 h-8 text-white/20" />
                  No patients found matching your search.
                </div>
              ) : patients.length > 0 ? (
                <div className="space-y-1 p-2">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => selectPatient(patient)}
                      className={`w-full text-left p-4 flex items-center gap-4 transition-colors border ${
                        selectedPatient?.id === patient.id 
                          ? "bg-white/10 border-white/20 ring-1 ring-white/50" 
                          : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="w-10 h-10 border border-white/10 bg-black flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-white/50" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-white truncate">{patient.name}</p>
                        <p className="text-xs text-white/40 truncate font-mono mt-0.5">{patient.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-white/30 text-xs h-full flex flex-col items-center justify-center gap-3">
                  <Search className="w-8 h-8 text-white/10" />
                  Enter a query above to locate a patient.
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Patient Details & Documents */}
          <div className="w-1/2 flex flex-col bg-[#050505]">
            {!selectedPatient ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/30 text-xs gap-3">
                <FileText className="w-10 h-10 text-white/10" />
                Select a patient from the search results to view their accessible records. Automatic audit notifications will be issued upon access.
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Selected Patient Header */}
                <div className="p-6 bg-white/[0.02] border-b border-white/10 shrink-0">
                  <h3 className="font-bold text-lg text-white mb-1">{selectedPatient.name}</h3>
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
