<div align="center">


<br/>

[![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Inter&weight=600&size=22&duration=3500&pause=1000&color=FFFFFF&background=09090B00&center=true&vCenter=true&multiline=true&repeat=true&width=750&height=90&lines=A+unified+admin+dashboard+for+gym+operations.;Member+management%2C+payments+%26+digital+receipts.;Trainer+payroll+%26+body+measurement+tracking.;Automated+WhatsApp+billing+alerts+via+Twilio.)](https://git.io/typing-svg)

<br/>

![GitHub last commit](https://img.shields.io/github/last-commit/Konete326/bicepsappanas?style=for-the-badge&color=ffffff&labelColor=09090b&logo=github&logoColor=white)
![GitHub repo size](https://img.shields.io/github/repo-size/Konete326/bicepsappanas?style=for-the-badge&color=ffffff&labelColor=09090b&logo=files&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-ffffff?style=for-the-badge&logo=mongodb&logoColor=09090b&labelColor=09090b)
![React](https://img.shields.io/badge/React-19-ffffff?style=for-the-badge&logo=react&logoColor=09090b&labelColor=09090b)
![Node.js](https://img.shields.io/badge/Node.js-LTS-ffffff?style=for-the-badge&logo=nodedotjs&logoColor=09090b&labelColor=09090b)
![Express](https://img.shields.io/badge/Express-v5-ffffff?style=for-the-badge&logo=express&logoColor=09090b&labelColor=09090b)

</div>

---

## Overview

**BicepsApp** is a cloud-based Gym Management System built exclusively for **Wreck & Build Ladies & Gents Fitness Gym**, located in Nazimabad No. 5, Karachi. The application replaces the gym's legacy paper-based operations — manual receipt booklets, membership notebooks, cardboard fitness charts, and handwritten salary ledgers — with a centralized, secure, and fully digital admin dashboard.

The system is architected on the **MERN stack** (MongoDB, Express.js, React, Node.js) and integrates Twilio WhatsApp for automated billing notifications and Cloudinary for media asset management.

---

## The Problem It Solves

Before BicepsApp, the gym relied entirely on physical documents:

| Physical Asset | Problem |
|---|---|
| Membership card notebooks | Data loss, no search, no expiry tracking |
| Manual receipt booklets | Accounting errors, no digital backup |
| Cardboard fitness charts | No history, no BMI computation |
| Handwritten advance ledgers | Calculation errors in trainer payroll |

BicepsApp digitizes all four into a single, coherent system accessible from any device.

---

## Core Modules

### 1 — Member Management & Digital Receipt Engine

Manages the complete membership lifecycle — from registration to renewal — and replaces the physical 12-month payment grid on the back of membership cards with a digital status matrix.

**How it works:**
1. Admin enters the member's Roll Number
2. System verifies membership status from the `Members` collection
3. A sequential Serial Number is generated (initialized from the last physical receipt to maintain continuity)
4. Payment is recorded (Cash / Cheque / UPI) and the 12-month grid is updated
5. A digital PDF receipt is generated on-demand

```
Outstanding Dues  =  Plan Base Fee  −  Amount Paid
```

---

### 2 — Trainer Salary & Advance Ledger

Replaces the manual advance register with a structured digital ledger that tracks base pay, session commissions, and advance disbursements per trainer.

**Net Salary Formula:**
```
Net Salary  =  Base Salary  +  (Sessions Completed × Session Rate)  −  Advance Balance
```

- Every advance disbursement creates a debit entry; the advance balance updates automatically
- On monthly payout, the advance balance auto-clears to zero
- Negative balances trigger system-level alerts

---

### 3 — Body Measurements & Progress Tracking

Digitizes the gym's manual fitness charts into a historical measurement log with BMI computation and progress visualization charts.

**BMI Calculation:**
```
BMI  =  Weight (kg)  ÷  Height (m)²
```

| Category | BMI Range | System Response |
|---|---|---|
| Underweight | < 18.5 | Triggers high-protein, high-calorie diet alert |
| Normal | 18.5 – 24.9 | No action — continue current plan |
| Overweight | ≥ 25.0 | Triggers increased cardio and max-sets recommendation |
| Obesity | ≥ 30.0 | Urgent intervention notification dispatched |

**Tracked metrics:** Weight · Bicep · Shoulder · Chest · Waist · Calf · Leg

> Measurements are to be logged on the **3rd of every month** as the system's standard data integrity protocol.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + Vite | Component-driven UI, ultra-fast dev server |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui | 40+ accessible atomic components (Radix-based) |
| Framer Motion | Page transitions and micro-animations |
| Recharts | Progress and dashboard data visualization |
| TanStack React Query v5 | Server-state management and caching |
| React Router DOM v7 | Client-side routing |
| React Hook Form + Zod | Form handling and schema validation |
| Axios | HTTP client for API communication |
| Lucide React | Icon library |

### Backend

| Technology | Purpose |
|---|---|
| Node.js (LTS) | JavaScript runtime environment |
| Express.js v5 | RESTful API framework |
| Mongoose (ODM) | MongoDB schema modeling and validation |
| JSON Web Token (JWT) | Stateless admin authentication |
| bcryptjs | Password hashing |
| Multer | File upload handling |
| date-fns | Date computation utilities |
| Nodemon | Development auto-reload |

### Infrastructure

| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted NoSQL database |
| Cloudinary | Media and image asset hosting |
| Twilio WhatsApp API | Automated billing and expiry alerts |
| Vercel | Frontend deployment |

---

## UI Theme — Happy Hanger

The application's interface is built on the `material-shadcn-1.0.0` design system, branded as **Happy Hanger** by Konete326. It follows a strict monochromatic, minimalist-modern aesthetic.

```
Dark Mode
  Background  →  hsl(240, 10%, 3.9%)   #09090b   Deep washed dark
  Foreground  →  hsl(0, 0%, 100%)       #ffffff   Pure white

Light Mode
  Background  →  hsl(0, 0%, 97%)        #f7f7f7   Soft off-white
  Primary     →  hsl(0, 0%, 0%)         #000000   Solid black

Border Tint  →  hsl(214, 32%, 91%)      #e2e8f0   Subtle blue-gray
Border Radius  →  0.75rem (12px)
Font Stack     →  Inter / system-ui
Base Font Size →  14px
```

**Signature elements:**
- **Grain texture overlay** — A fixed noise texture at `0.08` opacity gives the UI a tactile, physical material feel
- **Custom slim scrollbars** — `6px` webkit scrollbars that blend into the muted background
- **High visual hierarchy** — Fully monochromatic with contrast-driven structure, no decorative color

---

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    React.js Frontend                     │
│         Admin Dashboard  ·  React 19  ·  shadcn/ui       │
└────────────────────────────┬─────────────────────────────┘
                             │  Axios REST API Requests
┌────────────────────────────▼─────────────────────────────┐
│                   Express.js Backend                     │
│      JWT Middleware  ·  MVC Controllers  ·  Twilio       │
└────────────────────────────┬─────────────────────────────┘
                             │  Mongoose ODM
┌────────────────────────────▼─────────────────────────────┐
│                  MongoDB Atlas (NoSQL)                   │
│      Normalized schemas with referenced ObjectIDs        │
└──────────────────────────────────────────────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
      Cloudinary          Twilio          Vercel / Render
    (Media Assets)   (WhatsApp Alerts)  (Production Host)
```

---

## Database Collections

```
MongoDB Atlas
│
├── Members              rollNo · fullName · fatherName · cellNo · address
│                        joiningDate · renewalDate · status · planLink
│
├── Payments             serialNo · memberId · amountReceived
│                        paymentMethod · chequeOrTransactionNo
│
├── PhysicalMeasurements memberId · age · heightFeetInches · weightHistory
│                        bicepHistory · BMI · exerciseSchedule · mealPlan
│
├── SalaryLedger         trainerId · baseSalary · commissionRate
│                        advanceBalance · transactionType · debit/credit
│
├── MembershipPlans      planName · duration · price
│
├── Trainers             fullName · phone · baseSalary · commissionRate
│
└── Notifications        auto-generated system alerts · read status · timestamp
```

---

## API Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/admin/login` | Authenticate admin and receive JWT | Public |
| `POST` | `/api/members` | Register a new gym member | Admin |
| `GET` | `/api/members` | List all members | Admin |
| `GET` | `/api/members/payment-grid/:id` | Retrieve 12-month payment matrix | Admin |
| `POST` | `/api/payments` | Record payment and generate receipt | Admin |
| `GET` | `/api/payments` | List all payment records | Admin |
| `POST` | `/api/trainers` | Register a trainer | Admin |
| `POST` | `/api/trainers/ledger` | Post salary or advance ledger entry | Admin |
| `GET` | `/api/trainers/ledger/:id` | View full trainer ledger statement | Admin |
| `POST` | `/api/measurements` | Log monthly body measurements | Admin |
| `POST` | `/api/routines` | Assign workout plan and meal schedule | Admin |
| `GET` | `/api/dashboard` | Retrieve aggregated dashboard stats | Admin |
| `GET` | `/api/notifications` | View all system notifications | Admin |

---

## WhatsApp Billing Alerts

A server-side scheduled job runs **daily** to check all active members' `renewalDate` fields. When a match is found, Twilio dispatches a WhatsApp message automatically:

```
Assalam-o-Alaikum [Member Name],

This is a reminder from BicepsApp — Wreck & Build Gym.

Invoice Serial No: [S.No]
Outstanding Dues:  Rs. [Amount]
Renewal Deadline:  [Date]

Kindly visit the counter for verification and receipt collection.
Thank you.
```

Every dispatched message logs a **Twilio Message SID** for a complete audit trail.

---

## Security

- **JWT Authentication** — All admin-only routes are protected by a JWT verification middleware layer
- **Single Admin Architecture** — Pricing, discounts, and system configurations are accessible only to the verified admin account
- **Schema Validation** — Every write operation passes through Mongoose schema-level validation before touching the database
- **Environment Isolation** — All sensitive credentials (MongoDB URI, JWT secret, Cloudinary keys, Twilio tokens) are stored strictly in `.env` files and are never committed to the repository
- **Audit Trail** — All collections use `timestamps: true` to track `createdAt` and `updatedAt` for every document

---

## Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signing_secret

CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/Konete326/bicepsappanas.git
cd bicepsappanas

# 2. Start the backend server
cd server
npm install
npm run dev

# 3. Start the frontend (in a new terminal)
cd client
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend (Admin Dashboard) | `http://localhost:5173` |
| Backend API | `http://localhost:5000` |

---

## Deployment Phases

```
Phase 1  ──  Environment & Database Setup
             MongoDB Atlas cluster · Schema validation policies · Indexing

Phase 2  ──  Controller Programming
             Trainer advance ledger · Serial receipt sequences · BMI engine

Phase 3  ──  Theme Integration & Go-Live          ← Current Phase
             shadcn/ui theme mapping · Twilio live testing · Production deploy
```

---

## Functional Transition Matrix

| Physical Document | Digital Collection | Key Fields Mapped | Outcome |
|---|---|---|---|
| Membership Card | `Members` | rollNo, fullName, fatherName, cellNo, renewalDate | Instant lookup, expiry tracking |
| Receipt Booklet | `Payments` | serialNo, amountReceived, paymentMethod | Transparent accounting, digital PDFs |
| Fitness Chart | `PhysicalMeasurements` | BMI, body metrics, monthly history | Progress visualization charts |
| Advance Register | `SalaryLedger` | advanceBalance, debit/credit entries | Accurate auto-calculated payroll |

---

<div align="center">

<br/>

Built for **Wreck & Build Ladies & Gents Fitness Gym** · Nazimabad No. 5, Karachi

by [Konete326](https://github.com/Konete326)

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=09090b&height=120&section=footer&animation=fadeIn" width="100%"/>

</div>
