# Technical Requirements Document (TRD) — BicepsApp

## 1. Project Overview
BicepsApp is a cloud-based Gym Management System designed for **Wreck & Build Ladies & Gents Fitness Gym** (Nazimabad No 5, Karachi). It digitizes the gym's manual paper-based workflows — membership cards, receipt booklets, fitness charts, and trainer advance ledgers — into a unified, centralized dashboard. The project is built on the **MERN (MongoDB, Express.js, React.js, Node.js)** stack with Mongoose ODM for dynamic schema validation and Twilio WhatsApp integration for automated billing alerts.

## 2. Technology Stack

> **STRICT RULE:** All libraries, frameworks, and packages used in this project MUST be their **latest available stable versions** at the time of installation — no exceptions. This applies to React, Node.js, Express, Mongoose, Tailwind CSS, shadcn/ui, and every other dependency. Always run `npm install <package>@latest` to ensure the newest release.

### 2.1 Frontend (Client)
* **Build Tool:** Vite (latest)
* **Library:** React 19 (latest) + React DOM
* **Styling:** Tailwind CSS v4 (latest)
* **UI Components:** shadcn/ui (Radix-based accessible components — latest versions)
* **State/Data Fetching:** TanStack React Query v5 (latest) for server-state management
* **HTTP Client:** Axios (latest)
* **Routing:** React Router DOM v7 (latest)
* **Forms:** React Hook Form (latest) + Zod validation (latest)
* **Animations:** Framer Motion (latest)
* **Charts:** Recharts (latest)
* **Icons:** Lucide React (latest)
* **Utilities:** date-fns, clsx, tailwind-merge, class-variance-authority (all latest)
* **Description:** The frontend is a component-driven admin dashboard providing member management, payment receipt generation, trainer payroll, body measurement tracking, and routine planning views.

### 2.2 Backend (Server)
* **Runtime Environment:** Node.js (latest LTS)
* **Web Framework:** Express.js v5 (latest)
* **Authentication:** JWT via `jsonwebtoken` (latest) + `bcryptjs` for password hashing (latest)
* **Database ODM:** Mongoose (latest) for schema validation and relational mapping
* **File Uploads:** Multer (latest)
* **Dev Tool:** Nodemon (latest) for development auto-reload
* **Description:** The backend exposes RESTful API endpoints for all gym operations — member registration, payment processing, trainer ledger management, measurement logging, and WhatsApp notification dispatch.

### 2.3 Database
* **Database System:** MongoDB (latest) — NoSQL
* **ODM:** Mongoose (latest) — normalized schemas with referenced ObjectIDs
* **Deployment:** MongoDB Atlas (Cloud Database)
* **Description:** The database uses normalized schemas with referenced ObjectIDs. Key collections include:
  - **Members** — Gym membership profiles (rollNo, fullName, fatherName, cellNo, address, joiningDate, renewalDate, status, planLink)
  - **Payments** — Digital receipt records (serialNo, memberId, amountReceived, paymentMethod, chequeOrTransactionNo)
  - **PhysicalMeasurements** — Monthly body metrics and workout/meal plans (age, height, weightHistory, bicepHistory, BMI, exerciseSchedule, mealPlan)
  - **SalaryLedger** — Trainer payroll and advance tracking (baseSalary, commissionRate, advanceBalance, transactionType, debit/credit)
  - **MembershipPlans** — Available gym subscription plans

## 3. Third-Party Integrations

### 3.1 Twilio WhatsApp API
* **Purpose:** Automated billing reminders, membership expiry alerts, and dues notifications
* **Workflow:**
  1. Server-side cron/scheduled jobs check for upcoming renewal dates daily
  2. Matching members trigger WhatsApp alert dispatch via Twilio SDK
  3. Messages include invoice serial number, outstanding dues, and renewal deadline
