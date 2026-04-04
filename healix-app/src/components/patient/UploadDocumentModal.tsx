"use client";

import { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  CloudUpload,
} from "lucide-react";

const DOCUMENT_TYPES = [
  { value: "lab_report", label: "Lab Report" },
  { value: "prescription", label: "Prescription" },
  { value: "insurance", label: "Insurance Document" },
  { value: "discharge_summary", label: "Discharge Summary" },
  { value: "radiology", label: "Radiology / Scan" },
  { value: "vaccination", label: "Vaccination Record" },
  { value: "other", label: "Other" },
];

interface UploadedDocument {
  id: string;
  url: string;
  name: string;
  documentType: string;
  uploadedAt: string;
}

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  onUploadSuccess?: (doc: UploadedDocument) => void;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  patientId,
  onUploadSuccess,
}: UploadDocumentModalProps) {
  const [documentType, setDocumentType] = useState("other");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadStatus("idle");
    setErrorMessage("");
    setUploadedDoc(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus("uploading");
    setErrorMessage("");

    try {
      // 1. Get upload signature
      const sigRes = await fetch("/api/upload-signature");
      if (!sigRes.ok) throw new Error("Failed to get upload signature");
      const sigData = await sigRes.json();

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp.toString());
      formData.append("signature", sigData.signature);
      formData.append("folder", sigData.folder);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!cloudinaryRes.ok) {
        throw new Error("Failed to upload to Cloudinary");
      }

      const cloudinaryData = await cloudinaryRes.json();

      // 3. Save to our database
      const dbRes = await fetch("/api/upload-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: cloudinaryData.secure_url,
          filename: selectedFile.name,
          documentType,
          size: cloudinaryData.bytes,
        }),
      });

      const dbData = await dbRes.json();

      if (!dbRes.ok || !dbData.success) {
        throw new Error(dbData.error ?? "Failed to save document record");
      }

      setUploadedDoc(dbData.document);
      setUploadStatus("success");
      onUploadSuccess?.(dbData.document);
    } catch (err) {
      console.error(err);
      setUploadStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDocumentType("other");
    setUploadStatus("idle");
    setErrorMessage("");
    setUploadedDoc(null);
    onClose();
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[#0a0a0a] border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white/20 flex items-center justify-center">
              <CloudUpload className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Upload Document</h2>
              <p className="text-xs text-white/40">
                Stored securely in your medical vault
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Document Type */}
          <div>
            <label className="block text-xs text-white/50 mb-2 uppercase tracking-widest">
              Document Type
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {DOCUMENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setDocumentType(type.value)}
                  className={`text-left px-3 py-2 text-xs transition-all border ${
                    documentType === type.value
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/10 bg-transparent text-white/40 hover:border-white/25 hover:text-white/70"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drop Zone */}
          <div>
            <label className="block text-xs text-white/50 mb-2 uppercase tracking-widest">
              File
            </label>
            <div
              className={`relative border-2 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragOver
                  ? "border-white/40 bg-white/5"
                  : "border-white/15 hover:border-white/30"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileText className="w-8 h-8 text-white/60" />
                  <p className="text-sm text-white font-medium">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-white/40">
                    {formatBytes(selectedFile.size)} ·{" "}
                    {selectedFile.type || "Unknown type"}
                  </p>
                  <p className="text-xs text-white/25 mt-1">
                    Click to change file
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <Upload className="w-8 h-8 text-white/20" />
                  <p className="text-sm text-white/60">
                    Drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-white/30">
                    PDF, JPG, PNG, HEIC, DOC · Max 25 MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {uploadStatus === "success" && uploadedDoc && (
            <div className="flex items-start gap-3 px-3 py-3 border border-green-500/20 bg-green-500/5">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-green-400 font-medium">
                  Upload successful
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  {DOCUMENT_TYPES.find((t) => t.value === uploadedDoc.documentType)?.label ?? uploadedDoc.documentType}
                </p>
              </div>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="flex items-start gap-3 px-3 py-3 border border-red-500/20 bg-red-500/5">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-400">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-white/10">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-xs text-white/50 border border-white/10 hover:text-white hover:border-white/30 transition-all"
          >
            {uploadStatus === "success" ? "Close" : "Cancel"}
          </button>

          {uploadStatus !== "success" && (
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === "uploading"}
              className="flex-1 px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-2
                bg-white text-black hover:bg-white/90 transition-all
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {uploadStatus === "uploading" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
