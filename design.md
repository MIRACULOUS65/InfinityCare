# HELIX — UI/UX DESIGN PROMPT

Design a premium, brutalist, monochrome healthcare platform called **HELIX**.

This is not a generic medical dashboard. It is a **privacy-first, role-based healthcare ecosystem** with five roles:
- Patient
- Doctor
- Hospital
- Pharmacy
- Vendor

The entire interface must feel:
- clinical,
- authoritative,
- secure,
- minimal,
- high-trust,
- and extremely polished.

The system is centered around:
- patient-owned medical documents,
- doctor access to AI-generated summaries only,
- hospital access to only patient-approved files,
- pharmacy prescription QR flow,
- vendor-based medicine authenticity verification,
- and patient notifications whenever a hospital accesses data.

---

## CORE PRODUCT LOGIC

The UI must clearly express these rules:
1. One email belongs to one role only.
2. Every role has a separate dashboard and separate permissions.
3. The patient controls which documents can be accessed by the hospital.
4. Doctors do not see raw medical documents; they see summaries only.
5. Pharmacy receives prescription details through QR scanning.
6. Vendor registers medicine authenticity records and QR hashes.
7. Users can independently verify medicine authenticity.
8. Every hospital access event should be visible to the patient.

---

## VISUAL STYLE

### Strict Monochrome
Use only black, white, and grayscale.

Allowed:
- pure black
- off-black
- charcoal
- dark gray
- white
- off-white
- zinc/neutral gray tones

Not allowed:
- blue
- purple
- red accents
- green accents
- colorful gradients
- neon glows
- flashy shadows
- bright UI accents

If gradients are used at all, they must be:
- black to transparent
- dark gray to transparent
- subtle grayscale only

### Overall Aesthetic
The interface should feel like:
- high-end medical software
- a serious health infrastructure system
- a secure data vault
- a futuristic but restrained control panel

Think:
- clean whitespace
- thick typography hierarchy
- sharp borders
- precise spacing
- no visual noise

---

## TYPOGRAPHY

Use a modern geometric sans-serif style similar to:
- Geist
- Inter
- SF Pro
- or similar clean system fonts

Typography should feel:
- bold for titles
- calm for labels
- highly readable
- clinically precise

Use:
- large page titles
- compact supporting text
- strong hierarchy
- clear section separation

---

## UI PRINCIPLES

### 1. Clarity First
Every screen must immediately tell the user:
- what role they are in,
- what they can do,
- what they cannot do.

### 2. Permission Visibility
Access rules must be visible in the UI.
Example:
- “Visible to Hospital”
- “Private”
- “Doctor Summary Only”
- “QR Verified”
- “Access Logged”

### 3. Minimal Friction
Keep flows short:
- login
- role select
- dashboard
- action
- result

### 4. Trust and Auditability
The interface should make users feel:
- their data is controlled,
- access is tracked,
- medicine can be verified,
- and nothing is hidden.

### 5. Role Separation
Each role must have its own dashboard structure and feature set.
Do not mix role actions on one screen.

---

## TECH STACK TO DESIGN FOR

The interface should be implemented with:
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- GSAP + ScrollTrigger
- Lenis

The design must feel native to this stack:
- component-driven
- modular
- scalable
- cleanly animated
- easily maintainable

---

## GLOBAL DESIGN LANGUAGE

### Layout
- full-bleed black background
- centered content
- disciplined grid system
- generous vertical spacing
- minimal but strong borders
- no unnecessary decoration

### Cards
- flat cards
- black or near-black background
- 1px subtle border
- no heavy shadows
- crisp edges
- clean spacing

### Buttons
- primary button: white background, black text
- secondary button: transparent background, white border, white text
- hover states should invert cleanly

### Inputs
- dark input backgrounds
- white text
- subtle borders
- visible focus state in white/gray only

### Dialogs / Modals
- dark modal shell
- blurred dark backdrop
- very restrained motion
- no colorful overlays