* **Credentials:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` stored in `.env`

### 3.2 Cloudinary (Media & Asset Management)
* **Purpose:** Image hosting for member photos, documents, or other media
* **Workflow:**
  1. Users upload images from the client
  2. Server processes and uploads to Cloudinary
  3. Secure URL returned and stored in MongoDB document
* **SDK:** `cloudinary` npm package (latest version)

### 3.3 Pending Integrations (To Be Installed)
* **Twilio SDK:** `twilio` npm package (latest) — for WhatsApp billing alerts and membership expiry notifications

## 4. Authentication & Security
* **JWT-based Authentication:** Admin login (`POST /api/admin/login`) returns a signed JWT token
* **Middleware Protection:** All admin-only routes are guarded by JWT verification middleware
* **Single Admin Structure:** Pricing models, discount settings, and system configurations are secured under single-admin access
* **Environment Variables:** All sensitive keys (MongoDB URI, Cloudinary APIs, Twilio credentials, JWT secret) must remain in `.env` files and never be exposed publicly

## 5. API Architecture
* **Pattern:** RESTful MVC (Model-View-Controller)
* **Router Structure:** Separate route files per domain (`authRoutes`, `productRoutes`, `orderRoutes`, `categoryRoutes`, `employeeRouter`, `notificationRoutes`, `reportRoutes`, `returnRoutes`, `dashboardRoutes`)
* **Controller Layer:** Business logic separated into dedicated controller files
* **Error Handling:** Centralized error middleware with custom `AppError` utility and `catchAsync` wrapper

## 6. Development & Installation Guidelines
* **Latest-Only Policy:** Every `npm install` must use the `@latest` tag. No pinned old versions allowed. If a package has a major version update, migrate to it.
* **Dependencies:** All installations must use latest stable releases of:
  - Frontend: Vite, React 19, Tailwind CSS v4, shadcn/ui, TanStack Query, Axios, React Router DOM, Framer Motion, Recharts, Lucide React, Zod, React Hook Form
  - Backend: Express v5, Mongoose, jsonwebtoken, bcryptjs, Cloudinary, Twilio, Multer, Nodemon, dotenv, cors, date-fns
* **Environment Variables:** Required in `.env`:
  - `MONGODB_URI` — MongoDB Atlas connection string
  - `JWT_SECRET` — Token signing secret
  - `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` — Media hosting credentials
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` — WhatsApp notification credentials
* **Serial Number Continuity:** Digital receipt `serialNo` must be initialized from the last physical receipt number in the old booklet (e.g., "098") to maintain sequence continuity

---
*Last Updated: June 2026*
# Technical Requirements Document (TRD)

## 1. Project Overview
This document outlines the technical architecture, technology stack, and third-party integrations for the application. The project is built using the **MERN (MongoDB, Express.js, React, Node.js)** stack to ensure scalability, robust performance, and seamless communication between the client and server.

## 2. Technology Stack

All libraries, frameworks, and packages used in this project will be their **latest available versions** to take advantage of new features, optimizations, and security patches.

### 2.1 Frontend (Client)
* **Framework / Build Tool:** Vite
* **Library:** React.js
* **Styling:** Tailwind CSS (latest v4)
* **Description:** The front-end leverages Vite for an ultra-fast development server and optimized production build. It utilizes the React library to construct a component-driven, highly interactive user interface.

### 2.2 Backend (Server)
* **Runtime Environment:** Node.js
* **Web Framework:** Express.js
* **Description:** The backend API handles client requests, business logic, and communication with the database and third-party services.

### 2.3 Database
* **Database System:** MongoDB
* **Deployment:** MongoDB Atlas (Cloud Database)
* **Description:** The database stores all application data, user details, logic structures, and references to media assets. MongoDB Atlas ensures high availability and secure cloud hosting.

## 3. Media & Asset Management
* **Image Hosting:** Cloudinary
* **Workflow:** 
  1. Users upload images from the client.
  2. The server processes the upload and stores the images in **Cloudinary**.
  3. Cloudinary returns a secure URL (path) for the hosted image.
  4. The secure URL path is then saved into the corresponding document within **MongoDB Atlas** for retrieval.

## 4. Development & Installation Guidelines
* **Dependencies:** Developers must ensure that all configurations and installations pull the latest stable releases of Vite, React, Express, Node modules, Mongoose, and Cloudinary SDKs.
* **Environment Variables:** All sensitive connection strings (MongoDB Atlas URI, Cloudinary APIs: Name, Key, Secret) must be kept strictly local in `.env` files and must never be exposed publicly.

---
*Note: Once development proceeds, additional architectures (like State Management configurations, specific middleware strategies, etc.) will be appended to this TRD based on evolving PRD scopes.*
