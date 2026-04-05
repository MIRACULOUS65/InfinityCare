"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AsmeDashboardLayout } from "@/components/layout/AsmeDashboardLayout";
import { FileText, History, Pill, QrCode } from "lucide-react";

import { PrescriptionModal } from "@/components/hospital/PrescriptionModal";
import { PreviousPrescriptionsModal } from "@/components/doctor/PreviousPrescriptionsModal";
import { PrescriptionQRModal } from "@/components/doctor/PrescriptionQRModal";
import { PatientAISummariesModal } from "@/components/doctor/PatientAISummariesModal";

export default function DoctorDashboard() {
  const router = useRouter();

  const [isPrescribeOpen, setIsPrescribeOpen] = useState(false);
  const [isPreviousOpen, setIsPreviousOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAiSummariesOpen, setIsAiSummariesOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <AsmeDashboardLayout
      role="DOCTOR"
      onSignOut={handleSignOut}
      heroProps={{
        title: "Clinical Workspace",
        description: "Prescribe medicines securely, track clinical history, and manage Zero Trust credentials.",
        primaryAction: {
          label: "Type Prescription",
          icon: <Pill className="w-4 h-4" />,
          onClick: () => setIsPrescribeOpen(true)
        },
        bottomActions: [
          { icon: <History className="w-4 h-4" />, onClick: () => setIsPreviousOpen(true) },
          { icon: <QrCode className="w-4 h-4" />, onClick: () => setIsQrOpen(true) }
        ]
      }}
      aboutProps={{
        topText: "ZERO TRUST PLATFORM",
        heading: (
          <>
            Write prescriptions that the <span className="font-heading italic not-italic text-white/60">patient directly</span> controls and owns.
          </>
        )
      }}
      featuredVideoProps={{
        videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4",
        tagText: "SECURE PRESCRIBING",
        description: "Author cryptographically signed prescriptions that are immediately available within the patient's decentralized vault.",
        action: { label: "Type Prescription", onClick: () => setIsPrescribeOpen(true) }
      }}
      philosophyProps={{
        heading: <>Review <span className="font-heading italic font-light text-white/40">History</span></>,
        videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4",
        tagText1: "CLINICAL LOGS",
        desc1: "Review prescriptions you've authored in the past to maintain continuity of care. All data remains tamper-proof.",
        tagText2: "ARCHIVE ACCESS",
        action: { label: "Previous Prescriptions", icon: <History className="w-4 h-4" />, onClick: () => setIsPreviousOpen(true) }
      }}
      servicesProps={{
        heading: "Diagnostic Tools",
        tagText: "Available actions",
        cards: [
          {
            videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4",
            tagText: "SHARE",
            title: "Prescription QR",
            description: "Show a scannable QR code of a patient's prescription so pharmacies can instantly verify their medicine schedule.",
            onClick: () => setIsQrOpen(true)
          },
          {
            videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4",
            tagText: "AI",
            title: "AI Summaries",
            description: "Automatically retrieve complex medical history structured linearly via our specialized LLM models.",
            onClick: () => setIsAiSummariesOpen(true)
          }
        ]
      }}
    >
      <PrescriptionModal
        isOpen={isPrescribeOpen}
        onClose={() => setIsPrescribeOpen(false)}
      />

      <PreviousPrescriptionsModal
        isOpen={isPreviousOpen}
        onClose={() => setIsPreviousOpen(false)}
      />

      <PrescriptionQRModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
      />

      <PatientAISummariesModal
        isOpen={isAiSummariesOpen}
        onClose={() => setIsAiSummariesOpen(false)}
      />
    </AsmeDashboardLayout>
  );
}
