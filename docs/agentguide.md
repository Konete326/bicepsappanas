# Agent Guide — BicepsApp

This document defines the strict workflow, behavior, and rules that any AI Agent working on **BicepsApp** MUST follow. BicepsApp is a Gym Management System for **Wreck & Build Ladies & Gents Fitness Gym** (Nazimabad No 5, Karachi), built on the MERN stack.

## 1. Document Reading & Context Preservation
* **Mandatory Reading:** Before starting any new task, the Agent MUST read all available project documentation, including `prd.md`, `trd.md`, `srd.md`, `rules.md`, and the contents of the `skills/` directory.
* **Context Preservation:** The Agent must keep the overall project architecture, goals, and context in memory. All new implementations must align with the established guidelines.
* **Project Domain Awareness:** This is a **gym management** application — not a POS, e-commerce, or inventory system. All features revolve around:
  - Gym membership management (members, plans, renewals)
  - Payment/receipt processing (digital receipts, 12-month grid)
  - Trainer payroll & advance ledger tracking
  - Body measurements & fitness progress tracking
  - Twilio WhatsApp billing notifications

## 2. Task Execution
* **Strict Adherence:** The Agent must do exactly what is requested by the user. Do not deviate into unnecessary features unless explicitly asked.
* **Proactive Suggestions:** At the end of every completed task, the Agent MUST provide suggestions for the next best steps, potential improvements, or architectural enhancements.
* **PRD Alignment:** Every feature implementation must trace back to a requirement defined in the PRD. No orphan features.

## 3. Technical Constraints
* **Stack:** MERN (MongoDB, Express.js, React 19, Node.js) with Vite, Tailwind CSS v4, shadcn/ui, Mongoose ODM
* **Authentication:** JWT-based single-admin architecture
* **API Pattern:** RESTful MVC with separated routes, controllers, and models
* **File Size Limit:** Controllers and route files should stay within the 120-line readability limit
* **Schema Design:** Use Mongoose with normalized schemas and referenced ObjectIDs for relational integrity
* **Integrations:** Twilio for WhatsApp alerts, Cloudinary for media hosting

## 4. Progress Tracking
* **Agent Progress Update:** Upon successful completion of any task, the Agent MUST immediately update the `agent progress.md` file.
* **Formatting:** The update should be a concise, one-line summary added to a Markdown checklist, marked as done (e.g., `- [x] Created Members collection schema with Mongoose`).

## 5. Key Business Rules
* **Receipt Serial Continuity:** Digital `serialNo` must continue from the last physical receipt number in the old booklet (e.g., initialize from "098" onwards)
* **Monthly Measurement Logging:** Body dimensions should be logged on the **3rd of every month**
* **BMI Calculation:** System must dynamically compute BMI and categorize (Underweight < 18.5, Normal, Overweight ≥ 25.0, Obesity)
* **Salary Formula:** `Net Salary = Base Salary + (Sessions Completed × Rate Per Session) − Advance Balance`
* **Outstanding Dues:** `Outstanding Dues = Plan Base Fee − Amount Paid`
* **Expiry Alerts:** Daily server jobs check `renewalDate` and trigger Twilio WhatsApp alerts for expiring memberships

---
*Last Updated: June 2026*
# Agent Guide

This document defines the strict workflow, behavior, and rules that any AI Agent working on this project MUST follow.

## 1. Document Reading & Context Preservation
* **Mandatory Reading:** Before starting any new task, the Agent MUST read all available project documentation, including `prd.md`, `trd.md`, `srd.md`, `rules.md`, and the contents of the `skills/` directory.
* **Context Preservation:** The Agent must keep the overall project architecture, goals, and context in memory. All new implementations must align with the established guidelines.
* **Zero Mistakes:** The Agent must double-check its work and ensure no critical logical errors, compilation mistakes, or bugs are introduced.

## 2. Task Execution
* **Strict Adherence:** The Agent must do exactly what is requested by the user. Do not deviate into unnecessary features unless explicitly asked.
* **Proactive Suggestions:** At the end of every completed task, the Agent MUST provide suggestions for the next best steps, potential improvements, or architectural enhancements.

## 3. Progress Tracking
* **Agent Progress Update:** Upon successful completion of any task, the Agent MUST immediately update the `agent progress.md` file.
* **Formatting:** The update should be a concise, one-line summary added to a Markdown checklist, marked as done (e.g., `- [x] Created database connection file`).
