"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import type { Role } from "@/types";
import { FaceCapture } from "@/components/auth/FaceCapture";
import { VideoBackground } from "@/components/VideoBackground";

const ROLE_LABELS: Record<Role, string> = {
  PATIENT: "Patient",
  DOCTOR: "Doctor",
  HOSPITAL: "Hospital",
  PHARMACY: "Pharmacy",
  VENDOR: "Vendor",
};

const ROLE_REDIRECTS: Record<Role, string> = {
  PATIENT: "/patient",
  DOCTOR: "/doctor",
  HOSPITAL: "/hospital",
  PHARMACY: "/pharmacy",
  VENDOR: "/vendor",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as Role | null;
  const subroleParam = searchParams.get("subrole");
  const modeParam = searchParams.get("mode");

  const [mode, setMode] = useState<"login" | "signup">(
    modeParam === "signup" ? "signup" : "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const role = roleParam ?? "PATIENT";

  useEffect(() => {
    if (!roleParam) {
      router.replace("/role-select");
    }
  }, [roleParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        let finalImageUrl = "";
        
        if (role === "PATIENT") {
          if (!faceImage) {
            setError("Face Capture is required for Patient Registration.");
            setLoading(false);
            return;
          }
          setUploadMessage("Securely uploading Face ID...");
          
          try {
            const sigRes = await fetch("/api/upload-signature?type=signup");
            if (!sigRes.ok) throw new Error("Signature failed");
            const sigData = await sigRes.json();

            const formData = new FormData();
            formData.append("file", faceImage);
            formData.append("api_key", sigData.apiKey);
            formData.append("timestamp", sigData.timestamp.toString());
            formData.append("signature", sigData.signature);
            formData.append("folder", sigData.folder);

            const cloudinaryRes = await fetch(
              `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`,
              { method: "POST", body: formData }
            );
            if (!cloudinaryRes.ok) throw new Error("Upload failed");
            const cloudinaryData = await cloudinaryRes.json();
            finalImageUrl = cloudinaryData.secure_url;
            setUploadMessage(null);
          } catch (e) {
            setError("Failed to process Face ID. Please try again.");
            setUploadMessage(null);
            setLoading(false);
            return;
          }
        }

        const { error: signUpError } = await authClient.signUp.email({
          name,
          email,
          password,
          // @ts-expect-error – custom field added via Better Auth additionalFields
          role,
          image: finalImageUrl || undefined,
        });
        if (signUpError) {
          setError(signUpError.message ?? "Sign up failed. Please try again.");
          setLoading(false);
          return;
        }
        // Auto sign-in after signup
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });
        if (signInError) {
          setError("Account created. Please sign in.");
          setMode("login");
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message ?? "Invalid email or password.");
          return;
        }
      }

      if (subroleParam) {
        document.cookie = `healix_subrole=${subroleParam}; path=/; max-age=2592000`; // 30 days
      }

      if (role === "HOSPITAL" && subroleParam === "NURSE") {
        router.push("/nurse");
      } else {
        router.push(ROLE_REDIRECTS[role]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Background from Section 2 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <VideoBackground
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          poster="/images/hero_bg.jpeg"
          className="top-[20%]"
        />
        <div className="absolute inset-0 bg-black/40 xl:bg-black/10 z-0" />
        <div className="absolute bottom-0 left-0 right-0 z-[1] h-[300px]" style={{ background: "linear-gradient(to bottom, transparent, black)" }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Nav */}
        <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
          <Link
            href="/role-select"
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Change Role
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30 tracking-widest uppercase">
              Signing in as
            </span>
            <span className="text-xs font-bold px-3 py-1 border border-white/20 tracking-wider">
              {ROLE_LABELS[role]}
            </span>
          </div>
        </nav>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-16 w-full">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="mb-10">
              <p className="text-xs text-white/40 tracking-widest uppercase mb-3">
                {mode === "login" ? "Step 2 of 2" : "Step 2 of 2 — Create Account"}
              </p>
              <h1 className="text-3xl font-black tracking-tight">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h1>
              <p className="text-white/40 text-sm mt-2">
                {mode === "login"
                  ? "Sign in to your Healix account."
                  : `Register as a ${ROLE_LABELS[role]}. One email, one role — permanently bound.`}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs text-white/60 uppercase tracking-widest drop-shadow-md">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your full name"
                    className="bg-black/50 backdrop-blur-md border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/50 focus-visible:border-white/60 rounded-none h-12"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs text-white/60 uppercase tracking-widest drop-shadow-md">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="bg-black/50 backdrop-blur-md border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/50 focus-visible:border-white/60 rounded-none h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs text-white/60 uppercase tracking-widest drop-shadow-md">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={mode === "signup" ? "Min. 8 characters" : "Enter your password"}
                    minLength={mode === "signup" ? 8 : 1}
                    className="bg-black/50 backdrop-blur-md border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/50 focus-visible:border-white/60 rounded-none h-12 pr-12"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Face Capture for Patients during Signup */}
              {mode === "signup" && role === "PATIENT" && (
                <div className="bg-black/50 p-4 border border-white/20 backdrop-blur-md">
                  <FaceCapture onCapture={setFaceImage} />
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-white/90 backdrop-blur-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-none font-semibold text-sm tracking-wide"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadMessage ? uploadMessage : "Processing..."}
                  </span>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Toggle mode */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-white/50">
                {mode === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError(null);
                  }}
                  className="text-white/80 hover:text-white underline-offset-4 hover:underline transition-colors font-medium"
                >
                  {mode === "login" ? "Create one" : "Sign in"}
                </button>
              </p>
            </div>

            {/* Role lock notice */}
            <div className="mt-6 flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-white/40 mt-1.5 flex-shrink-0" />
              <p className="text-xs text-white/40 leading-relaxed font-medium">
                Your role is permanently bound to your email at registration.
                One email = one role. This cannot be changed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
