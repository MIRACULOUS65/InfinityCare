"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, RefreshCw, CheckCircle2 } from "lucide-react";

export function FaceCapture({ onCapture }: { onCapture: (file: File | null) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch {
      setError("Camera access denied or unavailable. Please allow camera permissions to set up your Face ID.");
    }
  }, []);

  // Ensure srcObject is always synced after renders
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (capturedImage && capturedImage.startsWith("blob:")) {
        URL.revokeObjectURL(capturedImage);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) {
      setError("Camera not ready yet. Please wait a moment and try again.");
      return;
    }

    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, vw, vh);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const objectUrl = URL.createObjectURL(blob);
          setCapturedImage(objectUrl);
          stopCamera();
          const file = new File([blob], "face_capture.jpg", { type: "image/jpeg" });
          onCapture(file);
        }
      },
      "image/jpeg",
      0.9
    );
  }, [onCapture, stopCamera]);

  const retakePhoto = useCallback(() => {
    if (capturedImage && capturedImage.startsWith("blob:")) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    onCapture(null);
    startCamera();
  }, [capturedImage, onCapture, startCamera]);

  return (
    <div className="border border-white/10 bg-white/5 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Face ID Setup</h3>
          <p className="text-xs text-white/40">Required for emergency hospital verification.</p>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 p-3 bg-red-500/10 border border-red-500/20">
          {error}
        </div>
      )}

      {capturedImage ? (
        <div className="space-y-3">
          <div className="relative aspect-video overflow-hidden border border-white/20 bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-green-500/90 text-black px-2.5 py-1 text-xs font-bold rounded-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Captured
            </div>
          </div>
          <button
            type="button"
            onClick={retakePhoto}
            className="flex items-center justify-center gap-2 w-full py-2 text-xs border border-white/20 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retake Photo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative aspect-video overflow-hidden border border-white/20 bg-black">
            {/* Video is ALWAYS in the DOM so the ref is never null */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${cameraActive ? "block" : "hidden"}`}
            />
            {!cameraActive && (
              <button
                type="button"
                onClick={startCamera}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <Camera className="w-6 h-6" />
                Enable Camera
              </button>
            )}
            {cameraActive && (
              <button
                type="button"
                onClick={capturePhoto}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white text-black px-6 py-2 text-sm font-bold hover:bg-white/90 transition-transform hover:scale-105"
              >
                <Camera className="w-4 h-4" />
                Capture
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
