"use client";

import { X, Hash, Clock, Package, Building2, MapPin } from "lucide-react";

interface RegisteredMedicine {
  id: string;
  name: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  hash: string;
  registeredAt: string;
  status: string;
}

interface RegisteredMedicinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: RegisteredMedicine[];
  isLoading: boolean;
}

export function RegisteredMedicinesModal({
  isOpen,
  onClose,
  medicines,
  isLoading,
}: RegisteredMedicinesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl mx-4 bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white/20 flex items-center justify-center bg-white/5">
              <Hash className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Authenticity Registry</h2>
              <p className="text-xs text-white/40">
                View your registered medicine batches and their cryptographic fingerprints.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-black/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
              <p className="text-xs text-white/50 uppercase tracking-widest">
                Loading blockchain records...
              </p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-white/10 bg-black/20">
              <Package className="w-10 h-10 text-white/10" />
              <div className="text-center">
                <p className="text-sm text-white/80 font-medium mb-1">No medicines registered</p>
                <p className="text-xs text-white/40">
                  Use the "Register Medicine" feature to securely mint a batch on Algorand.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {medicines.map((med) => (
                <div
                  key={med.hash}
                  className="group flex flex-col p-5 border border-white/10 bg-black hover:border-white/20 transition-all font-mono"
                >
                  <div className="flex flex-wrap md:flex-nowrap justify-between gap-4 mb-4 pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide mb-1 font-sans">
                        {med.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-white/50 font-sans">
                        <Building2 className="w-3 h-3" />
                        {med.manufacturer}
                        <span className="text-white/20">•</span>
                        <span className="uppercase text-[10px] tracking-widest bg-white/10 px-1.5 py-0.5 text-white/70">
                          Batch: {med.batchNumber}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-green-400 font-sans">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        {med.status.replace("_", " ")}
                      </div>
                      <div className="text-[10px] text-white/30 flex items-center gap-1 font-sans">
                        <Clock className="w-3 h-3" />
                        {new Date(med.registeredAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-sm">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      Algorand Transaction Hash
                    </div>
                    <div className="text-xs text-white/70 break-all select-all">
                      {med.hash}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5 font-sans">
                    <div className="flex gap-4 text-[10px] text-white/40">
                      <div>
                        QTY: <span className="text-white">{med.quantity}</span>
                      </div>
                      <div>
                        EXP: <span className="text-white">{new Date(med.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <a
                      href={`https://testnet.algoexplorer.io/tx/${med.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#FFF04D] hover:text-[#fff68f] underline underline-offset-4 decoration-[#FFF04D]/30 hover:decoration-[#FFF04D]"
                    >
                      Verify on AlgoExplorer ↗
                    </a>
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
