# HELIX Workflow Specification

## Purpose

This document describes the full end-to-end workflow of **HELIX**, including:
- what each user sees and does,
- what happens internally under the hood,
- what data is stored,
- what services are called,
- what each role is allowed to access,
- and how the whole system connects from login to verification.

This is written so that a new developer, another AI model, or a code generation agent can understand the system in one pass.

---

## 1. System Summary

HELIX is a healthcare platform with **5 roles**:

1. **Patient**
2. **Doctor**
3. **Hospital**
4. **Pharmacy**
5. **Vendor**

The system is built around **4 main pillars**:

- **Patient Data Control**
- **Doctor Prescription Flow**
- **Hospital Document Access**
- **Pharmacy + Vendor Medicine Verification**

The core design principle is:

> **The patient owns the data.**
> Raw medical documents stay private.
> Doctors use AI summaries instead of raw files.
> Hospitals only see documents that the patient explicitly allows.
> Pharmacies only access prescription QR data.
> Medicines are verified through blockchain-backed hashes.

---

## 2. Technology Stack

### Frontend + Backend
- **Next.js**
- **TypeScript**
- **App Router**
- **Tailwind CSS**

### Authentication
- **Better Auth** or **NextAuth**
- Session-based authentication
- Role-based access control
- One email = one role

### Database
supabase with **Prisma** 

### File Storage
- **Cloudinary** 
- Used for document and image uploads

### QR Handling
- QR generation library
- QR scanning library or browser camera support

### Blockchain Layer
- Blockchain integration for medicine authenticity
- Can start with a mock storage layer and later connect to a real chain

### AI/ML Layer
- Separate service handled by another teammate
- This workflow only describes how the main app uses AI outputs

---

## 3. Roles and Access Rules

### 3.1 Patient
Patient can:
- register / log in
- upload medical documents
- choose document type
- decide whether the hospital can access the document
- view access notifications
- verify medicine authenticity

Patient cannot:
- edit doctor prescriptions
- access other users’ data
- bypass access rules

### 3.2 Doctor
Doctor can:
- log in with doctor role
- upload a prescription image
- create a prescription by typing
- optionally create a prescription in a whiteboard-style area if implemented
- fetch AI summaries of old prescriptions using patient ID

Doctor cannot:
- view raw patient documents
- see hospital-only documents unless explicitly allowed through a separate rule
- access pharmacy inventory data
- access patient private documents directly

### 3.3 Hospital
Hospital can:
- log in with hospital role
- search a patient by patient ID
- view only the documents the patient has allowed
- receive access logs and patient-visible audit events

Hospital cannot:
- see hidden documents
- edit documents
- see doctor summaries unless explicitly permitted by the system design

### 3.4 Pharmacy
Pharmacy can:
- log in with pharmacy role
- scan prescription QR
- read prescription details
- verify medicine authenticity using the medicine QR or hash

Pharmacy cannot:
- access patient document storage
- access AI summaries
- access unrelated hospital records

### 3.5 Vendor
Vendor can:
- log in with vendor role
- register a medicine batch
- store authenticity metadata
- generate a blockchain-backed hash
- produce a verification QR for that medicine batch

Vendor cannot:
- access patient medical records
- access doctor notes
- access hospital documents

---

## 4. Role Assignment Rule

### Rule
**One email can belong to only one role.**

This is enforced in the database and authentication layer, not only in the UI.

### Under the hood
When a user signs up:
1. The user selects a role.
2. The backend checks whether the email already exists.
3. If the email already exists, the stored role is used.
4. The role cannot be changed from the frontend after registration.

### Why this matters
This prevents:
- users logging in as a different role using the same email,
- privilege escalation,
- accidental data leaks across roles.

---

## 5. Application Layout

### Main pages
- Landing page
- Role selection page
- Login / signup page
- Role dashboard pages
- Verification page
- Upload / detail pages

### Role dashboards
- `/patient`
- `/doctor`
- `/hospital`
- `/pharmacy`
- `/vendor`

### Other important pages
- `/verify/[hash]`
- `/prescription/[id]`
- `/document/[id]`
- `/notifications`

---

## 6. Global Workflow Overview

### High-level flow

