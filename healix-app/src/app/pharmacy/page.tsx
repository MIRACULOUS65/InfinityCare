"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AsmeDashboardLayout } from "@/components/layout/AsmeDashboardLayout";
import { QrCode, Pill, ShieldCheck, List } from "lucide-react";

import { ScanPrescriptionQRModal } from "@/components/pharmacy/ScanPrescriptionQRModal";
import { MedicineDetailsModal } from "@/components/pharmacy/MedicineDetailsModal";
import { VerifyMedicineModal } from "@/components/patient/VerifyMedicineModal";
import { DispensingHistoryModal } from "@/components/pharmacy/DispensingHistoryModal";

export default function PharmacyDashboard() {
  const router = useRouter();

  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isMedicineOpen, setIsMedicineOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <AsmeDashboardLayout
      role="PHARMACY"
      onSignOut={handleSignOut}
      heroProps={{
        title: "Dispensing Desk",
        description: "Scan prescription QRs, view medicine details, and verify authenticity within a zero-trust supply chain.",
        primaryAction: {
          label: "Open Scanner",
          icon: <QrCode className="w-4 h-4" />,
          onClick: () => setIsScanOpen(true)
        },
        bottomActions: [
          { icon: <Pill className="w-4 h-4" />, onClick: () => setIsMedicineOpen(true) },
          { icon: <ShieldCheck className="w-4 h-4" />, onClick: () => setIsVerifyOpen(true) },
          { icon: <List className="w-4 h-4" />, onClick: () => setIsHistoryOpen(true) }
        ]
      }}
      aboutProps={{
        topText: "ZERO TRUST PLATFORM",
        heading: (
          <>
            Cryptographically verify <span className="font-heading italic not-italic text-white/60">prescriptions</span> and guarantee medicine <span className="font-heading italic not-italic text-white/60">authenticity</span>.
          </>
        )
      }}
      featuredVideoProps={{
        videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4",
        tagText: "VIEW INVENTORY",
        description: "Lookup medicine records, structure lists, and determine safe dosage instructions directly from the blockchain.",
        action: { label: "Medicine Details", onClick: () => setIsMedicineOpen(true) }
      }}
      philosophyProps={{
        heading: <>Verify <span className="font-heading italic font-light text-white/40">Authenticity</span></>,
        videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4",
        tagText1: "COMBAT COUNTERFEITS",
        desc1: "Scan a medicine QR to check if it is genuine. Ensure patient safety by querying the immutable vendor ledger.",
        tagText2: "ON-DEMAND VALIDATION",
        action: { label: "Scan & Verify", icon: <ShieldCheck className="w-4 h-4" />, onClick: () => setIsVerifyOpen(true) }
      }}
      servicesProps={{
        heading: "Dispensary Services",
        tagText: "Available actions",
        cards: [
          {
            videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4",
            tagText: "SCAN",
            title: "Prescription Scanner",
            description: "Scan the QR code from a doctor or patient to instantly receive structured, authorized medicine instructions.",
            onClick: () => setIsScanOpen(true)
          },
          {
            videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4",
            tagText: "LOGS",
            title: "Dispensing History",
            description: "View an immutable track record of every prescription you have dispensed for safety and compliance reporting.",
            onClick: () => setIsHistoryOpen(true)
          }
        ]
      }}
    >
      <ScanPrescriptionQRModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
      />

      <MedicineDetailsModal
        isOpen={isMedicineOpen}
        onClose={() => setIsMedicineOpen(false)}
      />

      <VerifyMedicineModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
      />

      <DispensingHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </AsmeDashboardLayout>
  );
}
