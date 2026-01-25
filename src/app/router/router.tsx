import { Routes, Route, Navigate } from "react-router-dom";

import {
  RequireAuth,
  RequireGuest,
  RequireOnboarded,
} from "@/app/guards/guard";
import { useAuth } from "@/app/providers/AuthProvider";
import { useMode } from "@/app/providers/ModeProvider";
import { AppMode } from "@/app/modes/types";

import OnboardingLayout from "../layouts/OnboardingLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import { OnboardingWrapper } from "../layouts/OnboardingWrapper";
import { LoginPage } from "@/pages/login/LoginPage";
import {
  OnboardingCurrency,
  OnboardingIncomes,
  OnboardingExpenses,
  OnboardingDebts,
  OnboardingInstallments,
  OnboardingComplete,
} from "@/pages/onboarding";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { DebtsPage } from "@/pages/dashboard/DebtsPage";
import { ExpensesPage } from "@/pages/dashboard/ExpensesPage";
import { InstallmentsPage } from "@/pages/dashboard/InstallmentsPage";
import { IncomesPage } from "@/pages/dashboard/IncomesPage";
import { TransactionsPage } from "@/pages/dashboard/TransactionsPage";
import { AccountsPage } from "@/pages/dashboard/AccountsPage";
import Monobank from "@/pages/dashboard/Monobank";
import PWALayout from "@/app/modes/pwa/layout/PWALayout";
import { PWADashboardPage } from "@/app/modes/pwa/pages/DashboardPage";
import { PWAAccountsPage } from "@/app/modes/pwa/pages/AccountsPage";
import { PWAAccountStatsPage } from "@/app/modes/pwa/pages/AccountStatsPage";

function RootRedirect() {
  const { user, loading } = useAuth();
  const { mode } = useMode();

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

  if (!user.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  const defaultPath = mode === AppMode.PWA ? "/analytics" : "/profile";
  return <Navigate to={defaultPath} replace />;
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
        <Route path="complete" element={<OnboardingComplete />} />
      </Route>

      <Route
        path="/profile"
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
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="monobank" element={<Monobank />} />
      </Route>

      <Route
        path="/analytics"
        element={
          <RequireAuth>
            <RequireOnboarded>
              <PWALayout />
            </RequireOnboarded>
          </RequireAuth>
        }
      >
        <Route index element={<PWADashboardPage />} />
        <Route path="accounts/:accountId" element={<PWAAccountStatsPage />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      {/* Don't redirect API paths */}
      <Route path="/api/*" element={null} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