1. User visits the website.
2. User selects a role.
3. User logs in.
4. User is redirected to the correct dashboard.
5. Role-specific actions are performed.
6. Data is stored in the database or file storage.
7. Permission checks run on every protected action.
8. Blockchain or verification services are called when required.
9. Patient-facing events generate notifications.

---

## 7. Patient Workflow

## 7.1 Patient Login

### User sees
- email login
- password login
- selected role: Patient

### Under the hood
1. Auth provider validates credentials.
2. Session is created.
3. Role is stored in session.
4. Middleware checks that the role is `PATIENT`.
5. User is redirected to the patient dashboard.

---

## 7.2 Patient Dashboard

### User sees
- upload document card
- my documents list
- notification panel
- medicine verification tool

### Under the hood
The dashboard loads:
- the patient profile,
- uploaded documents,
- notification history,
- access settings.

The system calls internal APIs to fetch:
- documents by patient ID,
- unread notifications,
- allowed access rules.

---

## 7.3 Upload Document

### User sees
1. Select document type
2. Upload file
3. Choose whether the hospital can access it
4. Submit

### Supported document types
- lab report
- prescription
- insurance
- discharge summary
- other

### Under the hood
1. File is uploaded to storage.
2. File URL is returned.
3. The system creates a document record in the database.
4. The access flag `access_hospital` is saved.
5. A document hash may be computed if needed for integrity checks.
6. If the AI pipeline is connected, the document can be forwarded for summary generation.
7. The patient sees the file in their document list.

### Stored data
- patient ID
- document type
- file URL
- permission flag
- timestamp

---

## 7.4 Patient Access Control

### User sees
A toggle or checkbox:
- Allow hospital access
- Keep private

### Under the hood
The access decision is stored per document.

Example:
- `access_hospital = true` means hospital can view this document
- `access_hospital = false` means only the patient can see it

This permission is checked every time a hospital requests the file.

---

## 7.5 Patient Notifications

### What triggers a notification
Whenever a hospital accesses a permitted document.

### User sees
A notification like:
- “Hospital accessed your lab report”
- “Your document was viewed at 10:45 AM”

### Under the hood
1. Hospital requests patient documents.
2. System logs access.
3. Notification record is created.
4. Notification appears in patient dashboard.

### Stored fields
- patient ID
- event type
- message
- read/unread state
- timestamp

---

## 7.6 Patient Medicine Verification

### User sees
- QR scanner
- verification result screen

### Under the hood
1. User scans QR on a medicine package.
2. QR yields a hash or verification URL.
3. Backend queries the verification source.
4. Authenticity data is returned.
5. UI shows genuine / not genuine status.

### Result possibilities
- Genuine
- Not found
- Expired
- Suspicious / duplicate scan

---

## 8. Doctor Workflow

## 8.1 Doctor Login

### User sees
- email login
- password login
- selected role: Doctor

### Under the hood
1. Auth provider validates login.
2. Session is created.
3. Middleware ensures role is `DOCTOR`.
4. Doctor dashboard is displayed.

---

## 8.2 Doctor Dashboard

### User sees
- create prescription button
- upload prescription image option
- typed prescription option
- AI summary lookup by patient ID

### Under the hood
The dashboard loads:
- doctor profile,
- prescription history,
- patient summary lookup form.

---

## 8.3 Doctor Prescription Creation

There are two implementation paths in the UI:

### A. Upload prescription image
Doctor uploads an image of a handwritten or scanned prescription.

### B. Type prescription directly
Doctor enters medicine details in structured fields.

### Under the hood
Regardless of input method, the system normalizes everything into a structured prescription object.

Example normalized object:
```json
{
  "patient_id": "PAT123",
  "doctor_id": "DOC456",
  "medicines": [
    {
      "name": "Paracetamol",
      "dose": "500mg",
      "frequency": "2 times a day",
      "duration": "5 days"
    }
  ],
  "instructions": "Take after food"
}
```

### What happens next
1. The prescription is saved in the database.
2. A unique prescription ID is generated.
3. A QR is generated from that prescription ID.
4. The QR can be shown to the patient.
5. The pharmacy scans it to read medicine instructions.

---

## 8.4 Doctor AI Summary Lookup

### User sees
- patient ID input field
- list of AI summaries
- timeline of previous summaries

### Under the hood
1. Doctor enters patient ID.
2. The app sends the ID to the summary service.
3. The AI service returns summary data for older prescriptions.
4. The doctor sees only the summary, not raw documents.

