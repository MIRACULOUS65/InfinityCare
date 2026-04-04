"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";

const ROLE_LABELS: Record<Role, string> = {
  PATIENT: "Patient",
  DOCTOR: "Doctor",
  HOSPITAL: "Hospital",
  PHARMACY: "Pharmacy",
  VENDOR: "Vendor",
};

interface DashboardLayoutProps {
  role: Role;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function DashboardLayout({
  role,
  title,
  subtitle,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold tracking-tight">HEALIX</span>
            <span className="text-white/20">|</span>
            <span className="text-xs text-white/40 uppercase tracking-widest">
              {ROLE_LABELS[role]} Dashboard
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-white/40 hover:text-white hover:bg-white/5 gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Page header */}
      <div className="border-b border-white/10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
            {ROLE_LABELS[role]}
          </p>
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
          <p className="text-sm text-white/40 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
