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
import AdminList from "@/pages/management/admin-list";
import { Agentation } from "agentation";


function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  if (user.role && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

function PermissionRoute({ children, permission }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth/sign-in" replace />;
  if (user.role === "admin") return children;
  if (user.permissions?.includes(permission)) return children;
  return <Navigate to="/" replace />;
}

function Router() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Layout title="Gym Dashboard"><Dashboard /></Layout></ProtectedRoute>} />
      
      <Route path="/members" element={<PermissionRoute permission="members"><Layout title="Members Directory"><MemberList /></Layout></PermissionRoute>} />
      <Route path="/members/new" element={<PermissionRoute permission="members"><Layout title="Register Member"><MemberForm /></Layout></PermissionRoute>} />
      <Route path="/members/edit/:id" element={<PermissionRoute permission="members"><Layout title="Edit Member"><MemberForm /></Layout></PermissionRoute>} />
      <Route path="/members/:id" element={<PermissionRoute permission="members"><Layout title="Member Profile"><MemberDetail /></Layout></PermissionRoute>} />

      <Route path="/payments" element={<PermissionRoute permission="payments"><Layout title="Payment Receipts Log"><PaymentList /></Layout></PermissionRoute>} />
      <Route path="/payments/new" element={<PermissionRoute permission="payments"><Layout title="Record Payment"><PaymentForm /></Layout></PermissionRoute>} />
      <Route path="/payments/receipt/:id" element={<PermissionRoute permission="payments"><Layout title="Payment Receipt"><ReceiptView /></Layout></PermissionRoute>} />
      <Route path="/payments/dues" element={<PermissionRoute permission="payments"><Layout title="Dues Report"><DuesReport /></Layout></PermissionRoute>} />

      <Route path="/trainers" element={<AdminRoute><Layout title="Trainer Management"><TrainerList /></Layout></AdminRoute>} />
      <Route path="/trainers/new" element={<AdminRoute><Layout title="Register Trainer"><TrainerForm /></Layout></AdminRoute>} />
      <Route path="/trainers/edit/:id" element={<AdminRoute><Layout title="Edit Trainer"><TrainerForm /></Layout></AdminRoute>} />
      <Route path="/trainers/:id/ledger" element={<AdminRoute><Layout title="Trainer Ledger & Payout"><LedgerView /></Layout></AdminRoute>} />
      <Route path="/trainers/:id/ledger/new" element={<AdminRoute><Layout title="Log Ledger Entry"><LedgerEntryForm /></Layout></AdminRoute>} />

      <Route path="/measurements" element={<PermissionRoute permission="measurements"><Layout title="Physical Tracking"><MeasurementHistory /></Layout></PermissionRoute>} />
      <Route path="/measurements/new" element={<PermissionRoute permission="measurements"><Layout title="Log Body Measurements"><MeasurementForm /></Layout></PermissionRoute>} />
      <Route path="/measurements/:id" element={<PermissionRoute permission="measurements"><Layout title="View Measurements"><MeasurementView /></Layout></PermissionRoute>} />

      <Route path="/routines" element={<PermissionRoute permission="routines"><Layout title="Workout & Nutrition"><RoutineView /></Layout></PermissionRoute>} />
      <Route path="/routines/edit/:id" element={<PermissionRoute permission="routines"><Layout title="Edit Routine"><RoutineForm /></Layout></PermissionRoute>} />

      <Route path="/notifications" element={<ProtectedRoute><Layout title="System Alerts"><Notifications /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<PermissionRoute permission="reports"><Layout title="Gym Financial Reports"><Reports /></Layout></PermissionRoute>} />
      <Route path="/changelog" element={<ProtectedRoute><Layout title="Changelog"><Changelog /></Layout></ProtectedRoute>} />
      <Route path="/license" element={<Layout title="License & Legal"><License /></Layout>} />
      <Route path="/about" element={<Layout title="About Wreck & Build Gym"><About /></Layout>} />
      <Route path="/inventory" element={<PermissionRoute permission="inventory"><Layout title="Inventory"><ProductList /></Layout></PermissionRoute>} />
      <Route path="/inventory/new" element={<PermissionRoute permission="inventory"><Layout title="Add Product"><ProductForm /></Layout></PermissionRoute>} />
      <Route path="/inventory/edit/:id" element={<PermissionRoute permission="inventory"><Layout title="Edit Product"><ProductForm /></Layout></PermissionRoute>} />
      <Route path="/pos" element={<PermissionRoute permission="pos"><Layout title="Supplement Shop"><POSPage /></Layout></PermissionRoute>} />
      <Route path="/sales" element={<PermissionRoute permission="pos"><Layout title="Shop Sales"><SalesHistory /></Layout></PermissionRoute>} />
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

