# System Requirements Document (SRD) — BicepsApp

## 1. Introduction
This Document (SRD) outlines the specific system-level workflow and integration requirements for **BicepsApp** — a Gym Management System for **Wreck & Build Ladies & Gents Fitness Gym** (Nazimabad No 5, Karachi). It serves as the bridge between technical components (TRD) and product features (PRD), defining how the system modules interact to replace the gym's manual paper-based operations.

## 2. System Architecture Design
* **Frontend UI Architecture:** Developed via Vite + React 19 + Tailwind CSS v4 + shadcn/ui. The UI strictly follows a component-driven design pattern to ensure high modularity. The admin dashboard is the single entry point for all gym operations.
* **Backend API Architecture:** A RESTful MVC (Model-View-Controller) setup using Node.js + Express.js. Routing, Models, and Controllers are separated with strict file-size constraints for readability. JWT middleware guards all admin-only endpoints.
* **Database Layer:** MongoDB Atlas with Mongoose ODM serves as the core persistence layer. Schemas are normalized using referenced ObjectIDs for relational integrity between Members, Payments, Measurements, and SalaryLedger collections.
* **Asset Layer:** Cloudinary handles all media uploads. The system only stores the generated secure URL paths in MongoDB.

## 3. Core System Modules & Workflows

### 3.1 Module 1: Trainer Salary & Advance Ledger Management
* **System Workflow:**
  1. Admin registers trainer profiles with base salary, commission rate, and contact details
  2. Advance payments are logged as debit entries in the SalaryLedger collection
  3. Monthly net salary is computed: `Net Salary = Base Salary + (Sessions Completed × Rate Per Session) − Advance Balance`
  4. On payout, the advance balance auto-deducts to clear state
* **Validation Rules:** All ledger entries require transaction type (debit/credit), amount, and reference note. Negative balances trigger alerts.

### 3.2 Module 2: User Fees Pipeline & Digital Receipt Engine
* **System Workflow:**
  1. Admin inputs member Roll No for payment verification
  2. System verifies member existence and active status in Members schema
  3. Sequential Serial No is generated (initialized from last physical receipt number)
  4. Payment is validated (Cash/Cheque/UPI) and saved in Payments DB
  5. 12-month payment grid is dynamically updated for the member
  6. Digital PDF invoice is generated for the receipt
* **12-Month Grid:** The physical membership card's 12-month grid is replicated as a digital 12-column status matrix where admin controls each month's pay state dynamically.
* **Outstanding Dues Calculation:** `Outstanding Dues = Plan Base Fee − Amount Paid`

### 3.3 Module 3: Special User Routine & Progress Tracking
* **System Workflow:**
  1. Admin logs monthly body measurements (age, height, weight, bicep, shoulder, chest, waist, calf, leg)
  2. System computes BMI dynamically: `BMI = Weight (kg) / Height (m)²`
  3. BMI category is classified (Underweight < 18.5, Normal, Overweight ≥ 25.0, Obesity)
  4. Progress trajectories are rendered as visualization charts from historical data
  5. Exercise schedules and meal plans are stored per member
* **Automated Alerts:**
  - Underweight members trigger diet optimization notifications (high-protein, high-calorie)
  - Overweight members trigger routine adjustment recommendations (increased cardio, max sets)
* **Data Logging Standard:** Body dimensions are to be monitored and logged on the **3rd of every month** for consistent historical trend analysis.

## 4. Twilio WhatsApp Notification System
* **Expiry Trigger:** Server-side scheduled jobs run daily to check `renewalDate` fields across all active members
* **Alert Dispatch:** When a match is found, Twilio WhatsApp API dispatches a formatted message containing:
  - Member name
  - Invoice serial number
  - Outstanding dues amount
  - Renewal deadline date
* **Delivery Confirmation:** Message SID is logged for audit trail

## 5. Security, Performance & Maintenance
* **JWT Authentication:** Single-admin architecture with JWT token-based session management
* **No-Dummy Protocol:** Every module is built to be 100% production functional with zero placeholder logic
* **Vulnerability Safeguards:** All API endpoints perform exhaustive validation. Mongoose schemas implement tight verification before writing
* **Dependency Currentness:** The system relies exclusively on the newest stable releases of all frameworks and packages
* **Serial Number Integrity:** Digital receipt sequences maintain continuity with the physical receipt booklet's last entry
* **Audit Trail:** All collections use `timestamps: true` for created/updated tracking

## 6. Functional Transition Matrix
| Physical Gym Document | Digital Collection | Key Fields | Outcome |
|---|---|---|---|
| Membership Card | Members | rollNo, fullName, fatherName, cellNo, address, joiningDate, renewalDate, status | Zero redundancy, fast indexing |
| Manual Receipt Booklet | Payments | serialNo, memberId, amountReceived, paymentMethod | Transparent accounting, digital receipts |
| Fitness Chart/Measurements | PhysicalMeasurements | Monthly logs, BMI, body part measurements | Historical progress charts |
| Manual Advance Ledger | SalaryLedger | baseSalary, commissionRate, advanceBalance, transactionType | Accurate payroll, auto-deductions |

---
*Last Updated: June 2026*
# System Requirements Document (SRD)

## 1. Introduction
This Document (SRD) outlines the specific system-level workflow and integration requirements for the Clothing Point of Sale (POS) & Inventory Management Application. It serves as the bridge between technical components (TRD) and product features (PRD).

## 2. System Architecture Design
* **Frontend UI Architecture:** Developed via Vite + React. The UI strictly follows a component-driven design pattern to ensure high modularity and zero monolithic bloat.
* **Backend API Architecture:** A lightweight Node.js + Express.js RESTful setup. Routing, Models, and Controllers are separated with a strict guideline constraint to keep files highly readable (within the 120-line limit).
* **Database Node:** MongoDB Atlas serves as the core persistence layer, tracking all product inventories securely in the cloud.
* **Asset Node:** Cloudinary handles all media. The system only stores the generated paths in the primary database.

## 3. Hardware Interoperability Models
* **POS Printer Controller:** The application logic is configured to format receipt templates and barcode sticker templates precisely for **80mm continuous thermal printers**.
* **Scanner Event Handlers:** The Point-of-Sale interface natively listens for rapid numeric inputs (typical of Barcode Scanners), capturing the scanned SKU to automate cart additions without tedious manual inputs.

## 4. Core System Workflows
* **Inventory Sub-system:** Automatically recalculates stock volumes dynamically. Implements hard checks to prevent negative inventory or out-of-stock checkouts.
* **Barcode Synthesis Engine:** Employs a generation library to craft unique, scannable barcode signatures for every individual product or batch as sticker files.
* **Dashboard Aggregation:** Runs aggregated queries against the database to calculate daily metrics, low-stock warnings, and top-selling trends for the administrative overview.

## 5. Security, Performance & Maintenance
* **No-Dummy Protocol:** Every module is built to be 100% production functional with zero placeholder logic.
* **Vulnerability Safeguards:** All API endpoints perform exhaustive validation. Database models implement tight verification before writing.
* **Dependency Currentness:** The system's stability relies exclusively on the newest stable releases of all utilized frameworks and packages for optimal performance and threat resistance.