### Important restriction
The doctor does **not** open the original medical files from the patient upload system. Only summaries are shown.

---

## 8.5 Prescription QR Output

### QR contains
- a prescription ID
- or a URL pointing to the prescription data endpoint

### Under the hood
1. Prescription data is stored.
2. QR is generated for a specific prescription record.
3. The QR is shared with the patient.
4. Pharmacy uses it to fetch the medicine details.

---

## 9. Hospital Workflow

## 9.1 Hospital Login

### User sees
- email login
- password login
- selected role: Hospital

### Under the hood
1. Auth provider checks credentials.
2. Session is created.
3. Middleware checks role = `HOSPITAL`.
4. User is redirected to hospital dashboard.

---

## 9.2 Hospital Dashboard

### User sees
- patient ID search
- permitted document list
- document viewer
- access history

### Under the hood
The dashboard calls:
- patient search endpoint,
- access-controlled document query,
- access logs query.

---

## 9.3 Search Patient by ID

### User sees
- search bar
- results panel

### Under the hood
1. Hospital enters patient ID.
2. Backend looks up patient record.
3. The system returns only documents that have `access_hospital = true`.
4. Hidden documents do not appear.

### Core filter logic
- match patient ID
- filter by permission flag
- return only permitted records

---

## 9.4 Hospital Document Viewing

### User sees
- document list
- open document button
- document preview or file download

### Under the hood
1. User clicks a permitted document.
2. Backend checks permission again.
3. File URL is returned only if access is allowed.
4. Document is displayed to hospital user.
5. Access is logged.
6. Patient notification is created.

---

## 9.5 Access Logging and Notification

### What happens after access
1. An access log is inserted.
2. A notification is written.
3. The patient dashboard reflects the event.

### Why this matters
This gives the patient a full audit trail of who accessed which document.

---

## 10. Pharmacy Workflow

## 10.1 Pharmacy Login

### User sees
- email login
- password login
- selected role: Pharmacy

### Under the hood
1. Auth provider validates the login.
2. Session is created.
3. Middleware checks role = `PHARMACY`.
4. Pharmacy dashboard is shown.

---

## 10.2 Pharmacy Dashboard

### User sees
Two main actions:
- scan prescription QR
- verify medicine authenticity

### Under the hood
The dashboard connects to:
- prescription lookup,
- QR parsing,
- medicine verification endpoint.

---

## 10.3 Scan Prescription QR

### User sees
- camera scanner
- upload QR image option
- medicine details panel

### Under the hood
1. QR is scanned.
2. QR content is decoded.
3. Prescription ID is extracted.
4. Backend fetches prescription data.
5. Pharmacy sees the medicine list and instructions.
6. Prescription details are shown only for dispensing.

### Important restriction
Pharmacy does not receive patient medical files or AI summaries. It only gets the prescription-related data required for dispensing.

---

## 10.4 Medicine Authenticity Verification

### User sees
- medicine QR scanner
- authenticity result
- vendor details
- registration timestamp

### Under the hood
1. Pharmacy scans medicine QR.
2. QR contains a hash or verification URL.
3. Backend checks the authenticity registry or blockchain source.
4. Response returns:
   - whether the medicine is genuine,
   - which vendor registered it,
   - when it was registered,
   - batch information,
   - current verification state.

### Possible outcomes
- genuine
- unknown
- tampered
- expired
- duplicated

---

## 11. Vendor Workflow

## 11.1 Vendor Login

### User sees
- email login
- password login
- selected role: Vendor

### Under the hood
1. Auth provider validates login.
2. Session is created.
3. Middleware checks role = `VENDOR`.
4. Vendor dashboard opens.

---

## 11.2 Vendor Dashboard

### User sees
- add medicine form
- batch registration form
- generate QR button
- authenticity status viewer

### Under the hood
The vendor module prepares medicine records for verification.

---

## 11.3 Register Medicine

### User sees
Fields such as:
- medicine name
- batch number
- manufacturer
- expiry
- quantity
- optional metadata

### Under the hood
1. Vendor fills the form.
2. System creates a medicine payload.
3. A hash is generated from the payload.
4. The hash is stored in the verification layer.
5. The record is attached to vendor identity and timestamp.
6. QR is generated for the medicine batch.

