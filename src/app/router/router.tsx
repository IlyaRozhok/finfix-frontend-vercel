import { Routes, Route, Navigate } from "react-router-dom";

import {
  RequireAuth,
  RequireGuest,
  RequireOnboarded,
} from "@/app/guards/guard";
import { useAuth } from "@/app/providers/AuthProvider";

import OnboardingLayout from "../layouts/OnboardingLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import { OnboardingWrapper } from "../layouts/OnboardingWrapper";
import { LoginPage } from "@/pages/login/LoginPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { DebtsPage } from "@/pages/dashboard/DebtsPage";
import { ExpensesPage } from "@/pages/dashboard/ExpensesPage";
import { InstallmentsPage } from "@/pages/dashboard/InstallmentsPage";
import { IncomesPage } from "@/pages/dashboard/IncomesPage";
import { TransactionsPage } from "@/pages/dashboard/TransactionsPage";
import {
  OnboardingCurrency,
  OnboardingIncomes,
  OnboardingExpenses,
  OnboardingDebts,
  OnboardingInstallments,
} from "@/pages/onboarding";
import Monobank from "@pages/dashboard/monobank";

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid h-screen place-items-center">
        <div className="animate-pulse text-sm text-neutral-500">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate to={user.isOnboarded ? "/dashboard" : "/onboarding"} replace />
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RequireGuest>
            <LoginPage />
          </RequireGuest>
        }
      />

      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <RequireOnboarded invert>
              <OnboardingLayout />
            </RequireOnboarded>
          </RequireAuth>
        }
      >
        <Route index element={<OnboardingWrapper />} />
        <Route path="currency" element={<OnboardingCurrency />} />
        <Route path="incomes" element={<OnboardingIncomes />} />
        <Route path="expenses" element={<OnboardingExpenses />} />
        <Route path="debts" element={<OnboardingDebts />} />
        <Route path="installments" element={<OnboardingInstallments />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <DashboardLayout />
            </RequireOnboarded>
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="incomes" element={<IncomesPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="debts" element={<DebtsPage />} />
        <Route path="installments" element={<InstallmentsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="monobank" element={<Monobank/>}
        />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      {/* Don't redirect API paths */}
      <Route path="/api/*" element={null} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
