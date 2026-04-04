"use client";

import { useState, useEffect } from "react";
import { X, Pill, Loader2, Stethoscope, Clock } from "lucide-react";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionItem {
  id: string;
  doctorName: string;
  doctorId: string;
  medicines: Medicine[];
  instructions: string | null;
  createdAt: string;
}

interface ViewPrescriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ViewPrescriptionsModal({ isOpen, onClose }: ViewPrescriptionsModalProps) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch("/api/my-prescriptions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPrescriptions(data.prescriptions);
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
            <div className="w-8 h-8 flex items-center justify-center border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">My Prescriptions</h2>
              <p className="text-xs text-white/40">Prescriptions issued to you by hospital doctors</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 rounded-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/40 text-xs">
              <Loader2 className="w-6 h-6 animate-spin" />
              Loading prescriptions...
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/30 text-xs border border-dashed border-white/10">
              <Pill className="w-8 h-8 text-white/15" />
              No prescriptions have been issued to you yet.
            </div>
          ) : (
            prescriptions.map((rx) => (
              <div key={rx.id} className="border border-white/10 bg-black">
                {/* Prescription header */}
                <div className="px-5 py-4 flex items-center justify-between border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-4 h-4 text-indigo-400" />
                    <div>
                      <p className="text-sm font-bold text-white">Dr. {rx.doctorName}</p>
                      <p className="text-[10px] text-white/30 font-mono">ID: {rx.doctorId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(rx.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Medicines */}
                <div className="p-5 space-y-2">
                  {(rx.medicines as Medicine[]).map((med, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/5 border border-white/5">
                      <div className="w-6 h-6 flex items-center justify-center border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="text-white font-bold">{med.name}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/40 font-mono text-[10px]">
                          {med.dosage && <span>Dosage: {med.dosage}</span>}
                          {med.frequency && <span>Freq: {med.frequency}</span>}
                          {med.duration && <span>Duration: {med.duration}</span>}
                        </div>
                      </div>
                    </div>
                  ))}

                  {rx.instructions && (
                    <div className="mt-3 p-3 border border-amber-500/20 bg-amber-500/5 text-xs text-amber-200/80">
                      <span className="font-bold text-amber-400 text-[10px] uppercase tracking-widest">Instructions: </span>
                      {rx.instructions}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