### Navigation
- minimal navigation
- role-aware navigation
- compact sidebar or top bar
- clear active state using grayscale only

---

## MOTION DESIGN

Motion must feel expensive, calm, and controlled.

### Use Framer Motion for:
- page transitions
- card entrance
- hover micro-interactions
- modal open/close
- text reveals
- role selection transitions

### Use GSAP for:
- advanced scroll storytelling
- section pinning
- timeline-based reveals
- horizontal or cinematic scroll moments

### Use Lenis for:
- smooth scrolling
- polished movement feel
- premium scroll inertia

### Motion style rules:
- subtle
- physically believable
- no bouncy gimmicks
- no exaggerated scale
- no flashy transitions

Use:
- fade + slight Y translation
- scale only very subtly
- soft spring timings
- staggered text reveals

---

## INFORMATION ARCHITECTURE

The product should be organized into these major sections:

### 1. Landing Page
Purpose:
- explain Helix quickly
- establish trust
- direct user to role selection

Content:
- product name
- one-line value proposition
- “Get Started” action
- short explanation of the 5 roles
- trust-focused visual storytelling

### 2. Role Selection
Purpose:
- user chooses exactly one role

Show:
- Patient
- Doctor
- Hospital
- Pharmacy
- Vendor

Each option should be a large, elegant card with:
- role title
- short description
- clear click target
- subtle hover state

### 3. Authentication
Purpose:
- email-based login
- role locked to account

Show:
- email field
- password field
- selected role context
- sign in / create account button

### 4. Patient Dashboard
Purpose:
- upload documents
- manage access permissions
- view notifications
- verify medicine

### 5. Doctor Dashboard
Purpose:
- create prescriptions
- review AI summaries
- search patient by ID
- generate QR

### 6. Hospital Dashboard
Purpose:
- search patient ID
- view patient-approved documents
- audit access events

### 7. Pharmacy Dashboard
Purpose:
- scan prescription QR
- fetch medicine instructions
- verify medicine authenticity

### 8. Vendor Dashboard
Purpose:
- register medicine
- generate hash
- create verification QR

### 9. Verification Page
Purpose:
- let user scan medicine QR
- show whether medicine is genuine
- show vendor registration details

---

## PAGE-BY-PAGE DESIGN DIRECTION

### Landing Page
The landing page should be cinematic and minimal.

Include:
- a strong headline
- a concise subheading
- a simple hero visual suggesting secure data flow
- role cards preview
- a monochrome trust aesthetic

The page should communicate:
- privacy
- control
- verification
- intelligence

### Role Selection Page
This page should feel like a secure access checkpoint.

Each role card should be:
- large
- minimal
- distinct
- labeled clearly
- easy to choose

The UI should imply:
- “Choose your access layer”
- “Your role determines your tools”

### Patient Dashboard
The patient dashboard must feel like a personal medical vault.

Include:
- upload document area
- document type selector
- permission toggles
- list of uploaded documents
- access status badges
- notifications list
- medicine verification entry

Show the patient clearly:
- which documents are private
- which are hospital-accessible
- when a document was accessed

### Doctor Dashboard
The doctor dashboard should feel like a clinical command surface.

Include:
- patient ID search
- AI summary panel
- prescription creation area
- prescription upload option
- typed prescription option
- QR generation result area

The doctor should see:
- summary timeline
- concise structured information
- no raw patient files

### Hospital Dashboard
The hospital dashboard should feel like an audit-friendly records terminal.

Include:
- patient ID search
- permitted document list
- preview panel
- access logs
- patient-visible audit status

The layout should communicate:
- filtered access
- compliance
- transparency

### Pharmacy Dashboard
The pharmacy dashboard should feel like a dispensing and verification desk.

Include:
- prescription QR scanner
- prescription details panel
- medicine list
- verification scanner
- authenticity results

The UI should make it obvious that pharmacy:
- reads prescriptions
- dispenses medicine
- verifies product authenticity

