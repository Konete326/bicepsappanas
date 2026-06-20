BicepsApp: Gym Management System ka Product Requirement Document (PRD)
Executive Overview & Business Background
Wreck & Build Ladies & Gents Fitness Gym (Nazimabad No 5, Karachi) ke manual administrative workflows ko digitalized cloud infrastructure par shift karne ke liye BicepsApp ko design kiya gaya hai. Maujuda physical paper system—jis mein manual receipt booklets, membership notebooks, cardboards, aur register-based fitness charts shamil hain—data redundancy, accounting leakages, aur manual data entry ke errors ka sabab banta hai. BicepsApp in tamam processes ko digitalize karke admin ko aik unified, centralized aur robust dashboard control faraham karta hai.   

Gym ke manual system ko digital application par lane ke liye teen bunyadi modules ko automate kiya gaya hai: Trainer Salary aur advance pay tracking, User Fees dynamic ledger system (including dynamic receipt generation), aur Special User Routine (including body measurements tracking aur nutrition planning). Yeh complete system MERN (MongoDB, Express.js, React.js, Node.js) stack par binary JSON (BSON) dynamic schema validation ke sath chalega taake database structures high security aur operational flexibility faraham kar sakein.   

Functional Transition Matrix
Manual assets aur unke digital database implementations ka direct comparison is matrix mein diya gaya hai:

Physical Gym Document	Target Database Collection	Primary Tracked Fields	Operational Outcome
Membership Card (Roll No, F/Name, Address, Cell No, Join Date) 

Members Collection 

Roll No, Full Name, Father's Name, Phone, Address, Joining Date, Expiry, Status 

Zero redundancy, fast indexing, aur status tracking 

Manual Receipt Booklet (S.No, Date, Received from, Cash/Cheque, Amount) 

Payments Collection 

Receipt S.No, Payment Date, Amount, Payment Method (Cash/Cheque), Member Link 

Transparent financial accounting aur digital receipt backup generation 

Fitness Chart/Measurements (Age, Height, Weight, Bicep, Chest, Waist, Legs) 

PhysicalMeasurements Collection 

Monthly logs, BMI Category, Bicep, Shoulder, Chest, Waist, Calf, Leg measurements 

Historical progress charts aur goal-oriented training maps 

Manual Advance Ledger (Trainer advances & cash logs) 

SalaryLedger Collection 

Base Salary, Commission Rate, Advance Balance, Transaction Type, Debit/Credit 

Accurate monthly payroll processing aur auto-deductions 

  
Technical Architecture & Database Design
BicepsApp standard Model-View-Controller (MVC) architecture ke tehat Node.js API server aur React interface ke sath kam karta hai. MongoDB database modeling ke liye Mongoose Object Data Modeling (ODM) layer implement ki gayi hai taake dynamic validation aur relational mapping ko secure banaya ja sake.   

┌────────────────────────────────────────────────────────┐
│                   React.js Frontend                    │
│          (Admin Dashboard - React 19 & MUI)            │
└───────────────────────────┬────────────────────────────┘
                            │
                   Axios API Requests
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Express.js Backend                  │
│       (JWT Middleware, Controllers, Twilio Webhooks)    │
└───────────────────────────┬────────────────────────────┘
                            │
                      Mongoose ODM
                            │
┌───────────────────────────▼────────────────────────────┐
│                  MongoDB Atlas NoSQL DB                │
│       (Normalized schemas using referenced ObjectIDs)   │
└────────────────────────────────────────────────────────┘
Mongoose schema frameworks database consistency aur data integrity ko enforce karne ke liye darj-zail parameters ke sath define kiye gaye hain :   

1. Members Collection Schema
Gym membership card ke data points (jaise Father's Name, Cell No, Address, aur Roll No) ko store karne ke liye Members schema design kiya gaya hai :   

JavaScript
const MemberSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true }, // Card Roll Number
  fullName: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  email: { type: String, unique: true, lowercase: true, trim: true },
  cellNo: { type: String, required: true, unique: true }, // WhatsApp integration format (+92)
  address: { type: String, required: true },
  joiningDate: { type: Date, default: Date.now },
  renewalDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Expired', 'Frozen'], default: 'Active' },
  planLink: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlans', required: true }
}, { timestamps: true });
2. Payments (Receipt) Collection Schema
Wreck & Build Gym ke physical invoice layout ko digital format mein convert karne ke liye Payments schema is tarah structured hai :   

