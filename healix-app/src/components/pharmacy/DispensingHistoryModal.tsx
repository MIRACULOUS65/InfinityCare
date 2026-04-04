"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Clock, User, Pill, List } from "lucide-react";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface DispensingLog {
  id: string;
  prescriptionId: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  medicines: Medicine[];
  dispensedAt: string;
  createdAt: string;
}

interface DispensingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DispensingHistoryModal({ isOpen, onClose }: DispensingHistoryModalProps) {
  const [logs, setLogs] = useState<DispensingLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch("/api/pharmacy/log-dispensing")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLogs(data.logs);
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
            <div className="w-8 h-8 flex items-center justify-center border border-teal-500/30 bg-teal-500/10 text-teal-400">
              <List className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Dispensing History</h2>
              <p className="text-xs text-white/40">All prescriptions you have scanned and dispensed</p>
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
              Loading dispensing history...
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/30 text-xs border border-dashed border-white/10">
              <List className="w-8 h-8 text-white/15" />
              No prescriptions dispensed yet. Scan a prescription QR to begin.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="border border-white/10 bg-black p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border border-white/10 bg-black flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-white/50" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{log.patientName}</p>
                      <p className="text-[10px] text-white/30 font-mono">Prescribed by Dr. {log.doctorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(log.dispensedAt || log.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(log.medicines as Medicine[]).map((med, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-mono">
                      <Pill className="w-3 h-3" />
                      {med.name} {med.dosage && `(${med.dosage})`}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
