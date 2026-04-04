"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, Clock, User, QrCode, Download, Check } from "lucide-react";
import QRCode from "qrcode";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionItem {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorId: string;
  medicines: Medicine[];
  instructions: string | null;
  qrData: string | null;
  createdAt: string;
}

interface PrescriptionQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrescriptionQRModal({ isOpen, onClose }: PrescriptionQRModalProps) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch("/api/doctor/my-prescriptions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPrescriptions(data.prescriptions);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  const generateQR = useCallback(async (rx: PrescriptionItem) => {
    setGeneratingId(rx.id);

    // Build the QR payload — a much lighter JSON object so standard webcams can quickly scan it
    const qrPayload = JSON.stringify({
      type: "HEALIX_PRESCRIPTION",
      prescriptionId: rx.id,
    });

    try {
      // Generate QR code as Data URL
      const dataUrl = await QRCode.toDataURL(qrPayload, {
        width: 400,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });

      setQrImages((prev) => ({ ...prev, [rx.id]: dataUrl }));

      // Persist the QR data to the database
      const res = await fetch("/api/doctor/save-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionId: rx.id, qrData: qrPayload }),
      });
      if (res.ok) {
        setSavedIds((prev) => new Set(prev).add(rx.id));
      }
    } catch (err) {
      console.error("QR generation failed:", err);
    } finally {
      setGeneratingId(null);
    }
  }, []);

  const downloadQR = useCallback((prescriptionId: string, patientName: string) => {
    const dataUrl = qrImages[prescriptionId];
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `prescription_qr_${patientName.replace(/\s+/g, "_")}_${prescriptionId.slice(0, 8)}.png`;
    link.href = dataUrl;
    link.click();
  }, [qrImages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Prescription QR Generator</h2>
              <p className="text-xs text-white/40">Generate scannable QR codes for pharmacies to decode prescriptions</p>
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
              Loading your prescriptions...
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/30 text-xs border border-dashed border-white/10">
              <QrCode className="w-8 h-8 text-white/15" />
              No prescriptions to generate QR codes for. Write a prescription first.
            </div>
          ) : (
            prescriptions.map((rx) => (
              <div key={rx.id} className="border border-white/10 bg-black">
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 border border-white/10 bg-black flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-white/50" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{rx.patientName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono mt-0.5">
                        <span>{(rx.medicines as Medicine[]).length} medicine{(rx.medicines as Medicine[]).length !== 1 ? "s" : ""}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(rx.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {qrImages[rx.id] ? (
                      <>
                        {savedIds.has(rx.id) && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Saved
                          </span>
                        )}
                        <button
                          onClick={() => downloadQR(rx.id, rx.patientName)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white/70 border border-white/15 hover:text-black hover:bg-white transition-all bg-white/5 uppercase"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => generateQR(rx)}
                        disabled={generatingId === rx.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all uppercase disabled:opacity-50"
                      >
                        {generatingId === rx.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <QrCode className="w-3 h-3" />
                        )}
                        Generate QR
                      </button>
                    )}
                  </div>
                </div>

                {/* QR Preview */}
                {qrImages[rx.id] && (
                  <div className="px-5 pb-5 flex justify-center">
                    <div className="p-4 bg-white rounded-sm inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrImages[rx.id]} alt="Prescription QR" className="w-48 h-48" />
                    </div>
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