JavaScript
const PaymentSchema = new mongoose.Schema({
  serialNo: { type: Number, required: true, unique: true }, // Paper Receipt S.No sequence
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Members', required: true },
  date: { type: Date, default: Date.now },
  amountReceived: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['Cash', 'Cheque', 'UPI/Online'], required: true },
  chequeOrTransactionNo: { type: String, default: null }, // If paid via Cheque or Online
  receiverStampSignature: { type: String, default: "WRECK & BUILD" }
}, { timestamps: true });
3. Physical Measurements & Special Routine Schema
Monthly measurements sheets (jaise Abdullah Saleem ka fitness record) aur personalized daily workout schemes ko store karne ka integrated schema darj-zail hai :   

JavaScript
const PhysicalMeasurementsSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Members', required: true, unique: true },
  age: { type: Number, required: true },
  heightFeetInches: { type: String, required: true }, // e.g., "5.7"
  weightHistory:,
  bicepHistory:,
  shoulderHistory:,
  chestHistory:,
  waistHistory:,
  calfHistory:,
  legHistory:,
  bmiCategory: { type: String, enum: ['Underweight', 'Normal', 'Overweight', 'Obesity'] },
  exerciseSchedule:,
  mealPlan:
}, { timestamps: true });
Functional Requirements & Controller Logic
Module 1: Trainer Salary & Advance Ledger Management
Trainer payment profiles ko track karne ke liye admin dashboard par custom inputs shamil kiye gaye hain jo dynamic advances, hourly/session rates, aur base pay tiers ko calculate karte hain.   

Payroll Accounting Formulations
Trainer ki monthly income calculations system algorithms ke mutabiq run hoti hain:

Salary 
Net
​
 =Salary 
Base
​
 +(Sessions 
Completed
​
 ×Rate 
Session
​
 )−Payment 
Advance
​
 
Advance payment disburse hone par, database engine dynamic entry trigger karta hai, aur trainer ka advance outstanding balance barh jata hai:

Balance 
Advance_New
​
 =Balance 
Advance_Old
​
 +Amount 
Disbursed
​
 
Monthly payout execution ke doran, net payment calculate hone ke baad advanceBalance database schema field auto-deduct ho kar clear state mein aa jati hai.   

Module 2: User Fees Pipeline & Digital Receipt Engine
User validation cycle fully automated tracking par chalega. Physical membership card ke back page par maujuda 12-month grid system ko web dashboard par digital 12-column status matrix ke roop mein transform kiya gaya hai, jahan admin har mahine ke pay state ko dynamically control karta hai.   

┌────────────────────────────────────────────────────────┐
│              Admin Inputs Member Roll No               │
└───────────────────────────┬────────────────────────────┘
                            │
               Verification in Members Schema
                            │
┌───────────────────────────▼────────────────────────────┐
│         Generates Sequential Serial No (S.No)          │
└───────────────────────────┬────────────────────────────┘
                            │
              Validates Payment (Cash/Cheque)
                            │
┌───────────────────────────▼────────────────────────────┐
│      Saves in Payments DB & Updates 12-Month Grid       │
└───────────────────────────┬────────────────────────────┘
                            │
           Trigger Dynamic PDF Invoice Generation
Invoices aur accounts audit ke liye database engine payments reports ko render karta hai jahan overall unpaid balances is calculation par evaluate hote hain :   

Dues 
Outstanding
​
 =Fee 
Plan_Base
​
 −Amount 
Paid
​
 
Module 3: Special User Routine & Progress Tracking
Is module ke tehat manual chart format (Age: 34, Height: 5.7, Weight track) ko real-time analytics system mein feed kiya jata hai. Monthly parameters updates par body composition metrics aur progress trajectories screen par visualization diagrams mein draw hoti hain.   

Scientific BMI Virtual Calculation
System dynamic calculation virtual functions ke through continuous metrics evaluate karta hai :   

BMI= 
(Height 
m
​
 ) 
2
 
Weight 
kg
​
 
​
 
Underweight (BMI<18.5): System backend dynamic notifications push karta hai jo admin ko alerts faraham karti hain ke diet plan ko high-protein aur high-calorie matrix par optimize karein.   

Overweight (BMI≥25.0): Routines engine automatic system alerts generate karta hai jo daily sets and cardio cycles ko maximize karne ki recommendations forward karta hai.   

API Router Architecture
Backend servers and UI dashboards ke darmiyan high-speed data transmission APIs ke controller endpoints matrix ke zariye functional hoti hai :   

HTTP Verbs	Route Path URL	Request Headers / payload	Access Rights	Technical Operation
POST	/api/admin/login	{ email, password }	Public Access	
Authenticate karke JWT security token trigger karta hai.

