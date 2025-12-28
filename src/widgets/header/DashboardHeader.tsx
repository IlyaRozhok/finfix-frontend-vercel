import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import LogoutButton from "@/features/auth/logout/LogoutButton";
import { CloseButton } from "@/shared/ui";
import { UserIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

const getPageTitle = (pathname: string): string => {
  const pathMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/transactions": "Transactions",
    "/dashboard/incomes": "Incomes",
    "/dashboard/debts": "Debts",
    "/dashboard/installments": "Installments",
    "/dashboard/expenses": "Expenses",
    "/dashboard/monobank": "Monobank",
  };

  return pathMap[pathname] || "Dashboard";
};

export const DashboardHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  return (
    user && (
      <header className="h-16 px-6 flex items-center justify-between backdrop-blur-xl shadow-lg">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-primary-background tracking-tight">
            {pageTitle}
          </h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-3 p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 group"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-contain"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-primary-background" />
              </div>
            )}
            <ChevronDownIcon
              className={clsx(
                "h-4 w-4 text-primary-background/70 transition-transform duration-200",
                isMenuOpen ? "rotate-180" : ""
              )}
            />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary-background" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-primary-background">
                      {user?.userName}
                    </p>
                    <p className="text-xs text-primary-background/70">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <CloseButton handleClose={() => setIsMenuOpen(false)} />
              </div>
              <div className="pt-4 border-t border-white/20">
                <LogoutButton />
              </div>
            </div>
          )}
        </div>
      </header>
    )
  );
};
