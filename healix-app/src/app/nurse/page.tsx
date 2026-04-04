"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AsmeDashboardLayout } from "@/components/layout/AsmeDashboardLayout";
import { FaceMatchModal } from "@/components/nurse/FaceMatchModal";
import { ScanFace } from "lucide-react";

export default function HospitalNurseDashboard() {
  const router = useRouter();
  const [isFaceMatchOpen, setIsFaceMatchOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <>
      <AsmeDashboardLayout
        role="HOSPITAL"
        onSignOut={handleSignOut}
        heroProps={{
          title: "Care Operations.",
          description:
            "Emergency Biometric Patient Identification & Care Operations",
          primaryAction: {
            label: "Patient Face ID Match",
            icon: <ScanFace className="w-5 h-5" />,
            onClick: () => setIsFaceMatchOpen(true),
          },
        }}
        aboutProps={{
          topText: "ZERO TRUST OPERATIONS",
          heading: "Identify unresponsive patients instantly.",
        }}
        featuredVideoProps={{
          videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260404_081439_bbd5db82-62ce-4927-a9a3-d0db3b9ff07f.mp4",
          tagText: "BIOMETRIC MATCH",
          description:
            "Instantly scan to cross-reference an unconscious or unresponsive patient against our cryptographically secure Patient Database using local ML deep-learning models.",
          action: {
            label: "Face ID Match",
            onClick: () => setIsFaceMatchOpen(true),
          }
        }}
      />

      <FaceMatchModal
        isOpen={isFaceMatchOpen}
        onClose={() => setIsFaceMatchOpen(false)}
      />
    </>
  );
}
