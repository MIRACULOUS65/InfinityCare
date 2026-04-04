export type Role = "PATIENT" | "DOCTOR" | "HOSPITAL" | "PHARMACY" | "VENDOR";

export type DocumentType =
  | "LAB_REPORT"
  | "PRESCRIPTION"
  | "INSURANCE"
  | "DISCHARGE_SUMMARY"
  | "OTHER";

export type VerificationStatus =
  | "GENUINE"
  | "NOT_FOUND"
  | "EXPIRED"
  | "TAMPERED"
  | "SUSPICIOUS";

export interface HealixUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string | null;
  createdAt: Date;
}

export interface Document {
  id: string;
  patientId: string;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  accessHospital: boolean;
  createdAt: Date;
}

export interface Medicine {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicinesJson: Medicine[];
  instructions?: string | null;
  qrData?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  patientId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface AccessLog {
  id: string;
  patientId: string;
  hospitalId: string;
  documentId: string;
  accessedAt: Date;
}

export interface MedicineRecord {
  id: string;
  vendorId: string;
  name: string;
  batchNumber: string;
  manufacturer: string;
  expiryDate: Date;
  quantity: number;
  hash: string;
  status: VerificationStatus;
  registeredAt: Date;
}
