import { Route } from "react-router-dom";
import { RequireAuth, RequireOnboarded } from "@/app/guards/guard";
import DashboardLayout from "@/app/layouts/DashboardLayout";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { DebtsPage } from "@/pages/dashboard/DebtsPage";
import { ExpensesPage } from "@/pages/dashboard/ExpensesPage";
import { InstallmentsPage } from "@/pages/dashboard/InstallmentsPage";
import { IncomesPage } from "@/pages/dashboard/IncomesPage";
import { TransactionsPage } from "@/pages/dashboard/TransactionsPage";
import { AccountsPage } from "@/pages/dashboard/AccountsPage";
import Monobank from "@/pages/dashboard/Monobank";

export function AdminRouter() {
  return (
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
  );
}