### Vendor Dashboard
The vendor dashboard should feel like a controlled supply-chain registry.

Include:
- medicine registration form
- batch details
- hash generation status
- verification QR output
- authenticity registry record

This screen should emphasize:
- provenance
- traceability
- immutability
- audit trail

### Verification Page
This page should be the final trust checkpoint.

Show:
- scanned hash
- authenticity status
- vendor registration time
- batch metadata
- clear genuine / not found / suspicious result

The result screen should be incredibly easy to interpret in one glance.

---

## COMPONENT STYLE GUIDELINES

### Use shadcn/ui for:
- Button
- Input
- Card
- Dialog
- Sheet
- Tabs
- Badge
- DropdownMenu
- Table
- Tooltip
- ScrollArea

But all components must be restyled into a monochrome system:
- white text
- dark surfaces
- subtle borders
- no default blue focus rings
- no colorful state colors

### Badge meanings
Use grayscale semantics only:
- allowed
- private
- shared
- verified
- pending
- logged

Do not use colored success/error styles.

---

## DATA DISPLAY PRINCIPLES

When showing medical data:
- keep the layout dense but readable
- use clear labels
- emphasize timestamps
- show permission states visually
- show audit trail context
- never overwhelm the user with unnecessary text

Summaries should be:
- short
- clean
- structured
- easy to scan

Documents should display:
- document type
- upload date
- access status
- hospital permission state

Prescriptions should display:
- medicine name
- dosage
- instructions
- QR status

Verification should display:
- vendor identity
- batch details
- authenticity state
- registration timestamp

---

## INTERACTION DESIGN

### Hover
Hover states should be subtle:
- slight border brightness change
- slight opacity shift
- tiny lift if needed

### Focus
Use strong but minimal focus rings:
- white or gray only
- never blue

### Click
Buttons should feel crisp and immediate.

### Loading
Loading states should be monochrome:
- skeleton bars
- subtle pulsing blocks
- no colorful spinners

### Success / Error
Even feedback should remain monochrome:
- success = white/gray confirmation
- error = white text on dark alert surface with border emphasis

---

## RESPONSIVE DESIGN

The interface must work on:
- desktop
- tablet
- mobile

Rules:
- role cards stack gracefully on mobile
- dashboard panels collapse without losing clarity
- sidebar becomes drawer on smaller screens
- tables become stacked cards where needed
- QR scanning should remain accessible on mobile

---

## ACCESSIBILITY

The UI must be highly readable and accessible:
- strong contrast
- clear focus states
- keyboard navigable components
- semantic headings
- screen reader friendly labels
- sufficient touch target sizes

Because this is healthcare software, accessibility matters.

---

## WHAT THE UI SHOULD FEEL LIKE EMOTIONALLY

The design should communicate:
- trust
- authority
- clarity
- control
- precision
- privacy
- seriousness

It should **not** feel playful, decorative, or consumer-app-like.

---

## WHAT TO AVOID

Do not use:
- colorful gradients
- bright accent colors
- heavy shadows
- glassmorphism overload
- emoji-heavy UI
- playful illustrations
- cartoon styling
- excessive animations
- cluttered dashboards
- rounded “cute” visuals

Do not make it look like:
- a startup landing page with flashy color
- a social app
- a gaming dashboard
- a consumer health tracker

It must look like a secure healthcare infrastructure product.

---

## FINAL DESIGN SUMMARY

Helix should feel like a monochrome medical operating system:
- patient-controlled
- role-separated
- data-audited
- QR-driven
- verification-first
- clean, premium, and highly functional

The design must support the idea that:
- medical data is owned by the patient,
- doctors get intelligent summaries,
- hospitals get only what is permitted,
- pharmacies handle prescriptions safely,
- vendors register medicines reliably,
- and users can verify authenticity themselves.

Build the interface as a serious, elegant, black-and-white system with precise motion, structured layouts, and clear trust cues.