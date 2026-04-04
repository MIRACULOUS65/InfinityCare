"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Stethoscope, ClipboardPlus, ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { VideoBackground } from "@/components/VideoBackground";

const SUB_ROLES = [
  {
    id: "Hospital_Dr",
    icon: Stethoscope,
    title: "Hospital Doctor",
    subtitle: "Advanced Medical Access",
    description: "Search patients, view permitted medical records, and review comprehensive medical histories.",
    canDo: [
      "Search patients by ID",
      "Access permitted documents",
      "View AI Patient Summaries",
    ],
  },
  {
    id: "Hospital_Nurse",
    icon: ClipboardPlus,
    title: "Hospital Nurse",
    subtitle: "Care & Operations",
    description: "Manage daily care routines, verify minor prescriptions, and coordinate internal tasks.",
    canDo: [
      "Manage vitals and routines",
      "Check daily prescriptions",
      "Coordinate care tasks",
    ],
  },
];

export default function HospitalSubRoleSelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected === "Hospital_Dr") {
      router.push("/login?role=HOSPITAL");
    } else if (selected === "Hospital_Nurse") {
      router.push("/login?role=HOSPITAL&subrole=NURSE");
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
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
        {/* Top bar */}
        <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
          <Link
            href="/role-select"
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Roles
          </Link>
          <p className="text-xs text-white/30 tracking-widest uppercase">
            Hospital Type Selection
          </p>
        </nav>

      <div className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs text-white/40 tracking-widest uppercase mb-3">
            Step 1.5 of 2
          </p>
          <h1 className="text-4xl font-black tracking-tight mb-3">
            Identify your Hospital role
          </h1>
          <p className="text-white/40 text-sm max-w-md">
            Please select your specific clinical designation to configure your personalized dashboard and access levels.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-px bg-white/10 mb-8 backdrop-blur-sm">
          {SUB_ROLES.map(({ id, icon: Icon, title, subtitle, description, canDo }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={`bg-black/70 p-8 text-left transition-all duration-150 group ${
                selected === id
                  ? "ring-1 ring-inset ring-white bg-black/90"
                  : "hover:bg-white/[0.05]"
              }`}
            >
              <div
                className={`w-12 h-12 flex items-center justify-center border mb-6 transition-colors ${
                  selected === id
                    ? "border-white bg-white text-black"
                    : "border-white/20 text-white/40 group-hover:border-white/40"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-bold text-lg mb-1">{title}</p>
              <p className="text-xs text-white/40 mb-5">{subtitle}</p>
              <p className="text-sm text-white/30 leading-relaxed mb-6">
                {description}
              </p>
              <ul className="space-y-2">
                {canDo.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-xs text-white/40">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${selected === id ? "bg-white" : "bg-white/20"}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Continue */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/30">
            {selected
              ? `You selected: ${SUB_ROLES.find((r) => r.id === selected)?.title}`
              : "Select a clinical role to continue"}
          </p>
          <button
            onClick={handleContinue}
            disabled={!selected}
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-colors"
          >
            Continue to Login
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    </main>
  );
}
