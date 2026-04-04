import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 border border-white/20 flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-5 h-5 text-white/30" />
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2">Unauthorized</h1>
        <p className="text-sm text-white/40 mb-8">
          You do not have permission to access this page. This area is restricted to a specific role.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 text-sm hover:border-white/60 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
}