### Why the hash matters
The hash acts as the immutable fingerprint of the medicine batch.

---

## 11.4 Medicine QR Generation

### QR contains
- verification hash
- or a verification URL containing the hash

### Under the hood
1. Hash is encoded into a QR.
2. QR is attached to the product or packaging.
3. Pharmacy and user can scan it later.
4. Verification endpoint resolves the stored authenticity data.

---

## 12. Medicine Verification Flow

This flow can be used by:
- pharmacy
- patient
- any verifier allowed by the system

### Steps
1. Scan medicine QR.
2. Extract hash.
3. Query verification registry or blockchain-backed storage.
4. Retrieve vendor registration details.
5. Compare metadata.
6. Display authenticity result.

### Data returned
- medicine name
- batch number
- vendor ID
- registration time
- verification status
- other stored authenticity fields

---

## 13. AI/ML Integration Boundary

The main application does **not** implement the AI/ML logic directly.

### What the main app does
- sends patient document metadata to the AI service
- receives a summary result
- stores and displays the summary

### What the AI service does
- OCR
- extraction
- summary generation
- NLP processing

### Important boundary rule
The app treats AI as an external service or separate module. It only consumes the output.

---

## 14. Main Data Objects

## 14.1 User
- id
- email
- role
- password hash or auth provider ID
- timestamps

## 14.2 Document
- id
- patient ID
- document type
- file URL
- access_hospital flag
- created timestamp

## 14.3 AI Summary
- id
- patient ID
- document ID
- summary text
- created timestamp

## 14.4 Prescription
- id
- patient ID
- doctor ID
- structured medicine data
- created timestamp

## 14.5 Notification
- id
- patient ID
- message
- read/unread status
- created timestamp

## 14.6 Access Log
- id
- patient ID
- hospital ID
- document ID
- accessed at

## 14.7 Medicine Verification Record
- hash
- vendor ID
- batch details
- registered timestamp
- current status

---

## 15. Core Security Rules

### Rule 1
Never trust the frontend for permissions.

### Rule 2
Every protected API checks the session role.

### Rule 3
The doctor cannot open raw patient files.

### Rule 4
The pharmacy cannot open patient documents or AI summaries.

### Rule 5
The hospital can only see documents marked as allowed.

### Rule 6
Every hospital access event is logged and can notify the patient.

### Rule 7
A user cannot switch roles just by changing a URL or form value.

---

## 16. Under-the-Hood Sequence Examples

## 16.1 Patient uploads a report
1. Patient logs in.
2. Patient selects document type.
3. Patient uploads file.
4. File is saved in storage.
5. Metadata is stored in DB.
6. Access rule is saved.
7. Optional AI pipeline is triggered.
8. Upload appears in dashboard.

## 16.2 Doctor creates a prescription
1. Doctor logs in.
2. Doctor enters medicine details.
3. Data is normalized.
4. Prescription is saved.
5. QR is generated.
6. Patient receives the prescription QR.

## 16.3 Hospital views a patient document
1. Hospital logs in.
2. Hospital searches patient ID.
3. Backend filters allowed documents.
4. Hospital opens permitted file.
5. Access is logged.
6. Patient receives notification.

## 16.4 Pharmacy verifies medicine
1. Pharmacy scans medicine QR.
2. Hash is extracted.
3. Registry or blockchain source is queried.
4. Authenticity is returned.
5. Pharmacy shows result to user.

## 16.5 Patient verifies medicine
1. Patient scans package QR.
2. Verification page opens.
3. Hash is checked.
4. Result is displayed.

---

## 17. Suggested Implementation Principle

To keep the project buildable:
- keep the frontend simple,
- keep auth managed by a library,
- keep AI separate,
- keep blockchain storage minimal at first,
- keep all role checks on the server.

This reduces complexity while preserving the project’s core value.

---

## 18. Final System Identity

HELIX is a healthcare workflow system where:
- patients control access to their data,
- doctors work from AI summaries and structured prescriptions,
- hospitals only see permitted documents,
- pharmacies consume QR-based prescriptions,
- vendors register medicine authenticity,
- and patients can verify both access and medicine integrity.

---

## 19. Final One-Line Summary

**HELIX is a role-based healthcare platform that combines private medical document sharing, AI-assisted doctor workflows, QR-based prescriptions, and medicine authenticity verification.**
