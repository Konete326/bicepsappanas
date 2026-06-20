# BicepsApp — Milestone Plan

> Gym Management System for **Wreck & Build Ladies & Gents Fitness Gym** (Nazimabad No 5, Karachi)
> Stack: MERN (MongoDB, Express.js v5, React 19, Node.js) + Tailwind v4 + shadcn/ui + Twilio

---

## Milestone 1: Backend Cleanup & Gym Schema Foundation
**Goal:** Remove old clothing POS models/routes and create all gym-specific Mongoose schemas.

### Tasks:
- [ ] 1.1 Delete old unused models: `product.js`, `order.js`, `category.js`, `return.js`
- [ ] 1.2 Delete old unused routes: `productRoutes.js`, `orderRoutes.js`, `categoryRoutes.js`, `returnRoutes.js`, `reportRoutes.js`
- [ ] 1.3 Delete old unused controllers: `productController.js`, `orderController.js`, `categoryController.js`, `returnController.js`, `reportController.js`
- [ ] 1.4 Update `model/user.js` — Remove clothing-specific fields (brandName, brandLogo, permissions), keep admin-only structure
- [ ] 1.5 Create `model/member.js` — MemberSchema (rollNo, fullName, fatherName, email, cellNo, address, joiningDate, renewalDate, status, planLink)
- [ ] 1.6 Create `model/payment.js` — PaymentSchema (serialNo, memberId, date, amountReceived, paymentMethod, chequeOrTransactionNo, receiverStampSignature)
- [ ] 1.7 Create `model/measurement.js` — PhysicalMeasurementsSchema (memberId, age, heightFeetInches, weightHistory, bicepHistory, shoulderHistory, chestHistory, waistHistory, calfHistory, legHistory, bmiCategory, exerciseSchedule, mealPlan)
- [ ] 1.8 Create `model/salaryLedger.js` — SalaryLedgerSchema (trainerId, transactionType, amount, referenceNote, baseSalary, commissionRate, advanceBalance)
- [ ] 1.9 Create `model/membershipPlan.js` — MembershipPlanSchema (planName, duration, price, description, isActive)
- [ ] 1.10 Update `server.js` — Remove old route imports, add new gym route placeholders

---

## Milestone 2: Auth System & Member Management (Backend)
**Goal:** JWT auth working + full CRUD for gym members.

### Tasks:
- [ ] 2.1 Update `controller/authController.js` — Login endpoint with JWT token generation
- [ ] 2.2 Update `router/authRoutes.js` — POST `/api/admin/login` route
- [ ] 2.3 Update `middleware/authMiddleware.js` — JWT verification guard for admin-only routes
- [ ] 2.4 Create `controller/memberController.js` — CRUD operations:
  - POST `/api/members` — Register new member
  - GET `/api/members` — List all members (with search/filter)
  - GET `/api/members/:id` — Get single member
  - PUT `/api/members/:id` — Update member
  - DELETE `/api/members/:id` — Delete member
  - GET `/api/members/payment-grid/:memberId` — 12-month payment grid
- [ ] 2.5 Create `router/memberRoutes.js` — Wire up all member endpoints
- [ ] 2.6 Create `controller/planController.js` — CRUD for membership plans
- [ ] 2.7 Create `router/planRoutes.js` — Wire up plan endpoints
- [ ] 2.8 Update `server.js` — Register member and plan routes

---

## Milestone 3: Payment & Receipt System (Backend)
**Goal:** Digital receipt engine with sequential serial numbers and 12-month grid.

### Tasks:
- [ ] 3.1 Create `controller/paymentController.js`:
  - POST `/api/payments` — Record payment (auto-generate serialNo, update 12-month grid)
  - GET `/api/payments` — List all payments (with date filter)
  - GET `/api/payments/:id` — Get single payment/receipt
  - GET `/api/payments/member/:memberId` — Get all payments for a member
  - GET `/api/payments/report/dues` — Outstanding dues calculation
- [ ] 3.2 Implement sequential serial number logic (continue from last physical receipt)
- [ ] 3.3 Implement 12-month payment grid update logic
- [ ] 3.4 Implement outstanding dues calculation: `Plan Base Fee − Amount Paid`
- [ ] 3.5 Create `router/paymentRoutes.js` — Wire up all payment endpoints
- [ ] 3.6 Update `server.js` — Register payment routes

---

## Milestone 4: Trainer Payroll & Salary Ledger (Backend)
**Goal:** Complete trainer management with advance ledger and net salary computation.

