# HELIX — IDEA DOCUMENT

## 1. What Helix Is

Helix is a **role-based healthcare platform** designed to solve one of the biggest real-world problems in medical systems: **medical data is fragmented, hard to trust, and too widely exposed**.

In most healthcare workflows:
- patients keep reports in scattered folders, chats, emails, and cloud drives,
- doctors often do not get clean context quickly,
- hospitals may need access to files, but there is no controlled sharing model,
- pharmacies only need prescription-level information, not full patient history,
- medicine authenticity is difficult for ordinary users to verify.

Helix solves this by creating a **single trusted healthcare workflow** where:
- the **patient owns the medical data**,
- the **doctor sees only AI-generated summaries** of previous medical documents,
- the **hospital can access only the documents the patient explicitly allows**,
- the **pharmacy can read prescriptions through QR codes**,
- the **vendor registers medicines with authenticity proof**,
- and the **user can verify medicine authenticity independently**.

Helix is not just a file upload website.  
It is a **privacy-preserving medical coordination system**.

---

## 2. The Main Problem Helix Solves

Healthcare systems usually fail in four places:

### A. Data is hard to organize
Reports, prescriptions, insurance files, and test results exist in many different formats.

### B. Access is too open or too closed
Either the patient must manually send files everywhere, or institutions cannot get access when needed.

### C. Doctors waste time reading raw records
Instead of seeing a clean history, doctors often see long, unstructured files.

### D. Medicine authenticity is hard to verify
Counterfeit medicine and uncertain supply chains create trust issues.

Helix addresses these issues with a **controlled access model**, **AI-assisted summaries**, **QR-based prescription flow**, and **medicine verification through blockchain-backed hashing**.

---

## 3. The Core Philosophy

Helix follows five design principles:

1. **Patient ownership**
   - The patient decides who can see which document.

2. **Minimal exposure**
   - Each role sees only what it needs.

3. **AI as a mediator**
   - Doctors do not need to open raw records for every case.

4. **Traceability**
   - Access to documents is logged and visible to the patient.

5. **Authenticity**
   - Medicines can be checked against vendor-registered proof.

This makes the system safer, more structured, and more useful than a normal healthcare portal.

---

## 4. The 5 Roles in Helix

Helix has five user roles:

### 4.1 Patient
The patient is the owner of the medical data.

Patient can:
- log in,
- upload documents,
- classify the document type,
- decide whether the hospital can access a file,
- receive notifications when a hospital accesses data,
- verify medicine authenticity.

### 4.2 Doctor
The doctor creates prescriptions and reads AI summaries.

Doctor can:
- log in as doctor,
- create a prescription by typing or uploading,
- see previous prescription summaries for a patient,
- generate a prescription QR.

Doctor cannot:
- directly access the patient’s raw medical documents,
- bypass document permissions.

### 4.3 Hospital
The hospital accesses only permitted documents.

Hospital can:
- log in as hospital,
- search patient by patient ID,
- view only documents the patient has shared,
- trigger access logs and patient notifications.

Hospital cannot:
- access unshared files,
- edit patient data.

### 4.4 Pharmacy
The pharmacy handles prescription-based medicine dispensing.

Pharmacy can:
- log in as pharmacy,
- scan a prescription QR,
- fetch medicine instructions,
- verify medicine authenticity.

Pharmacy cannot:
- view patient’s private files,
- view AI summaries,
- access unrelated documents.

### 4.5 Vendor
The vendor registers medicine authenticity records.

Vendor can:
- log in as vendor,
- add medicine batch details,
- create a hash for medicine data,
- generate a medicine verification QR.

Vendor cannot:
- access patient records,
- access doctor summaries,
- access hospital files.

---

## 5. The 4 Main Pillars of the Platform

Helix is organized into four main pillars.

### Pillar 1: Patient Data Control
The patient uploads medical files and decides who can access them.

### Pillar 2: Doctor Prescription Intelligence
The doctor uses AI summaries and creates prescriptions in a structured way.