POST	/api/members	{ rollNo, fullName, fatherName, cellNo, address, planLink }	Admin Only	
New member profile register karna card credentials ke sath.

POST	/api/payments	{ serialNo, memberId, amountReceived, paymentMethod, chequeOrTransactionNo }	Admin Only	
Digital receipt generate karna aur payment record database mein load karna.

GET	/api/members/payment-grid/:memberId	None	Admin Only	
12-month payment/attendance grid status retrieve karna.

POST	/api/trainers	{ fullName, email, phone, baseSalary, commissionRate }	Admin Only	
New trainer register karna.

POST	/api/trainers/ledger	{ trainerId, transactionType, amount, referenceNote }	Admin Only	
Salaries, base payouts, aur advance ledger values post karna.

GET	/api/trainers/ledger/:trainerId	None	Admin Only	
Ledger balance sheet aur overall trainer net salary statements view karna.

POST	/api/measurements	{ memberId, age, heightFeetInches, weight, bicep, shoulder, chest, waist, calf, leg }	Admin Only	
Monthly measurements tracking metrics push karna history database mein.

POST	/api/routines	{ memberId, exerciseSchedule, mealPlan }	Admin Only	
Special exercise splits and nutrition recommendations upload karna.

  
Twilio WhatsApp Integration for Automated Billing
Admin workload ko reduce karne ke liye system automatically bills expiry track karke custom WhatsApp alerts coordinate karta hai. Twilio node helpers ka automatic dispatch algorithm system server jobs par functional hota hai :   

JavaScript
// Twilio API controller implementation for auto-notification [25, 27]
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const triggerWhatsAppDuesAlert = async (memberNumber, memberName, invoiceNo, pendingDues, deadline) => {
  try {
    const response = await client.messages.create({
      body: `Assalam-o-Alaikum ${memberName},\n\nBicepApp (Wreck & Build Gym) ki taraf se reminder: Aap ka invoice serial S.No: ${invoiceNo} pending hai. Outstanding dues: Rs. ${pendingDues} ki renewal date: ${deadline} hai. Kindly physical counter par verification karke receipt claim karein. Shukriya!`,
      from: 'whatsapp:+14155238886', // Verified Twilio Sender Number [25, 27]
      to: `whatsapp:${memberNumber}` // WhatsApp verified member mobile number [25, 27]
    });
    console.log(`WhatsApp Alert successfully sent. Message SID: ${response.sid}`);
  } catch (error) {
    console.error(`WhatsApp Notification failed to execute: ${error.message}`);
  }
};
Expiry Trigger Chronology
System server jobs daily basis par run hoti hain aur database checking functions call karti hain. Kinhi members ka renewalDate dynamic parameter se match hone par alert triggers activate ho jate hain.   

System Implementation & Rollout Schedule
BicepsApp rollout schedule teen key system phases par mustamil hai taake operational delivery high precision ke sath finalize ho sake :   

┌────────────────────────────────────────────────────────┐
│         Phase 1: Environment & Database Setup          │
│       - MongoDB Atlas setup & cluster deployment [2] │
│       - Security policies & dynamic model validations  │
│       - Index settings implementation for high speed   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Phase 2: Controller Programming            │
│       - Logic processing for trainer advances ledger  │
│       - Serial receipt sequence numbers configuration  │
│       - BMI computation scripts & dynamic routine maps │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│       Phase 3: Theme Integration & Twilio Live         │
│       - Mapping REST controllers with React MUI theme  │
│       - Live sandbox testing for WhatsApp alerts       │
│       - Production deployment & local system handover  │
└────────────────────────────────────────────────────────┘
Conclusions & Actionable Recommendations
Wreck & Build Gym ke pure paper architecture ko dynamic cloud environment par digitize karne ke liye BicepsApp aik ideal software engine hai.   

System Continuity Strategy: Manual receipt book sequences se complete coordination banaye rakhne ke liye, digital serialNo configuration variable ko purani booklet ke akhri physical receipt number (jaise "098") ke age se initialize kiya jaye.   

Data Integrity Standard: Members ke body dimensions (Age, Height, Weight, Bicep, Chest, Waist, Legs) ko har mahine ki teesri tareeq (3rd) ko monitor aur log kiya jaye taake historical trends exact evaluate hon aur dynamic systems analysis parameters reliable output generate karein.   

Advanced Security Audit: JWT tokens aur system configurations ko single admin structure par maintain kiya jaye taake pricing models aur discount settings completely secured state mein scale kiye ja sakein.   

