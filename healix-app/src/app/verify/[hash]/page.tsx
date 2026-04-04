import { ShieldCheck } from "lucide-react";

// Public verification page — anyone can access to verify a medicine hash
export default function VerifyPage({ params }: { params: { hash: string } }) {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="border border-white/10 p-8">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-5 h-5 text-white/40" />
            <span className="text-xs tracking-widest uppercase text-white/40">
              Medicine Verification
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Verify Authenticity</h1>
          <p className="text-xs text-white/40 font-mono break-all mb-8">
            Hash: {params.hash}
          </p>
          <div className="border-t border-white/10 pt-6">
            <p className="text-sm text-white/30">
              Verification result coming soon. This page will show whether the
              medicine batch is genuine, expired, or tampered.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