### Pillar 3: Hospital Controlled Access
The hospital can view only allowed documents and every access is logged.

### Pillar 4: Pharmacy + Vendor Trust Layer
Prescriptions are consumed by pharmacy, and medicines are verified against vendor-registered authenticity data.

---

## 6. Why Helix Is Different

Most healthcare apps do one of these:
- store documents,
- show prescriptions,
- or manage pharmacy flow.

Helix combines all of them into one controlled ecosystem.

What makes Helix different is:
- role-based access,
- patient-controlled visibility,
- doctor access to summaries instead of raw reports,
- QR-based prescription transfer,
- medicine verification for both pharmacy and user,
- audit trail for hospital access.

This creates a complete loop:
**patient → doctor → hospital → pharmacy → user verification**.

---

## 7. High-Level User Journey

### Step 1: Open the website
The user sees the landing page.

### Step 2: Choose a role
The user selects one role:
- patient,
- doctor,
- hospital,
- pharmacy,
- vendor.

### Step 3: Log in
The user logs in using email-based authentication.

### Step 4: Go to the correct dashboard
The system redirects based on role.

### Step 5: Perform role-specific actions
Each role sees only its own functions.

### Step 6: Data is saved and checked
Files, prescriptions, summaries, and verification data are stored and validated.

### Step 7: Access can be audited
Whenever hospital views a document, the patient gets a notification.

### Step 8: Medicine can be verified
Medicine QR can be scanned by pharmacy or user to check authenticity.

---

## 8. Patient Journey in Detail

The patient is the center of the system.

### 8.1 Login
The patient enters email and password and is authenticated into patient mode.

### 8.2 Upload document
The patient chooses a document type such as:
- lab report,
- prescription,
- insurance,
- other.

Then the patient uploads a file.

### 8.3 Set access permission
For each document, the patient decides whether the hospital can access it.

This is critical because the document is not blindly public.  
The access permission belongs to that specific file.

### 8.4 Save document
The file goes into storage and its metadata is saved in the database.

### 8.5 View notifications
If a hospital views the document later, the patient receives a notification.

### 8.6 Verify medicine
The patient can scan a medicine QR and check whether it is genuine.

---

## 9. Doctor Journey in Detail

The doctor does not work with raw patient documents.  
The doctor works with structured summaries and prescriptions.

### 9.1 Login
The doctor logs in with doctor role.

### 9.2 View dashboard
The doctor sees:
- prescription creation area,
- patient ID input,
- summary viewer.

### 9.3 View AI summaries
The doctor can enter a patient ID and fetch older AI-generated summaries.

This helps the doctor understand history quickly without browsing raw files.

### 9.4 Create prescription
The doctor can:
- type a prescription,
- upload a prescription image,
- optionally use a whiteboard-style writing area if implemented.

### 9.5 Generate QR
Once the prescription is saved, the system generates a QR code.

The QR becomes the handoff mechanism between doctor, patient, and pharmacy.

---

## 10. Hospital Journey in Detail

The hospital needs direct but controlled access.

### 10.1 Login
The hospital logs in under hospital role.

### 10.2 Search patient
The hospital enters a patient ID.

### 10.3 View allowed documents
The system returns only the files that the patient marked as accessible to hospital.

### 10.4 Access is logged
Every time a hospital views a file, the system records that event.

### 10.5 Patient gets notified
The patient is informed that a hospital accessed the document.

This builds trust because access is not hidden.

---

## 11. Pharmacy Journey in Detail

The pharmacy’s job is to read prescriptions and assist with medicine verification.

### 11.1 Login
The pharmacy logs in under pharmacy role.

### 11.2 Scan prescription QR
The pharmacy scans the QR generated by the doctor.

### 11.3 Fetch medicine details
The QR resolves into prescription details that list medicines and instructions.

### 11.4 Dispense medicine
The pharmacy uses the prescription to provide the correct medicine.

### 11.5 Verify medicine authenticity
The pharmacy can also scan medicine QR to check whether the product is genuine.

---

