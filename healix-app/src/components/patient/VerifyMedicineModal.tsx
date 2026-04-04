"use client";

import { useEffect, useState, useRef } from "react";
import { X, ShieldCheck, ShieldAlert, QrCode, Loader2, RefreshCw, ExternalLink, Building2, Package, Clock } from "lucide-react";

interface VerifyMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ScanStatus = "idle" | "scanning" | "verifying" | "success" | "error";

export function VerifyMedicineModal({ isOpen, onClose }: VerifyMedicineModalProps) {
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<any>(null);
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
        const container = document.getElementById("qr-reader");
        // Ensure we don't double mount the scanner in strict mode
        if (container && !scannerRef.current) {
          const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
          );
          scannerRef.current = scanner;

          scanner.render(
            (decodedText: string) => {
              handleScannedData(decodedText);
            },
            (error: any) => {
              // Ignore frame-level errors (usually "No QR Code found")
            }
          );
        }
      });
    }

    return () => {
      // If we are leaving the scanning state, stop the camera
      if (scanStatus !== "scanning" && scannerRef.current) {
        try {
          scannerRef.current.clear().catch(console.error);
          scannerRef.current = null;
          const container = document.getElementById("qr-reader");
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
      
      setScanStatus("verifying");
      const parsed = JSON.parse(text);
      
      if (!parsed.hash) {
        throw new Error("Invalid format");
      }

      const res = await fetch("/api/verify-medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash: parsed.hash })
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setScanStatus("error");
        setErrorMessage(data.message || "Counterfeit Detected: Medicine not found in blockchain registry.");
        return;
      }

      setResult(data.medicine);
      setScanStatus("success");
    } catch (err: any) {
      console.error(err);
      setScanStatus("error");
      setErrorMessage("Counterfeit or Invalid QR: Unrecognized signature format.");
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
            <div className="w-8 h-8 flex items-center justify-center border border-indigo-500/20 bg-indigo-500/10">
              <QrCode className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Trust Verifier</h2>
              <p className="text-xs text-white/40">Scan manufacturer QR code to verify medicine authenticity</p>
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
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black flex flex-col p-6 min-h-[400px]">
          
          {scanStatus === "scanning" && (
            <div className="flex-1 flex flex-col">
              <div className="mb-4 text-center">
                <p className="text-sm text-white/80 font-medium font-sans">Point Camera at QR Code</p>
                <p className="text-xs text-white/40 mt-1">Make sure the code is well lit and entirely within the frame.</p>
              </div>
              
              {/* html5-qrcode injects its own UI here. We apply minimal styling globally or via generic classes. */}
              <div 
                id="qr-reader" 
                className="w-full max-w-sm mx-auto overflow-hidden rounded-md border-2 border-dashed border-white/20 bg-[#0f0f0f] flex-1 min-h-[300px]"
              ></div>
            </div>
          )}

          {scanStatus === "verifying" && (
            <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <div className="text-center">
                <h3 className="text-sm font-bold text-white mb-1">Verifying Digital Signature</h3>
                <p className="text-xs text-white/50 font-mono">Cross-checking Algorand Testnet ledger...</p>
              </div>
            </div>
          )}

          {scanStatus === "success" && result && (
            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              
              <h3 className="text-xl font-bold text-emerald-400 mb-2 uppercase tracking-widest">
                Authentic Product
              </h3>
              <p className="text-sm text-white/60 mb-8 text-center max-w-md">
                This medicine has been cryptographic verified against the global Algorand blockchain ledger.
              </p>

              <div className="w-full max-w-md border border-white/10 bg-[#0f0f0f] rounded-none p-5 text-left mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                  <ShieldCheck className="w-32 h-32" />
                </div>
                
                <h4 className="font-bold text-white text-lg mb-1">{result.name}</h4>
                <div className="flex items-center gap-2 text-xs text-white/40 mb-6 font-mono">
                  <Building2 className="w-3 h-3" /> {result.manufacturer}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Batch Number</div>
                    <div className="text-white/80 p-2 bg-white/5 rounded-sm border border-white/5">{result.batchNumber}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Expiry Date</div>
                    <div className="text-white/80 p-2 bg-white/5 rounded-sm border border-white/5">
                      {new Date(result.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Registration Timestamp</div>
                    <div className="text-white/80 p-2 bg-white/5 rounded-sm border border-white/5 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-white/40" />
                      {new Date(result.registeredAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Algorand Txn Hash</div>
                    <div className="text-emerald-400/80 p-2 bg-emerald-400/10 rounded-sm border border-emerald-400/20 text-[10px] break-all select-all flex items-center justify-between">
                      {result.hash}
                      <a href={`https://testnet.algoexplorer.io/tx/${result.hash}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 ml-2">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Scan Another
              </button>
            </div>
          )}

          {scanStatus === "error" && (
            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 py-10">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-xl font-bold text-red-500 mb-2 uppercase tracking-widest">
                Counterfeit Warning!
              </h3>
              <p className="text-sm text-white/60 mb-6 text-center max-w-sm">
                {errorMessage}
              </p>

              <div className="bg-red-500/10 border border-red-500/20 p-4 w-full max-w-sm text-xs text-red-400/80 mb-8 rounded-sm">
                If you suspect this medicine is counterfeit, do not consume it. Please return it to the pharmacy and report the incident.
              </div>

              <button
                onClick={handleReset}
                className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Scan Another
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
