<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/Algorand-Blockchain-000?style=for-the-badge&logo=algorand" />
  <img src="https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/DeepFace-Biometrics-FF6F61?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Presage-SmartSpectra-8B5CF6?style=for-the-badge" />
</p>

<h1 align="center">♾️ InfinityCare</h1>

<p align="center">
  <b>A zero-trust, AI-powered healthcare ecosystem where patients own their data, doctors work with AI intelligence, and medicines are verified on-chain.</b>
</p>

<p align="center">
  <i>Built for <b>Hacktropica</b> — Privacy-first healthcare for the modern world.</i>
</p>

---

## 🧬 The Problem

Healthcare data is fragmented, siloed, and controlled by institutions — not patients. Counterfeit medicines kill over **1 million people annually**. Doctors are buried under cognitive overload from unstructured records. Emergency patients can't be identified without ID cards.

## 💡 The Solution

**InfinityCare** is a unified, multi-role healthcare platform built on **zero-trust principles**:

- 🔐 **Patients** own and control who sees their medical records
- 🤖 **AI** extracts structured clinical intelligence from raw prescriptions
- 🧬 **Biometric Face ID** identifies unconscious patients in emergencies
- ⛓️ **Blockchain** verifies medicine authenticity end-to-end
- 📡 **Contactless vitals** via Presage camera-based monitoring (no wearables)