## 12. Vendor Journey in Detail

The vendor layer is used to establish authenticity of medicine batches.

### 12.1 Login
The vendor logs in under vendor role.

### 12.2 Register medicine
The vendor submits medicine batch details.

### 12.3 Create hash
The system creates a hash from the medicine metadata.

### 12.4 Store authenticity record
That hash is stored in the verification layer.

### 12.5 Generate QR
The medicine batch gets a QR that can later be scanned for verification.

This allows the pharmacy and user to validate whether a medicine came from a registered vendor record.

---

## 13. Medicine Verification Idea

This part is one of the most important trust features.

### Problem
A patient cannot always know if a medicine is authentic just by looking at packaging.

### Helix solution
Every medicine batch has a registered verification identity.

### Verification flow
- scan QR,
- extract hash or verification ID,
- check whether the record exists,
- compare vendor and batch details,
- show authenticity status.

### Possible outputs
- genuine,
- not found,
- tampered,
- expired,
- suspicious.

This makes the system useful not only for institutions but also for end users.

---

## 14. Where AI Fits

AI is used for summarization and extraction, not for replacing the healthcare workflow.

### In Helix, AI helps with:
- reading old patient data,
- generating short summaries,
- making doctor review faster.

### AI does not:
- decide access permissions,
- replace the document permission system,
- expose raw data to unauthorized roles.

This separation keeps the system practical and safer.

---

## 15. Why the System Uses QR Codes

QR codes are used because they are easy to generate, easy to scan, and easy to connect different users to the same record.

### Prescription QR
Used for:
- pharmacy access to prescription details.

### Medicine QR
Used for:
- authenticity verification of medicine.

QR codes create a clean bridge between:
- doctor and pharmacy,
- vendor and pharmacy,
- vendor and patient.

---

## 16. Why the System Uses Blockchain

Blockchain is used only where trust and tamper resistance matter.

### What it is used for
- medicine authenticity records,
- hash-based verification.

### What it is not used for
- raw patient medical files,
- large file storage,
- regular prescription content.

This keeps the blockchain layer light, efficient, and meaningful.

---

## 17. Access Control Idea

The entire project is built around access control.

The important rule is:

> Just because data exists does not mean every role can see it.

Each access decision happens on the backend, not in the UI.

Examples:
- doctor sees summaries only,
- hospital sees only allowed documents,
- pharmacy sees prescription only,
- vendor sees medicine verification data only.

This is what makes Helix feel structured and realistic.

---

## 18. Notifications Idea

Notifications make the system transparent.

If a hospital opens a shared patient document:
- the event is logged,
- the patient is notified.

This gives the patient visibility into who used their data.

That is a major trust advantage.

---

## 19. What the Final User Experience Feels Like

### For the patient
“I control my medical documents, and I know who sees them.”

### For the doctor
“I can understand the patient history quickly without reading raw paperwork.”

### For the hospital
“I can access the documents I need, but only with permission.”

### For the pharmacy
“I can read the prescription and check whether the medicine is authentic.”

### For the vendor
“I can register medicine identity and help the ecosystem trust the product.”

---

## 20. Why This Is a Strong Hackathon Project

Helix is strong because it combines:
- healthcare workflow,
- permission-based document sharing,
- AI-assisted summaries,
- QR-based prescription handling,
- blockchain-backed medicine verification.

This gives the project:
- practical use,
- strong demo value,
- clear real-world relevance,
- and enough complexity to stand out.

---

## 21. One-Sentence Summary

Helix is a multi-role healthcare platform where patients control document access, doctors use summaries to create prescriptions, hospitals access only permitted records, pharmacies dispense medicine through QR prescriptions, and medicine authenticity is verified through hashed vendor records.

---

## 22. Final Pitch Version

Helix is a privacy-first healthcare ecosystem that connects patients, doctors, hospitals, pharmacies, and vendors in one secure workflow. It reduces data leakage, improves doctor efficiency, makes hospital access transparent, and lets users verify medicine authenticity independently.

