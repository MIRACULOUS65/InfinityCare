"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AsmeDashboardLayout } from "@/components/layout/AsmeDashboardLayout";
import { PackagePlus, Hash, QrCode, Archive } from "lucide-react";

import { RegisterMedicineModal } from "@/components/vendor/RegisterMedicineModal";
import { RegisteredMedicinesModal } from "@/components/vendor/RegisteredMedicinesModal";
import { AuthenticityRegistryModal } from "@/components/vendor/AuthenticityRegistryModal";
import { CreateVerificationQRModal } from "@/components/vendor/CreateVerificationQRModal";

interface RegisteredMedicine {
  id: string;
  name: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  hash: string;
  registeredAt: string;
  status: string;
}

export default function VendorDashboard() {
  const router = useRouter();

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [hashModalOpen, setHashModalOpen] = useState(false);
  const [registryModalOpen, setRegistryModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  
  const [medicines, setMedicines] = useState<RegisteredMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/my-medicines");
      if (!res.ok) throw new Error("Failed to fetch medicines");
      const data = await res.json();
      if (data.success) {
        setMedicines(data.medicines);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleRegisterSuccess = () => {
    fetchMedicines();
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <AsmeDashboardLayout
      role="VENDOR"
      onSignOut={handleSignOut}
      heroProps={{
        title: "Supply Chain Registry",
        description: "Register medicine batches, generate cryptographic hashes, and issue verification QRs directly on Algorand.",
        primaryAction: {
          label: "Register Medicine",
          icon: <PackagePlus className="w-4 h-4" />,
          onClick: () => setRegisterModalOpen(true)
        },
        bottomActions: [
          { icon: <Hash className="w-4 h-4" />, onClick: () => setHashModalOpen(true) },
          { icon: <QrCode className="w-4 h-4" />, onClick: () => setQrModalOpen(true) },
          { icon: <Archive className="w-4 h-4" />, onClick: () => setRegistryModalOpen(true) }
        ]
      }}
      aboutProps={{
        topText: "ZERO TRUST PLATFORM",
        heading: (
          <>
            Supply authentic <span className="font-heading italic not-italic text-white/60">medicines</span> tracked securely on an <span className="font-heading italic not-italic text-white/60">immutable</span> ledger.
          </>
        )
      }}
      featuredVideoProps={{
        videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4",
        tagText: "VERIFICATION CODES",
        description: "Generate a QR code containing cryptographically secure hashes that pharmacies and patients can scan to verify authenticity.",
        action: { label: "Generate QR", onClick: () => setQrModalOpen(true) }
      }}
      philosophyProps={{
        heading: <>Open <span className="font-heading italic font-light text-white/40">Ledger</span></>,
        videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4",
        tagText1: "AUTHENTICITY REGISTRY",
        desc1: "View all registered medicine batches and their current verification status. A public track record builds implicit trust.",
        tagText2: "ARCHIVE ACCESS",
        action: { label: "Open Ledger", icon: <Archive className="w-4 h-4" />, onClick: () => setRegistryModalOpen(true) }
      }}
      servicesProps={{
        heading: "Logistics Tools",
        tagText: "Available actions",
        cards: [
          {
            videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4",
            tagText: "REGISTER",
            title: "Register Medicine",
            description: "Add a new medicine batch with manufacturer, expiry, and quantity details onto Algorand to initiate track and trace.",
            onClick: () => setRegisterModalOpen(true)
          },
          {
            videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4",
            tagText: "CRYPTOGRAPHY",
            title: "Generate Hash",
            description: "View cryptographic hashes automatically generated from the medicine payload for tamper-proof mathematical verification.",
            onClick: () => setHashModalOpen(true)
          }
        ]
      }}
    >
      <RegisterMedicineModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={handleRegisterSuccess}
      />

      <RegisteredMedicinesModal
        isOpen={hashModalOpen}
        onClose={() => setHashModalOpen(false)}
        medicines={medicines}
        isLoading={isLoading}
      />

      <AuthenticityRegistryModal
        isOpen={registryModalOpen}
        onClose={() => setRegistryModalOpen(false)}
        medicines={medicines}
        isLoading={isLoading}
      />

      <CreateVerificationQRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        medicines={medicines}
        isLoading={isLoading}
      />
    </AsmeDashboardLayout>
  );
}
