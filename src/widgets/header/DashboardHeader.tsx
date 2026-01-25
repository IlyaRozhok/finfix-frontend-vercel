import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { Header } from "@/shared/ui";

const getPageTitle = (pathname: string): string => {
  const pathMap: Record<string, string> = {
    "/profile": "Dashboard",
    "/profile/transactions": "Transactions",
    "/profile/incomes": "Incomes",
    "/profile/debts": "Debts",
    "/profile/installments": "Installments",
    "/profile/expenses": "Expenses",
    "/profile/accounts": "Accounts",
    "/profile/monobank": "Monobank",
  };

  return pathMap[pathname] || "Dashboard";
};

export const DashboardHeader: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  if (!user) {
    return null;
  }

  return <Header title={pageTitle} theme="admin" />;
};