### Tasks:
- [ ] 4.1 Create `model/trainer.js` — TrainerSchema (fullName, email, phone, baseSalary, commissionRate, isActive)
- [ ] 4.2 Create `controller/trainerController.js`:
  - POST `/api/trainers` — Register new trainer
  - GET `/api/trainers` — List all trainers
  - GET `/api/trainers/:id` — Get single trainer
  - PUT `/api/trainers/:id` — Update trainer
  - DELETE `/api/trainers/:id` — Remove trainer
- [ ] 4.3 Create `controller/ledgerController.js`:
  - POST `/api/trainers/ledger` — Log salary/advance entry (debit/credit)
  - GET `/api/trainers/ledger/:trainerId` — Get ledger balance sheet & net salary statement
  - Net Salary formula: `Base Salary + (Sessions × Rate) − Advance Balance`
- [ ] 4.4 Create `router/trainerRoutes.js` — Wire up trainer + ledger endpoints
- [ ] 4.5 Update `server.js` — Register trainer routes

---

## Milestone 5: Measurements & Routine Tracking (Backend)
**Goal:** Body measurement logging with BMI calculation + exercise/meal plan storage.

### Tasks:
- [ ] 5.1 Create `controller/measurementController.js`:
  - POST `/api/measurements` — Log monthly body measurements
  - GET `/api/measurements/:memberId` — Get measurement history
  - GET `/api/measurements/:memberId/latest` — Get latest metrics
  - Dynamic BMI calculation: `Weight(kg) / Height(m)²`
  - BMI categorization: Underweight (<18.5), Normal, Overweight (≥25.0), Obesity
- [ ] 5.2 Create `controller/routineController.js`:
  - POST `/api/routines` — Save exercise schedule + meal plan for member
  - GET `/api/routines/:memberId` — Get member's routine
  - PUT `/api/routines/:memberId` — Update routine
- [ ] 5.3 Create `router/measurementRoutes.js` — Wire up measurement endpoints
- [ ] 5.4 Create `router/routineRoutes.js` — Wire up routine endpoints
- [ ] 5.5 Update `server.js` — Register measurement and routine routes

---

## Milestone 6: Dashboard & Reports (Backend)
**Goal:** Aggregated dashboard stats and financial reports.

### Tasks:
- [ ] 6.1 Update `controller/dashboardController.js`:
  - GET `/api/dashboard/stats` — Total members, active members, expired members, frozen members
  - GET `/api/dashboard/revenue` — Monthly revenue, pending dues, collection rate
  - GET `/api/dashboard/expiring` — Members expiring in next 7/30 days
  - GET `/api/dashboard/trainers` — Trainer count, total payroll outstanding
- [ ] 6.2 Update `controller/notificationController.js`:
  - GET `/api/notifications` — List all system notifications/alerts
  - POST `/api/notifications` — Create manual notification
- [ ] 6.3 Update `router/dashboardRoutes.js` and `router/notificationRoutes.js`
- [ ] 6.4 Update `server.js` — Finalize all route registrations

---

## Milestone 7: Twilio WhatsApp Integration
**Goal:** Automated billing reminders and expiry alerts via WhatsApp.

### Tasks:
- [ ] 7.1 Install `twilio` npm package (@latest)
- [ ] 7.2 Create `services/whatsappService.js` — Twilio client setup and message dispatch
- [ ] 7.3 Create `services/notificationService.js` (update existing):
  - `triggerWhatsAppDuesAlert(memberNumber, memberName, invoiceNo, pendingDues, deadline)`
  - `triggerExpiryReminder(memberNumber, memberName, renewalDate)`
- [ ] 7.4 Create `services/schedulerService.js` — Daily cron job to check renewalDate fields and trigger alerts
- [ ] 7.5 Add Twilio env variables to `.env`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- [ ] 7.6 Integrate scheduler into `server.js`

---

## Milestone 8: Frontend — Auth & Layout Overhaul
**Goal:** Transform UI from clothing POS to gym management dashboard.

### Tasks:
- [x] 8.1 Update `context/AuthContext.jsx` — Align with gym admin auth flow
- [x] 8.2 Update `components/layout/layout.jsx` — New sidebar navigation:
  - Dashboard, Members, Payments, Trainers, Measurements, Routines, Notifications, Reports
