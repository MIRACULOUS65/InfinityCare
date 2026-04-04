"use client";

import { useState } from "react";
import { X, FileText, Download, Lock, Unlock, Loader2 } from "lucide-react";

interface UploadedDocument {
  id: string;
  url?: string;
  fileUrl?: string;
  name?: string;
  fileName?: string;
  documentType: string;
  accessHospital?: boolean;
  uploadedAt?: string;
  createdAt?: string;
}

interface MyDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: UploadedDocument[];
  isLoading: boolean;
  documentTypeLabels: Record<string, string>;
}

export function MyDocumentsModal({
  isOpen,
  onClose,
  documents,
  isLoading,
  documentTypeLabels,
}: MyDocumentsModalProps) {
  const [accessStates, setAccessStates] = useState<Record<string, boolean>>({});
  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({});

  const handleToggleAccess = async (docId: string, currentAccess: boolean) => {
    try {
      setIsToggling((prev) => ({ ...prev, [docId]: true }));
      const newAccess = !currentAccess;
      
      const res = await fetch("/api/toggle-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId, accessHospital: newAccess }),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setAccessStates((prev) => ({ ...prev, [docId]: newAccess }));
      } else {
        console.error("Failed to toggle access", data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling((prev) => ({ ...prev, [docId]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white/20 flex items-center justify-center bg-white/5">
              <FileText className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">My Documents</h2>
              <p className="text-xs text-white/40">
                View and download your uploaded medical records
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
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
              <p className="text-xs text-white/50 tracking-wide uppercase">
                Loading vault securely...
              </p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 border-2 border-dashed border-white/10">
              <FileText className="w-8 h-8 text-white/20" />
              <p className="text-sm text-white/60">Your vault is empty</p>
              <p className="text-xs text-white/40">
                Upload documents to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const docUrl = doc.url || doc.fileUrl;
                const docName =
                  doc.name ||
                  doc.fileName ||
                  documentTypeLabels[doc.documentType] ||
                  doc.documentType;
                const docDate = new Date(
                  doc.uploadedAt || doc.createdAt || ""
                ).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                
                const isAccessible = accessStates[doc.id] !== undefined ? accessStates[doc.id] : (doc.accessHospital || false);
                const isUpdating = isToggling[doc.id] || false;

                return (
                  <div
                    key={doc.id}
                    className="group relative flex items-center justify-between p-4 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 border border-white/10 bg-black flex items-center justify-center shrink-0 group-hover:border-white/25 transition-colors">
                        <FileText className="w-4 h-4 text-white/50" />
                      </div>
                      <div className="truncate">
                        <h3 className="text-sm text-white/90 font-medium truncate mb-1">
                          {docName}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                            {documentTypeLabels[doc.documentType] ||
                              doc.documentType.replace("_", " ")}
                          </span>
                          <span>{docDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAccess(doc.id, isAccessible)}
                        disabled={isUpdating}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border rounded transition-all disabled:opacity-50 min-w-[130px] justify-center ${
                          isAccessible 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                            : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                        }`}
                        title={isAccessible ? "Revoke hospital access" : "Grant hospital access"}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isAccessible ? (
                          <Unlock className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        {isAccessible ? "Access: ON" : "Access: OFF"}
                      </button>

                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/70 border border-white/15 rounded hover:text-black hover:bg-white hover:border-white transition-all"
                      >
                        <Download className="w-3 h-3" />
                        View
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