---

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js 16)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Patient  │ │  Doctor  │ │ Hospital │ │  Nurse   │           │
│  │Dashboard │ │Dashboard │ │Dashboard │ │Dashboard │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│  ┌────┴─────┐ ┌────┴─────┐                                     │
│  │ Pharmacy │ │  Vendor  │                                      │
│  │Dashboard │ │Dashboard │                                      │
│  └──────────┘ └──────────┘                                      │
├─────────────────────────────────────────────────────────────────┤
│                     API LAYER (Next.js Routes)                  │
│  /api/ai/summarize  ·  /api/ai/predict  ·  /api/auth/*          │
│  /api/hospital/*  ·  /api/patient/*  ·  /api/doctor/*           │
│  /api/my-documents  ·  /api/verify-medicine  ·  /api/pharmacy/* │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  PostgreSQL  │  │  Cloudinary  │  │  Algorand Blockchain │   │
│  │   (Prisma)   │  │  (File CDN)  │  │  (Medicine Ledger)   │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│              PYTHON MICROSERVICE (Flask)                         │
│  DeepFace Biometric Engine  ·  Face ID Matching                 │
├─────────────────────────────────────────────────────────────────┤
│              EXTERNAL AI SERVICES                               │
│  Gemini 2.5 Flash  ·  Ollama  ·  Disease Prediction API        │
│  Presage SmartSpectra  ·  Tesseract.js (Browser OCR)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Features by Role

### 🧑‍⚕️ Patient Dashboard — *"Your Medical Vault"*

| Feature | Description |
|---|---|
| **Upload Documents** | Encrypt and store lab reports, prescriptions, insurance docs in your personal vault (Cloudinary CDN) |
| **Access Control** | Grant/revoke per-file access to hospitals — toggle at any time |
| **AI Prescription Scan** | Upload a prescription photo → Tesseract.js OCR → **Gemini AI** structured summary (symptoms, medicines, dosage) |
| **Disease Prediction** | Extracted symptoms are fed to an ML model that returns ranked disease probabilities |
| **Save & Share Summaries** | Save AI-generated summaries and selectively share them with your treating doctor |
| **Medicine Verification** | Scan a medicine QR to verify authenticity against the **Algorand blockchain** |
| **Real-time Notifications** | Get instant alerts when a hospital accesses your documents |
| **View Prescriptions** | See digital prescriptions written by registered doctors in the network |

### 👨‍⚕️ Doctor Dashboard — *"Clinical Workspace"*

| Feature | Description |
|---|---|
| **Type Prescription** | Create structured digital prescriptions that go directly to the patient's vault |
| **Prescription QR** | Generate scannable QR codes for pharmacies to instantly verify prescriptions |
| **AI Patient Summaries** | View Gemini-generated clinical summaries shared by patients — structured, not raw |
| **Previous Prescriptions** | Review your authored prescription history for continuity of care |

### 🏥 Hospital Dashboard — *"Hospital Workspace"*

| Feature | Description |
|---|---|
| **Search Patient** | Find patients and request decryption access to their shared medical records |
| **Access Logs** | View immutable audit trails of every document access for HIPAA compliance |
| **Write Prescription** | Author prescriptions directly into a patient's decentralized vault |

### 👩‍⚕️ Nurse Dashboard — *"Care Operations"*

| Feature | Description |
|---|---|
| **Emergency Face ID Match** | Capture a face via camera → **DeepFace CNN** matches against the patient database instantly |
| **Biometric Identification** | Identify unconscious/unresponsive patients without ID cards in emergency situations |
| **Instant Record Access** | Once identified, immediately access the patient's permitted medical vault |

### 💊 Pharmacy Dashboard — *"Dispensing Desk"*

| Feature | Description |
|---|---|
| **Scan Prescription QR** | Scan doctor-issued QR codes to receive structured, authorized dispensing instructions |
| **Medicine Details** | Look up medicine records and safe dosage instructions |
| **Verify Authenticity** | Scan a medicine QR to check if it's genuine on the blockchain ledger |
| **Dispensing History** | Track every prescription dispensed for compliance and safety |

### 🏭 Vendor Dashboard — *"Supply Chain Registry"*

| Feature | Description |
|---|---|
| **Register Medicine** | Add medicine batches with manufacturer, expiry, and quantity details onto **Algorand** |
| **Cryptographic Hash** | Generate tamper-proof SHA-256 hashes from medicine payload for mathematical verification |
| **Verification QR** | Create scannable QR codes containing blockchain-backed authenticity proofs |
| **Authenticity Registry** | View all registered batches and their current verification status on the public ledger |

---

## 🤖 AI & ML Pipeline

### Gemini AI — Clinical Summarization

InfinityCare uses **Google Gemini 2.5 Flash** as the primary AI engine for transforming raw medical text into structured clinical intelligence.

```
Prescription Image → Tesseract.js OCR → Gemini 2.5 Flash → Structured JSON
                                                              ├─ patientOverview
                                                              ├─ symptoms[]
                                                              ├─ medicines[]
                                                              ├─ dosage
                                                              └─ notes
```

**Resilient fallback chain** ensures zero downtime:
1. **Gemini 2.5 Flash** — Primary (structured JSON output, 1-3s response)
2. **Ollama Cloud (LLaMA)** — Secondary (OpenAI-compatible)
3. **Custom Healthcare AI** — Tertiary (self-hosted ML backend)
4. **Degraded Response** — Graceful fallback (raw OCR text with warning)

### DeepFace — Biometric Patient Identification

A **Flask microservice** running **DeepFace** (VGG-Face CNN) enables contactless biometric identification:

- Patient face images are synced from PostgreSQL to a local cache
- Nurse captures a photo → DeepFace runs multi-layer CNN cosine similarity matching
- Returns patient ID + match confidence in under 2 seconds
- Zero wearable/hardware dependency — any webcam or phone camera works

### Disease Prediction

Extracted symptoms from Gemini are forwarded to a **separate ML API** that returns ranked disease probabilities with confidence scores — giving patients and doctors a preliminary diagnostic signal.

### Presage SmartSpectra — Contactless Vitals

**Presage Technologies' SmartSpectra SDK** extends InfinityCare's camera-first infrastructure for contactless vital sign monitoring:

| Vital | Method |
|---|---|
| Heart Rate (BPM) | Remote photoplethysmography (rPPG) |
| Heart Rate Variability (HRV) | Autonomic nervous system analysis |
| Breathing Rate | Respiratory cycle detection |
| Blood Pressure (Relative) | Pulse waveform analysis |
| Apnea Detection | Breathing pause identification |

**Key integration points:**
- **Nurse Station** — Extends the existing DeepFace camera flow to simultaneously capture vitals alongside patient identification (one scan = identity + vitals)
- **Patient Self-Monitoring** — At-home vitals via phone camera, stored in the encrypted medical vault
- **Doctor AI Summaries** — Presage vitals feed into the Gemini summary pipeline

---

## ⛓️ Blockchain — Algorand

InfinityCare uses the **Algorand blockchain** for medicine supply chain integrity:

- **Vendors** register medicine batches → cryptographic hash is generated and stored on-chain
- **Pharmacies** scan QR codes → hash is verified against the immutable ledger
- **Patients** can independently verify any medicine's authenticity
- **Verification statuses**: `GENUINE` · `NOT_FOUND` · `EXPIRED` · `TAMPERED` · `SUSPICIOUS`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, Framer Motion, Glassmorphism UI |
| **Database** | PostgreSQL (Supabase), Prisma ORM 7 |
| **Auth** | Better Auth (session-based, role-gated) |
| **File Storage** | Cloudinary CDN |
| **AI/LLM** | Google Gemini 2.5 Flash, Ollama Cloud |
| **OCR** | Tesseract.js 7 (browser-side) |
| **Biometrics** | DeepFace (VGG-Face CNN), Flask/Python |
| **Vitals** | Presage SmartSpectra SDK |
| **Blockchain** | Algorand (algosdk) |
| **QR Codes** | qrcode + html5-qrcode |
| **Forms** | React Hook Form + Zod validation |
| **Deployment** | Vercel (frontend), Render (Python service) |

---

## 📊 Database Schema

10 Prisma models powering the ecosystem:

```
User ──┬── Document ──── AccessLog
       ├── Prescription      │
       ├── Notification       │
       ├── Medicine       AISummary
       ├── Session
       └── Account
              Verification
```

**Roles**: `PATIENT` · `DOCTOR` · `HOSPITAL` · `PHARMACY` · `VENDOR`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+ (for DeepFace service)
- PostgreSQL database (or Supabase)

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/infinitycare.git
cd infinitycare
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Auth
BETTER_AUTH_SECRET="your-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"

# AI Services
GEMINI_API_KEY="your-gemini-api-key"
OLLAMA_API_KEY="your-ollama-key"          # Optional fallback
OLLAMA_BASE_URL="https://ollama.com/v1"   # Optional
OLLAMA_MODEL="llama3.2"                   # Optional

# File Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Blockchain
NEXT_PUBLIC_ALGORAND_APP_ID="your-app-id"

# Python Service
NEXT_PUBLIC_FACE_MATCH_URL="http://localhost:5000"

# Disease Prediction
PREDICTION_API_BASE_URL="https://your-prediction-api.com"
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Frontend

```bash
npm run dev
```

### 5. Run Python Service (DeepFace)

```bash
cd src/python_service
python -m venv venv
.\venv\Scripts\activate      # Windows
pip install -r requirements.txt
python app.py
```

The app will be available at **http://localhost:3000**

---

## 📁 Project Structure

```
healix-app/
├── prisma/
│   └── schema.prisma              # 10 models, 5 roles, 4 enums
├── src/
│   ├── app/
│   │   ├── api/                   # 14 API route groups
│   │   │   ├── ai/                # Gemini summarize + Disease predict
│   │   │   ├── auth/              # Better Auth endpoints
│   │   │   ├── doctor/            # Prescription & summary APIs
│   │   │   ├── hospital/          # Patient search & access logs
│   │   │   ├── patient/           # Notifications, save summaries
│   │   │   ├── pharmacy/          # QR scan & dispensing
│   │   │   └── ...
│   │   ├── patient/               # Patient dashboard page
│   │   ├── doctor/                # Doctor dashboard page
│   │   ├── hospital/              # Hospital dashboard page
│   │   ├── nurse/                 # Nurse dashboard page
│   │   ├── pharmacy/              # Pharmacy dashboard page
│   │   ├── vendor/                # Vendor dashboard page
│   │   ├── verify/[hash]/         # Public medicine verification
│   │   └── page.tsx               # Landing page
│   ├── components/
│   │   ├── patient/               # 7 modals (Upload, Docs, Verify, etc.)
│   │   ├── doctor/                # 3 modals (AI Summaries, QR, History)
│   │   ├── hospital/              # 3 modals (Search, Logs, Prescribe)
│   │   ├── nurse/                 # 1 modal (Face ID Match)
│   │   ├── pharmacy/              # 3 modals (Scan QR, Medicine, History)
│   │   ├── vendor/                # 4 modals (Register, Hash, QR, Registry)
│   │   ├── auth/                  # FaceCapture component
│   │   ├── layout/                # Shared dashboard layout
│   │   └── ui/                    # Shadcn UI primitives
│   ├── lib/
│   │   ├── auth.ts                # Better Auth server config
│   │   ├── auth-client.ts         # Client-side auth
│   │   └── services/
│   │       └── analysisService.ts # AI summary + prediction client
│   └── python_service/
│       ├── app.py                 # Flask + DeepFace biometric engine
│       ├── requirements.txt
│       └── Procfile               # Render deployment
└── package.json
```

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| **Frontend** | [Vercel](https://vercel.com) |
| **Python/DeepFace** | [Render](https://render.com) |
| **Database** | [Supabase](https://supabase.com) (PostgreSQL) |
| **File CDN** | [Cloudinary](https://cloudinary.com) |

---

## 👥 Team

Built with ❤️ for **Hacktropica**

---

<p align="center">
  <b>InfinityCare</b> — Because your health data should belong to <i>you</i>.
</p>
