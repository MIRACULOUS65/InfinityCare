# Technical Architecture: Healix Ecosystem

Healix is built on a modern, multi-layered architecture that combines high-performance web frameworks, specialized AI services, and a secure blockchain verification layer.

### 🏗️ Core Stack (The Brain)
*   **Framework:** **Next.js 16 (App Router)** provides a unified environment for both the frontend UI and the backend API logic.
*   **Data Orchestration:** **Prisma ORM** manages our PostgreSQL database (hosted on **Supabase**), ensuring rapid and type-safe data access for patient records and doctor workflows.
*   **Authentication:** **Better-Auth** handles secure multi-role logins (Patient, Doctor, Pharmacist, etc.) with support for both social and email-based authentication.
*   **Storage:** **Cloudinary** is integrated for the secure, cloud-based storage of sensitive medical documents and profile images.

### 🤖 AI/ML Layer (The Specialist)
*   **Engine:** A dedicated **Python Flask** microservice handles our intensive AI tasks.
*   **Deep Learning:** We use the **DeepFace** framework (VGG-Face model) to perform real-time face matching. This allows the **Nurse** role to verify patient identities during check-in by matching live captures against the patient’s registered image synced from the database.
*   **Seamless Integration:** The Next.js backend communicates with the Flask service via specialized internal API calls, keeping the main application responsive and decoupled from heavy ML processing.

### ⛓️ Blockchain Layer (The Vault)
*   **Platform:** **Algorand** is our choice for the immutable verification of medicine authenticity.
*   **SDKs:** We utilize **algosdk** and **Pera Wallet Connect** to allow vendors to register medicine batches on a decentralized ledger.
*   **Trustless Verification:** Every medicine batch is assigned a unique cryptographic hash stored on-chain. Pharmacies and patients can scan a medicine QR code to verify this hash against the Algorand ledger, ensuring the product is genuine and untampered.

### 📱 QR & Real-time Integration
*   **QR Generation:** **qrcode** (Node.js) generates dynamic, structured prescription codes.
*   **QR Scanning:** **html5-qrcode** (React) provides a fast, browser-based scanning experience for pharmacists and nurses.
*   **UI/UX:** **Tailwind CSS 4** and **Shadcn/UI** ensure a premium, responsive interface that feels alive with micro-animations and intuitive layouts.

### 📊 Data Flow Overview
1.  **Doctor** creates a structured prescription → **Next.js** saves to DB and generates a **QR**.
2.  **Patient** presents QR to **Pharmacist** → **Pharmacist** scans to retrieve live data and dispensing history.
3.  **Nurse** captures patient face → **Flask API** matches against **DB Cache** and returns verification score.
4.  **Vendor** registers batch → **Algorand** stores the hash → **Verifier** scans medicine QR to confirm on-chain authenticity.
