"use client";

import { useState } from "react";
import { X, QrCode, ArrowLeft, Download, Package } from "lucide-react";
import QRCode from "qrcode";

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

interface CreateVerificationQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: RegisteredMedicine[];
  isLoading: boolean;
}

export function CreateVerificationQRModal({
  isOpen,
  onClose,
  medicines,
  isLoading,
}: CreateVerificationQRModalProps) {
  const [activeQr, setActiveQr] = useState<string | null>(null);
  const [activeMedicine, setActiveMedicine] = useState<RegisteredMedicine | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateQR = async (med: RegisteredMedicine) => {
    try {
      setIsGenerating(med.id);
      
      // The payload will hold the 3 main details as requested
      const payload = JSON.stringify({
        name: med.name,
        manufacturer: med.manufacturer,
        hash: med.hash,
      });

      // Generate a clean, high-contrast QR code
      const url = await QRCode.toDataURL(payload, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H", // High error correction for reliable scanning
      });

      setActiveQr(url);
      setActiveMedicine(med);
    } catch (err) {
      console.error("Failed to generate QR code", err);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadQR = () => {
    if (!activeQr || !activeMedicine) return;
    
    // Create a temporary link to download the image
    const link = document.createElement("a");
    link.href = activeQr;
    link.download = `healix-qr-${activeMedicine.name.toLowerCase().replace(/\s+/g, '-')}-${activeMedicine.batchNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setActiveQr(null);
    setActiveMedicine(null);
    onClose();
  };

  const handleBack = () => {
    setActiveQr(null);
    setActiveMedicine(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            {activeQr ? (
              <button
                onClick={handleBack}
                className="w-8 h-8 flex items-center justify-center border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-white mr-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center border border-blue-500/20 bg-blue-500/10">
                <QrCode className="w-4 h-4 text-blue-400" />
              </div>
            )}
            
            <div>
              <h2 className="text-sm font-bold text-white">
                {activeQr ? "Verification QR Code" : "Create Verification QR"}
              </h2>
              <p className="text-xs text-white/40">
                {activeQr 
                  ? "Scan to verify authenticity of this payload" 
                  : "Generate verifiable QR codes for your batches"}
              </p>
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
        <div className="flex-1 overflow-hidden flex flex-col bg-black">
          {activeQr && activeMedicine ? (
            // QR Code View
            <div className="flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar">
              <div className="bg-white p-4 mb-8">
                <img src={activeQr} alt="Verification QR Code" className="w-64 h-64 object-contain" />
              </div>
              
              <div className="w-full max-w-sm border border-white/10 bg-[#0f0f0f] p-5">
                <div className="text-center mb-5">
                  <h3 className="text-base font-bold text-white mb-1">{activeMedicine.name}</h3>
                  <p className="text-xs text-white/50">{activeMedicine.manufacturer}</p>
                </div>
                
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40 uppercase tracking-wider text-[10px]">Batch</span>
                    <span className="text-white/90">{activeMedicine.batchNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40 uppercase tracking-wider text-[10px]">Qty</span>
                    <span className="text-white/90">{activeMedicine.quantity} Units</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40 uppercase tracking-wider text-[10px]">Txn ID</span>
                    <span className="text-blue-400 truncate max-w-[180px]" title={activeMedicine.hash}>
                      {activeMedicine.hash.substring(0, 16)}...
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadQR}
                  className="w-full mt-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold font-sans uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </button>
              </div>
            </div>
          ) : (
            // List View
            <div className="overflow-y-auto p-4 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-[10px] text-blue-500/50 uppercase tracking-widest font-mono">
                    Loading batches...
                  </p>
                </div>
              ) : medicines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white/[0.01] border border-dashed border-white/10">
                  <Package className="w-10 h-10 text-white/10" />
                  <div className="text-center">
                    <p className="text-sm text-white/80 font-medium mb-1">No batches available</p>
                    <p className="text-xs text-white/40 max-w-sm">
                      Register a medicine first to generate a QR verification code.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {medicines.map((med) => (
                    <div 
                      key={med.hash} 
                      className="flex items-center justify-between p-4 border border-white/10 bg-[#0f0f0f] hover:border-white/20 transition-colors group"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-sm font-bold text-white truncate">{med.name}</h3>
                          <span className="text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 border border-blue-400/20 uppercase tracking-wider font-mono">
                            Qty: {med.quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                          <span className="truncate">{med.manufacturer}</span>
                          <span>•</span>
                          <span>Batch: {med.batchNumber}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleGenerateQR(med)}
                        disabled={isGenerating === med.id}
                        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-white text-black hover:bg-white/90 transition-all font-mono uppercase tracking-wider disabled:opacity-50"
                      >
                        {isGenerating === med.id ? (
                          <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                          <QrCode className="w-3 h-3" />
                        )}
                        {isGenerating === med.id ? "Generating" : "Generate QR"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