- [x] 8.3 Update `components/layout/sidebar.jsx` — Gym-specific nav items with professional icons (Lucide)
- [x] 8.4 Update `pages/auth/sign-in.jsx` — BicepsApp branded login page
- [x] 8.5 Remove old clothing pages: `inventory/`, `sales/pos`, `sales/orders`, `sales/returns`, `management/stock-alerts`
- [x] 8.6 Update `App.jsx` — New route structure for gym modules
- [x] 8.7 Update `index.html` — Title to "BicepsApp"

---

## Milestone 9: Frontend — Member & Plan Management UI
**Goal:** Full member management interface.

### Tasks:
- [x] 9.1 Create `pages/members/member-list.jsx` — Members table with search, filter by status (Active/Expired/Frozen)
- [x] 9.2 Create `pages/members/member-form.jsx` — Add/Edit member form (all fields from schema)
- [x] 9.3 Create `pages/members/member-detail.jsx` — Member profile with payment history, measurements, routine
- [x] 9.4 Create `pages/members/payment-grid.jsx` — 12-month payment status matrix
- [x] 9.5 Create `pages/plans/plan-list.jsx` — Membership plans management
- [x] 9.6 Create `pages/plans/plan-form.jsx` — Add/Edit plan form
- [x] 9.7 Wire up React Query hooks for all member/plan API calls

---

## Milestone 10: Frontend — Payments & Receipts UI
**Goal:** Payment recording and digital receipt generation.

### Tasks:
- [x] 10.1 Create `pages/payments/payment-form.jsx` — Record payment (member lookup, amount, method)
- [x] 10.2 Create `pages/payments/payment-list.jsx` — All payments with date filter
- [x] 10.3 Create `pages/payments/receipt-view.jsx` — Digital receipt/PDF invoice view
- [x] 10.4 Create `pages/payments/dues-report.jsx` — Outstanding dues overview
- [x] 10.5 Wire up React Query hooks for payment API calls

---

## Milestone 11: Frontend — Trainer Payroll UI
**Goal:** Trainer management and salary ledger interface.

### Tasks:
- [x] 11.1 Create `pages/trainers/trainer-list.jsx` — All trainers overview
- [x] 11.2 Create `pages/trainers/trainer-form.jsx` — Add/Edit trainer
- [x] 11.3 Create `pages/trainers/ledger-view.jsx` — Ledger balance sheet, advance tracking, net salary display
- [x] 11.4 Create `pages/trainers/ledger-entry-form.jsx` — Log salary/advance entry
- [x] 11.5 Wire up React Query hooks for trainer/ledger API calls

---

## Milestone 12: Frontend — Measurements, Routines & Dashboard
**Goal:** Body tracking UI, routine management, and main dashboard.

### Tasks:
- [x] 12.1 Create `pages/measurements/measurement-form.jsx` — Log body measurements
- [x] 12.2 Create `pages/measurements/measurement-history.jsx` — Progress charts (Recharts) with BMI tracking
- [x] 12.3 Create `pages/routines/routine-form.jsx` — Exercise schedule + meal plan editor
- [x] 12.4 Create `pages/routines/routine-view.jsx` — Member's current routine
- [x] 12.5 Update `pages/dashboard.jsx` — Gym dashboard:
  - Stats cards (total members, active, expiring soon, revenue)
  - Revenue chart
  - Expiring members list
  - Recent payments
- [x] 12.6 Update `pages/notifications.jsx` — System alerts and notification center
- [x] 12.7 Wire up all remaining React Query hooks

---

## Milestone 13: Final Integration, Polish & Deployment
**Goal:** End-to-end testing, UI polish, and production deployment.

### Tasks:
- [x] 13.1 End-to-end testing of all modules (auth → members → payments → trainers → measurements → routines)
- [x] 13.2 Verify no native `alert()` or `confirm()` — all custom modals
- [x] 13.3 Verify no comments in code (as per rules)
- [x] 13.4 Verify all files under 120 lines (as per rules)
- [x] 13.5 Professional icon check — all Lucide icons, no generic/amateur icons
- [x] 13.6 Update `pages/about.jsx` — BicepsApp / Wreck & Build Gym info
- [x] 13.7 Production build test (`npm run build` on both client and server)
- [x] 13.8 Update `agent progress.md` with completed milestone checklist

---

## Key Rules Reminder (from rules.md):
1. **No comments** in generated code
2. **No dummy/placeholder** code — everything must be 100% functional
3. **File size limit** — server files max 120 lines
4. **Latest versions only** — always `npm install <package>@latest`
5. **No native alerts** — use custom modals/alert dialogs
6. **Professional icons** — Lucide React only
7. **Modular components** — split into reusable pieces
8. **Strict folder structure** — proper routes, models, controllers
