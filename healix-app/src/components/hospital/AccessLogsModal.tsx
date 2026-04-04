"use client";

import { useEffect, useState } from "react";
import { X, History, FileText, User, Clock, Loader2, Link as LinkIcon } from "lucide-react";

export interface AccessLogEntry {
  id: string;
  accessedAt: string;
  document: {
    fileName: string;
    documentType: string;
    patient: {
      id: string;
      name: string;
    };
  };
}

interface AccessLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessLogsModal({ isOpen, onClose }: AccessLogsModalProps) {
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/hospital/access-logs");
        const data = await res.json();
        if (data.success && data.logs) {
          setLogs(data.logs);
        }
      } catch (err) {
        console.error("Failed to fetch access logs", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [isOpen]);

  const formatDocType = (type: string) => type.replace("_", " ");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-white/20 bg-white/5">
              <History className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Immutable Access Logs</h2>
              <p className="text-xs text-white/40">Chronological history of all patient interactions and document retrievals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-black">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
              <p className="text-xs text-white/50 tracking-wide uppercase">Reading cryptographic logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <LinkIcon className="w-12 h-12 text-white/10" />
              <p className="text-sm font-bold text-white/60 tracking-wider">No Records Accessed</p>
              <p className="text-xs text-white/40 text-center max-w-xs">
                You have not viewed or retrieved any patient records on the ledger yet. Future actions will be independently verified and retained here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {logs.map((log) => (
                <div key={log.id} className="p-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center bg-black shrink-0 mt-1">
                    <History className="w-4 h-4 text-white/30" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-xs text-white/40 border border-white/10 bg-white/5 px-2 py-0.5 rounded-sm flex items-center gap-1 font-mono uppercase">
                          <User className="w-3 h-3" />
                          {log.document.patient.name}
                       </span>
                    </div>

                    <p className="text-sm text-white mb-2 leading-relaxed">
                      You accessed the document <span className="font-bold text-indigo-400">"{log.document.fileName}"</span> categorized as <span className="underline decoration-white/20 underline-offset-2">{formatDocType(log.document.documentType)}</span>.
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs font-mono text-white/30">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/20" />
                        {new Date(log.accessedAt).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-white/20" />
                        ID: {log.document.patient.id}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
