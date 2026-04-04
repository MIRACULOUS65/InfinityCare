"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { UploadDocumentModal } from "@/components/patient/UploadDocumentModal";
import { MyDocumentsModal } from "@/components/patient/MyDocumentsModal";
import { VerifyMedicineModal } from "@/components/patient/VerifyMedicineModal";
import { NotificationsModal, DashboardNotification } from "@/components/patient/NotificationsModal";
import { ViewPrescriptionsModal } from "@/components/patient/ViewPrescriptionsModal";
import { PrescriptionAnalysisModal } from "@/components/patient/PrescriptionAnalysisModal";
import { Upload, FileText, QrCode, Pill, Bell, Sparkles } from "lucide-react";
import { AsmeDashboardLayout } from "@/components/layout/AsmeDashboardLayout";

interface UploadedDocument {
  id: string;
  url?: string;
  fileUrl?: string;
  name?: string;
  fileName?: string;
  documentType: string;
  uploadedAt?: string;
  createdAt?: string;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  lab_report: "Lab Report",
  prescription: "Prescription",
  insurance: "Insurance Document",
  discharge_summary: "Discharge Summary",
  radiology: "Radiology / Scan",
  vaccination: "Vaccination Record",
  other: "Other",
};

export default function PatientDashboard() {
  const router = useRouter();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [myDocsModalOpen, setMyDocsModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [prescriptionsOpen, setPrescriptionsOpen] = useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("/api/my-documents");
        if (!res.ok) throw new Error("Failed to fetch documents");
        const data = await res.json();
        if (data.success) {
          setDocuments(data.documents);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoadingDocs(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/patient/notifications");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchDocuments();
    fetchNotifications();

    const notificationInterval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(notificationInterval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/patient/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: "ALL" }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadSuccess = (doc: UploadedDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <AsmeDashboardLayout
      role="PATIENT"
      unreadCount={unreadCount}
      onNotificationsClick={() => setNotificationsOpen(true)}
      onSignOut={handleSignOut}
      heroProps={{
        title: "Your Medical Vault",
        statText: `${documents.length} secure documents saved`,
        statIcon: <FileText className="w-4 h-4 text-black" />,
        onStatClick: () => setMyDocsModalOpen(true),
        description: "Upload and encrypt your lab reports, prescriptions, and insurance records. Control access for any institution easily.",
        primaryAction: {
          label: "Upload Document",
          icon: <Upload className="w-4 h-4" />,
          onClick: () => setUploadModalOpen(true)
        },
        bottomActions: [
          { icon: <Bell className="w-4 h-4" />, onClick: () => setNotificationsOpen(true) },
          { icon: <Pill className="w-4 h-4" />, onClick: () => setPrescriptionsOpen(true) },
          { icon: <QrCode className="w-4 h-4" />, onClick: () => setVerifyModalOpen(true) }
        ]
      }}
      aboutProps={{
        topText: "ZERO TRUST PLATFORM",
        heading: (
          <>
            Complete <span className="font-heading italic not-italic text-white/60">control</span> over the <span className="font-heading italic not-italic text-white/60">medical data</span><br className="hidden md:block"/> that <span className="font-heading italic not-italic text-white/60">belongs</span> to you.
          </>
        )
      }}
      featuredVideoProps={{
        videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4",
        tagText: "ACCESS LOGGING",
        description: "Monitor immutable audit trails when hospitals interact with your permitted records. You are instantly notified when your decentralized vault is queried.",
        action: { label: `View Alerts (${unreadCount})`, onClick: () => setNotificationsOpen(true) }
      }}
      philosophyProps={{
        heading: <>Verify <span className="font-heading italic font-light text-white/40">Authenticity</span></>,
        videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4",
        tagText1: "COMBAT COUNTERFEITS",
        desc1: "Scan a medicine QR to check authenticity on the immutable blockchain ledger. Our supply chain vendors issue verifiable cryptographic proofs for a safe ecosystem.",
        tagText2: "ON-DEMAND VALIDATION",
        action: { label: "Scan QR", icon: <QrCode className="w-4 h-4" />, onClick: () => setVerifyModalOpen(true) }
      }}
      servicesProps={{
        heading: "Ecosystem Services",
        tagText: "Active actions",
        cards: [
          {
            videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4",
            tagText: "DOCUMENTS",
            title: "View Documents",
            description: "View and manage your decentralized storage. Download and revoke access immediately.",
            onClick: () => setMyDocsModalOpen(true)
          },
          {
            videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4",
            tagText: "CARE",
            title: "View Prescriptions",
            description: "Verify digital prescriptions authorized by registered doctors in the network.",
            onClick: () => setPrescriptionsOpen(true)
          },
          {
            videoSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4",
            tagText: "COMING SOON",
            title: "AI Summaries",
            description: "Automatically retrieve complex medical history structured linearly via our specialized LLM models.",
            onClick: () => setAiAnalysisOpen(true)
          }
        ]
      }}
    >
      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
      <MyDocumentsModal
        isOpen={myDocsModalOpen}
        onClose={() => setMyDocsModalOpen(false)}
        documents={documents}
        isLoading={isLoadingDocs}
        documentTypeLabels={DOCUMENT_TYPE_LABELS}
      />
      <VerifyMedicineModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
      />
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        isLoading={false}
      />
      <ViewPrescriptionsModal
        isOpen={prescriptionsOpen}
        onClose={() => setPrescriptionsOpen(false)}
      />
      <PrescriptionAnalysisModal
        isOpen={aiAnalysisOpen}
        onClose={() => setAiAnalysisOpen(false)}
      />
    </AsmeDashboardLayout>
  );
}
