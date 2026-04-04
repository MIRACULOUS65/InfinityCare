"use client";

import { X, Archive, ShieldCheck, Clock, CheckCircle2, ExternalLink } from "lucide-react";

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

interface AuthenticityRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: RegisteredMedicine[];
  isLoading: boolean;
}

export function AuthenticityRegistryModal({
  isOpen,
  onClose,
  medicines,
  isLoading,
}: AuthenticityRegistryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-6xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-emerald-500/20 flex items-center justify-center bg-emerald-500/10">
              <Archive className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Deep Authenticity Registry
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h2>
              <p className="text-xs text-white/40 mt-1">
                Comprehensive immutable ledger of all your registered medicine batches.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-black">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-xs text-emerald-500/50 uppercase tracking-widest font-mono">
                Syncing Ledger...
              </p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white/[0.01]">
              <Archive className="w-12 h-12 text-white/10" />
              <div className="text-center">
                <p className="text-sm text-white/80 font-medium mb-1">Registry is Empty</p>
                <p className="text-xs text-white/40 max-w-sm">
                  Register some medicines to see their immutable records appear in the blockchain ledger.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="sticky top-0 bg-[#0a0a0a] border-b border-white/10 z-10 shadow-sm">
                  <tr className="text-[10px] uppercase text-white/40 tracking-widest">
                    <th className="p-4 font-semibold w-[20%]">Medicine & Mfr</th>
                    <th className="p-4 font-semibold w-[15%]">Batch Info</th>
                    <th className="p-4 font-semibold w-[35%]">Algorand Txn Hash</th>
                    <th className="p-4 font-semibold w-[15%] text-center">Status</th>
                    <th className="p-4 font-semibold w-[15%] text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm font-sans bg-black">
                  {medicines.map((med) => (
                    <tr 
                      key={med.hash} 
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Name & Manufacturer */}
                      <td className="p-4 align-top">
                        <div className="font-bold text-white/90 mb-1">{med.name}</div>
                        <div className="text-xs text-white/40">{med.manufacturer}</div>
                      </td>

                      {/* Batch Info */}
                      <td className="p-4 align-top">
                        <div className="font-mono text-xs text-white/80 mb-1.5 bg-white/5 inline-block px-2 py-0.5 rounded-sm">
                          {med.batchNumber}
                        </div>
                        <div className="text-[10px] text-white/40 space-y-0.5">
                          <div>QTY: {med.quantity}</div>
                          <div>EXP: {new Date(med.expiryDate).toLocaleDateString()}</div>
                        </div>
                      </td>

                      {/* Hash */}
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-xs text-emerald-400/80 bg-emerald-400/10 px-2 py-1 select-all break-all rounded-sm border border-emerald-400/20">
                            {med.hash}
                          </code>
                        </div>
                        <a
                          href={`https://testnet.algoexplorer.io/tx/${med.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
                        >
                          View on AlgoExplorer <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>

                      {/* Status */}
                      <td className="p-4 align-top text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" />
                          {med.status.replace("_", " ")}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="p-4 align-top text-right text-[11px] text-white/50 font-mono flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 text-white/70">
                          <Clock className="w-3 h-3 opacity-50" />
                          {new Date(med.registeredAt).toLocaleDateString()}
                        </div>
                        <div className="text-white/30">
                          {new Date(med.registeredAt).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
