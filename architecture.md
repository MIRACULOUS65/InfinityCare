# 🧠 HELIX — SIMPLIFIED & SCALABLE ARCHITECTURE (NEXT.JS)

---

# 📌 Overview

HELIX is a **privacy-first healthcare system** with:

* Role-based access (5 roles)
* AI-generated summaries (handled separately)
* QR-based prescriptions
* Blockchain-based medicine verification

---

# 🔷 1. Tech Stack (Optimized for Hackathon)

## Frontend + Backend (Unified)

* Next.js (App Router)
* TypeScript
* Tailwind CSS

---

## Auth (IMPORTANT SIMPLIFICATION)

* **Better Auth (recommended)**
* Role stored in DB
* Session-based auth (no manual JWT handling)

---

## Database

* Supabase with supabase mcp provided mcp

---

## File Storage

* Cloudinary

---

## AI/ML

* Separate service (handled by teammate)

---

## Blockchain

* tell me when needed will tell u then for now lets postpone it

---

# 🔷 2. Project Structure (CLEAN MODULAR)

```id="helix-structure"
helix/
│
├── frontend/         # Next.js app (UI + API routes)
├── backend/          # Optional (if separate APIs needed)
├── blockchain/       # Hash + verification logic
├── aiml/             # AI service (separate by teammate)
│
└── docs/
    └── ARCHITECTURE.md
```

---

# 🔷 3. Frontend Structure (Next.js)

```id="frontend-structure"
frontend/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── role-select/
│   │
│   ├── patient/
│   ├── doctor/
│   ├── hospital/
│   ├── pharmacy/
│   ├── vendor/
│   │
│   ├── verify/[hash]/
│   └── api/
│
├── components/
├── lib/
├── services/
└── types/
```

---

# 🔷 4. Authentication System (SIMPLIFIED)

## Use:

👉 Better Auth

---

## Flow:

```id="auth-flow"
Login → Select Role → Store Role → Redirect Dashboard
```

---

## Rule:

* One email = one role
* Role stored in DB
* Middleware protects routes

---

## Middleware Example:

```ts id="middleware-example"
if (session.user.role !== "DOCTOR") {
  redirect("/unauthorized");
}
```

---

# 🔷 5. 5 ROLE SYSTEM (CORE)

## Roles:

* PATIENT
* DOCTOR
* HOSPITAL
* PHARMACY
* VENDOR

---

# 🔷 6. 4 MAIN PILLARS (SYSTEM DESIGN)

---

## 🟢 1. Patient Pillar

### Features:

* Upload document
* Set access (hospital only)
* View notifications
* Verify medicine

---

## 🔵 2. Doctor Pillar

### Features:

* Create prescription:

  * Upload image
  * Draw (optional later)
  * Type (MVP)
* View AI summaries (via API)

---

## 🟣 3. Hospital Pillar

### Features:

* Search patient by ID
* View shared documents
* Trigger notification

---

## 🟡 4. Pharmacy Pillar

### Features:

* Scan prescription QR
* Show medicines
* Verify medicine authenticity

---

## 🟠 5. Vendor Pillar

### Features:

* Register medicine
* Generate hash
* Create QR

---

# 🔷 7. Backend Logic (Inside Next.js API Routes)

👉 Keep backend INSIDE Next.js for speed

---

## API Structure:

```id="api-structure"
app/api/
│
├── auth/
├── patient/
├── doctor/
├── hospital/
├── pharmacy/
├── vendor/
├── verify/
```

---

# 🔷 8. Database Schema (Simplified)

---

## Users

```id="users-schema"
id
email
role
```

---

## Documents

```id="documents-schema"
id
patient_id
file_url
type
access_hospital
```

---

## AI Summaries

```id="ai-schema"
id
patient_id
summary_text
```

---

## Prescriptions

```id="prescription-schema"
id
patient_id
doctor_id
medicines_json
```

---

## Notifications

```id="notification-schema"
id
patient_id
message
```

---

# 🔷 9. QR System (Simplified)

---

## Prescription QR:

```id="qr-prescription"
/api/prescription/:id
```

---

## Medicine QR:

```id="qr-medicine"
/verify/:hash
```

---

# 🔷 10. Blockchain Module (SIMPLIFIED FIRST)

```id="blockchain-structure"
blockchain/
│
├── generateHash.ts
├── storeHash.ts
├── verifyHash.ts
```

---

## Hackathon Strategy:

* First → store in DB
* Later → connect real blockchain

---

# 🔷 11. AI Integration (Minimal Coupling)

```id="ai-flow"
Frontend → API → AI Service → Summary → Store
```

👉 You DO NOT build this part

---

# 🔷 12. Key Simplifications (VERY IMPORTANT)

---

## ❌ Removed Complexity:

* No custom auth system
* No heavy blockchain at start
* No real-time sockets initially
* No microservices

---

## ✅ Added Simplicity:

* Next.js fullstack
* Role middleware
* API routes instead of separate backend
* Modular folders

---

# 🔷 13. Build Order (CRITICAL)

---

## Day 1:

* Auth + Role system
* Basic dashboards

---

## Day 2:

* Patient upload
* Doctor prescription + QR

---

## Day 3:

* Hospital access + notifications
* Pharmacy QR scan

---

## Day 4:

* Vendor + blockchain mock
* Verification page

---

# 🔷 14. Final Identity

HELIX =
👉 Privacy + AI + Blockchain
👉 Built with speed + modularity

---

# 🚀 One-Line Pitch

HELIX is a privacy-first healthcare platform where patients control their data, doctors use AI summaries, and medicines are verified through blockchain.
