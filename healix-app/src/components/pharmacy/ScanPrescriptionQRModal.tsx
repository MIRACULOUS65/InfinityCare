"use client";

import { useEffect, useState, useRef } from "react";
import { X, QrCode, Loader2, User, Pill, Clock, RefreshCw, AlertTriangle } from "lucide-react";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionData {
  type: string;
  prescriptionId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  medicines: Medicine[];
  instructions: string | null;
  issuedAt: string;
}

interface ScanPrescriptionQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ScanStatus = "idle" | "scanning" | "decoding" | "success" | "error";

export function ScanPrescriptionQRModal({ isOpen, onClose }: ScanPrescriptionQRModalProps) {
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<PrescriptionData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setScanStatus("scanning");
    } else {
      setScanStatus("idle");
      setResult(null);
      setErrorMessage("");
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (scanStatus === "scanning" && isOpen) {
      import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
        const container = document.getElementById("rx-qr-reader");
        if (container && !scannerRef.current) {
          const scanner = new Html5QrcodeScanner(
            "rx-qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
          );
          scannerRef.current = scanner;

          scanner.render(
            (decodedText: string) => {
              handleScannedData(decodedText);
            },
            () => {}
          );
        }
      });
    }

    return () => {
      if (scanStatus !== "scanning" && scannerRef.current) {
        try {
          scannerRef.current.clear().catch(console.error);
          scannerRef.current = null;
          const container = document.getElementById("rx-qr-reader");
          if (container) container.innerHTML = "";
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [scanStatus, isOpen]);

  const handleScannedData = async (text: string) => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.clear();
        scannerRef.current = null;
      }

      setScanStatus("decoding");
      const parsed = JSON.parse(text);

      if (parsed.type !== "HEALIX_PRESCRIPTION" || !parsed.prescriptionId) {
        throw new Error("Not a valid Healix prescription QR code.");
      }

      // Fetch the full prescription details from the database using the ID
      const res = await fetch(`/api/pharmacy/prescriptions/${parsed.prescriptionId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch prescription details from server.");
      }

      const fullPrescription: PrescriptionData = data.prescription;
      setResult(fullPrescription);

      // Log this scan as a dispensing event
      await fetch("/api/pharmacy/log-dispensing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescriptionId: fullPrescription.prescriptionId,
          patientName: fullPrescription.patientName,
          patientId: fullPrescription.patientId,
          doctorName: fullPrescription.doctorName,
          doctorId: fullPrescription.doctorId,
          medicines: fullPrescription.medicines,
        }),
      });

      setScanStatus("success");
    } catch (err: any) {
      console.error(err);
      setScanStatus("error");
      setErrorMessage(err.message || "Invalid or unrecognized QR code format.");
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMessage("");
    setScanStatus("scanning");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-teal-500/30 bg-teal-500/10 text-teal-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Scan Prescription QR</h2>
              <p className="text-xs text-white/40">Decode a doctor-issued QR to view prescription details</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 rounded-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black flex flex-col p-6 min-h-[400px]">

          {scanStatus === "scanning" && (
            <div className="flex-1 flex flex-col">
              <div className="mb-4 text-center">
                <p className="text-sm text-white/80 font-medium">Point Camera at Prescription QR</p>
                <p className="text-xs text-white/40 mt-1">Scan the QR code generated by a doctor to decode the prescription.</p>
              </div>
              <div
                id="rx-qr-reader"
                className="w-full max-w-sm mx-auto overflow-hidden rounded-md border-2 border-dashed border-white/20 bg-[#0f0f0f] flex-1 min-h-[300px]"
              ></div>
            </div>
          )}

          {scanStatus === "decoding" && (
            <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
              <div className="text-center">
                <h3 className="text-sm font-bold text-white mb-1">Decoding Prescription</h3>
                <p className="text-xs text-white/50 font-mono">Extracting medicine vector data...</p>
              </div>
            </div>
          )}

          {scanStatus === "success" && result && (
            <div className="flex-1 space-y-6 animate-in fade-in duration-300">
              {/* Patient & Doctor Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Patient</span>
                  </div>
                  <p className="text-sm font-bold text-white">{result.patientName}</p>
                  <p className="text-[10px] text-white/30 font-mono mt-0.5">ID: {result.patientId}</p>
                </div>
                <div className="p-4 border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Doctor</span>
                  </div>
                  <p className="text-sm font-bold text-white">Dr. {result.doctorName}</p>
                  <p className="text-[10px] text-white/30 font-mono mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(result.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Medicines */}
              <div className="space-y-2">
                <h4 className="text-xs text-white/60 font-bold uppercase tracking-widest">Prescribed Medicines</h4>
                {result.medicines.map((med, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/5 border border-white/5">
                    <div className="w-6 h-6 flex items-center justify-center border border-teal-500/30 bg-teal-500/10 text-teal-400 text-[10px] font-bold shrink-0">
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
              </div>

              {result.instructions && (
                <div className="p-3 border border-amber-500/20 bg-amber-500/5 text-xs text-amber-200/80">
                  <span className="font-bold text-amber-400 text-[10px] uppercase tracking-widest">Instructions: </span>
                  {result.instructions}
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Scan Another Prescription
              </button>
            </div>
          )}

          {scanStatus === "error" && (
            <div className="flex-1 flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-500 uppercase tracking-widest">Invalid QR</h3>
              <p className="text-xs text-white/50 text-center max-w-sm">{errorMessage}</p>
              <button
                onClick={handleReset}
                className="mt-4 px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
