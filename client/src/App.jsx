import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/layout";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import Dashboard from "@/pages/dashboard";
import Notifications from "@/pages/notifications";
import SignIn from "@/pages/auth/sign-in";
import NotFound from "@/pages/not-found";
import About from "@/pages/about";

import MemberList from "@/pages/members/member-list";
import MemberForm from "@/pages/members/member-form";
import MemberDetail from "@/pages/members/member-detail";
import PaymentList from "@/pages/payments/payment-list";
import PaymentForm from "@/pages/payments/payment-form";
import ReceiptView from "@/pages/payments/receipt-view";
import DuesReport from "@/pages/payments/dues-report";
import TrainerList from "@/pages/trainers/trainer-list";
import TrainerForm from "@/pages/trainers/trainer-form";
import LedgerView from "@/pages/trainers/ledger-view";
import LedgerEntryForm from "@/pages/trainers/ledger-entry-form";
import MeasurementForm from "@/pages/measurements/measurement-form";
import MeasurementHistory from "@/pages/measurements/measurement-history";
import MeasurementView from "@/pages/measurements/measurement-view";
import RoutineForm from "@/pages/routines/routine-form";
import RoutineView from "@/pages/routines/routine-view";
import Reports from "@/pages/reports";
import Changelog from "@/pages/changelog";
import License from "@/pages/license";
import ProductList from "@/pages/inventory/product-list";
import ProductForm from "@/pages/inventory/product-form";
import POSPage from "@/pages/pos/pos-page";
import SalesHistory from "@/pages/pos/sales-history";
import { Agentation } from "agentation";


function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  return children;
}

function Router() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Layout title="Gym Dashboard"><Dashboard /></Layout></ProtectedRoute>} />
      
      <Route path="/members" element={<ProtectedRoute><Layout title="Members Directory"><MemberList /></Layout></ProtectedRoute>} />
      <Route path="/members/new" element={<ProtectedRoute><Layout title="Register Member"><MemberForm /></Layout></ProtectedRoute>} />
      <Route path="/members/edit/:id" element={<ProtectedRoute><Layout title="Edit Member"><MemberForm /></Layout></ProtectedRoute>} />
      <Route path="/members/:id" element={<ProtectedRoute><Layout title="Member Profile"><MemberDetail /></Layout></ProtectedRoute>} />

      <Route path="/payments" element={<ProtectedRoute><Layout title="Payment Receipts Log"><PaymentList /></Layout></ProtectedRoute>} />
      <Route path="/payments/new" element={<ProtectedRoute><Layout title="Record Payment"><PaymentForm /></Layout></ProtectedRoute>} />
      <Route path="/payments/receipt/:id" element={<ProtectedRoute><Layout title="Payment Receipt"><ReceiptView /></Layout></ProtectedRoute>} />
      <Route path="/payments/dues" element={<ProtectedRoute><Layout title="Dues Report"><DuesReport /></Layout></ProtectedRoute>} />

      <Route path="/trainers" element={<ProtectedRoute><Layout title="Trainer Management"><TrainerList /></Layout></ProtectedRoute>} />
      <Route path="/trainers/new" element={<ProtectedRoute><Layout title="Register Trainer"><TrainerForm /></Layout></ProtectedRoute>} />
      <Route path="/trainers/edit/:id" element={<ProtectedRoute><Layout title="Edit Trainer"><TrainerForm /></Layout></ProtectedRoute>} />
      <Route path="/trainers/:id/ledger" element={<ProtectedRoute><Layout title="Trainer Ledger & Payout"><LedgerView /></Layout></ProtectedRoute>} />
      <Route path="/trainers/:id/ledger/new" element={<ProtectedRoute><Layout title="Log Ledger Entry"><LedgerEntryForm /></Layout></ProtectedRoute>} />

      <Route path="/measurements" element={<ProtectedRoute><Layout title="Physical Tracking"><MeasurementHistory /></Layout></ProtectedRoute>} />
      <Route path="/measurements/new" element={<ProtectedRoute><Layout title="Log Body Measurements"><MeasurementForm /></Layout></ProtectedRoute>} />
      <Route path="/measurements/:id" element={<ProtectedRoute><Layout title="View Measurements"><MeasurementView /></Layout></ProtectedRoute>} />

      <Route path="/routines" element={<ProtectedRoute><Layout title="Workout & Nutrition"><RoutineView /></Layout></ProtectedRoute>} />
      <Route path="/routines/edit/:id" element={<ProtectedRoute><Layout title="Edit Routine"><RoutineForm /></Layout></ProtectedRoute>} />

      <Route path="/notifications" element={<ProtectedRoute><Layout title="System Alerts"><Notifications /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout title="Gym Financial Reports"><Reports /></Layout></ProtectedRoute>} />
      <Route path="/changelog" element={<ProtectedRoute><Layout title="Changelog"><Changelog /></Layout></ProtectedRoute>} />
      <Route path="/license" element={<Layout title="License & Legal"><License /></Layout>} />
      <Route path="/about" element={<Layout title="About Wreck & Build Gym"><About /></Layout>} />
      <Route path="/inventory" element={<ProtectedRoute><Layout title="Inventory"><ProductList /></Layout></ProtectedRoute>} />
      <Route path="/inventory/new" element={<ProtectedRoute><Layout title="Add Product"><ProductForm /></Layout></ProtectedRoute>} />
      <Route path="/inventory/edit/:id" element={<ProtectedRoute><Layout title="Edit Product"><ProductForm /></Layout></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute><Layout title="Point of Sale"><POSPage /></Layout></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><Layout title="Sales History"><SalesHistory /></Layout></ProtectedRoute>} />
      <Route path="/auth/sign-in" element={user ? <Navigate to="/" replace /> : <SignIn />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  const RouterComponent = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

  return (
    <AuthProvider>
      <RouterComponent>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
            {import.meta.env.DEV && (
              <Agentation
                endpoint="http://localhost:4747"
                onSessionCreated={(sessionId) => {
                  console.log("Session started:", sessionId);
                }}
              />
            )}
          </TooltipProvider>
        </QueryClientProvider>
      </RouterComponent>
    </AuthProvider>
  );
}

