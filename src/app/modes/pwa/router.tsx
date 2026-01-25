import { Route } from "react-router-dom";
import { RequireAuth, RequireOnboarded } from "@/app/guards/guard";
import PWALayout from "./layout/PWALayout";
import { PWADashboardPage } from "./pages/DashboardPage";
import { PWAAccountsPage } from "./pages/AccountsPage";
import { PWAAccountStatsPage } from "./pages/AccountStatsPage";

export function PWARouter() {
  return (
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
  );
}
