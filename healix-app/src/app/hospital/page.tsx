"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AsmeDashboardLayout } from "@/components/layout/AsmeDashboardLayout";
import { Search, History, Pill } from "lucide-react";

import { SearchPatientModal } from "@/components/hospital/SearchPatientModal";
import { AccessLogsModal } from "@/components/hospital/AccessLogsModal";
import { PrescriptionModal } from "@/components/hospital/PrescriptionModal";

export default function HospitalDoctorDashboard() {
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isPrescribeOpen, setIsPrescribeOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <AsmeDashboardLayout
      role="HOSPITAL"
      onSignOut={handleSignOut}
      heroProps={{
        title: "Hospital Workspace",
        description: "Search patients and evaluate their permitted clinical history under zero-trust principles.",
        primaryAction: {
          label: "Initiate Search",
          icon: <Search className="w-4 h-4" />,
          onClick: () => setIsSearchOpen(true)
        },
        bottomActions: [
          { icon: <History className="w-4 h-4" />, onClick: () => setIsLogsOpen(true) },
          { icon: <Pill className="w-4 h-4" />, onClick: () => setIsPrescribeOpen(true) }
        ]
      }}
      aboutProps={{
        topText: "ZERO TRUST PLATFORM",
        heading: (
          <>
            Diagnose securely with <span className="font-heading italic not-italic text-white/60">immutable</span> access to <span className="font-heading italic not-italic text-white/60">patient-approved</span> records.
          </>
        )
      }}
      featuredVideoProps={{
        videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4",
        tagText: "ACCESS RECORDS",
        description: "Find a patient and request restricted access to their shared medical records. They can revoke it at any time.",
        action: { label: "Search Patient", onClick: () => setIsSearchOpen(true) }
      }}
      philosophyProps={{
        heading: <>Immutable <span className="font-heading italic font-light text-white/40">Logs</span></>,
        videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4",
        tagText1: "AUDIT TRAILS",
        desc1: "Review your document access history to ensure HIPAA compliance and audit readiness. Patients have the same visibility.",
        tagText2: "REVIEW LOGS",
        action: { label: "View Logs", icon: <History className="w-4 h-4" />, onClick: () => setIsLogsOpen(true) }
      }}
      servicesProps={{
        heading: "Clinical Services",
        tagText: "Available actions",
        cards: [
          {
            videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4",
            tagText: "CARE",
            title: "Write Prescription",
            description: "Create a structured prescription directly into the patient's decentralized file. Medicine fields apply directly to their vault.",
            onClick: () => setIsPrescribeOpen(true)
          },
          {
            videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4",
            tagText: "SEARCH",
            title: "Search Patient by ID",
            description: "Search patients, request decryption access to their files, and handle life-saving diagnosis quickly and reliably.",
            onClick: () => setIsSearchOpen(true)
          }
        ]
      }}
    >
      <SearchPatientModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <AccessLogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />

      <PrescriptionModal
        isOpen={isPrescribeOpen}
        onClose={() => setIsPrescribeOpen(false)}
      />
    </AsmeDashboardLayout>
  );
}
