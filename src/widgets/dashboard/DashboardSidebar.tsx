import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import {
  ChartBarIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ReceiptRefundIcon,
  BanknotesIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import logo from "../../assets/money-tree.png";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Transactions", href: "/dashboard/transactions", icon: ChartBarIcon },
  { name: "Incomes", href: "/dashboard/incomes", icon: BanknotesIcon },
  { name: "Debts", href: "/dashboard/debts", icon: CreditCardIcon },
  {
    name: "Installments",
    href: "/dashboard/installments",
    icon: ReceiptRefundIcon,
  },
  { name: "Expenses", href: "/dashboard/expenses", icon: CurrencyDollarIcon },
  { name: "Monobank", href: "/dashboard/monobank", icon: CogIcon },
];

export function DashboardSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={clsx(
        "flex h-full flex-col transition-all duration-300 bg-white/10 backdrop-blur-xl shadow-2xl",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={clsx(
          "flex items-center transition-all duration-300",
          isCollapsed ? "h-16 justify-center px-0" : "h-16 px-6"
        )}
      >
        {!isCollapsed && (
          <h2 className="text-xl font-semibold text-primary-background flex items-center gap-1">
            <img src={logo} alt="logo" className="w-10" />
            <div>Finfix</div>
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={clsx(
            "flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200",
            isCollapsed ? "ml-0" : "ml-auto"
          )}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4 text-primary-background" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4 text-primary-background" />
          )}
        </button>
      </div>
      <nav
        className={clsx(
          "flex-1 space-y-1 py-6 transition-all duration-300",
          isCollapsed ? "px-2" : "px-4"
        )}
      >
        {navigation.map((item) => {
          const isDisabled = item.name === "Monobank";

          // Special logic for Dashboard - only active on exact /dashboard match
          const isDashboardActive =
            item.href === "/dashboard" && location.pathname === "/dashboard";
          const shouldUseNavLinkActive = item.href !== "/dashboard";

          if (isDisabled) {
            return (
              <div
                key={item.name}
                className={clsx(
                  "group flex items-center text-sm font-medium rounded-xl transition-all duration-200 opacity-50 cursor-not-allowed",
                  isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-2"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <div
                  className={clsx(
                    "flex items-center justify-center",
                    isCollapsed ? "" : "mr-3"
                  )}
                >
                  <div className="p-1.5 rounded-lg">
                    <item.icon
                      className="h-4 w-4 flex-shrink-0 text-primary-background/50"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                {!isCollapsed && (
                  <span className="text-primary-background/50">
                    {item.name}
                  </span>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => {
                const isItemActive = shouldUseNavLinkActive
                  ? isActive
                  : isDashboardActive;
                return clsx(
                  "group flex items-center text-sm font-medium rounded-xl transition-all duration-200",
                  isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-2",
                  isItemActive
                    ? "text-primary-background bg-white/20 border-r-2 border-white/30"
                    : "text-primary-background/70 hover:text-primary-background hover:bg-white/10"
                );
              }}
              title={isCollapsed ? item.name : undefined}
            >
              {({ isActive }) => {
                const isItemActive = shouldUseNavLinkActive
                  ? isActive
                  : isDashboardActive;
                return (
                  <>
                    <div
                      className={clsx(
                        "flex items-center justify-center",
                        isCollapsed ? "" : "mr-3"
                      )}
                    >
                      <div
                        className={clsx(
                          "p-1.5 rounded-lg transition-all duration-200",
                          isItemActive
                            ? "bg-white/20"
                            : "group-hover:bg-white/10"
                        )}
                      >
                        <item.icon
                          className={clsx(
                            "h-4 w-4 flex-shrink-0",
                            isItemActive
                              ? "text-primary-background"
                              : "text-primary-background/70 group-hover:text-primary-background"
                          )}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    {!isCollapsed && item.name}
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
