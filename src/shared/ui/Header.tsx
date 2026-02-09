import React from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { UserDropdownMenu } from "./UserDropdownMenu";
import { useMode } from "@/app/providers/ModeProvider";
import { AppMode } from "@/app/modes/types";

type HeaderTheme = "admin" | "pwa";

interface HeaderProps {
  title?: string;
  theme?: HeaderTheme;
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
  showModeSwitcher?: boolean;
}

export function Header({
  title,
  theme = "admin",
  children,
  rightContent,
  showModeSwitcher = true,
}: HeaderProps) {
  const navigate = useNavigate();
  const { mode, setMode } = useMode();
  const isAdminTheme = theme === "admin";

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === AppMode.PWA) {
      navigate("/analytics");
    } else {
      navigate("/profile");
    }
  };

  const headerClasses = clsx(
    "h-16 flex items-center justify-between relative z-50 border-b",
    isAdminTheme
      ? "px-6 bg-white/10 backdrop-blur-xl border-white/30"
      : "px-6 bg-white/80 backdrop-blur-md border-white/20"
  );

  const titleClasses = clsx(
    "text-3xl font-light tracking-wide",
    isAdminTheme ? "text-primary-background" : "text-gray-900"
  );

  return (
    <header className={headerClasses}>
      <div className="flex items-center space-x-4">
        {title && <h1 className={titleClasses}>{title}</h1>}
        {children}
      </div>

      <div className="flex items-center space-x-4">
        {rightContent}
        {showModeSwitcher && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleModeChange(AppMode.ADMIN)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                isAdminTheme
                  ? mode === AppMode.ADMIN
                    ? "bg-white/20 text-primary-background"
                    : "text-primary-background/70 hover:bg-white/10"
                  : mode === AppMode.ADMIN
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              Profile
            </button>
            <button
              onClick={() => handleModeChange(AppMode.PWA)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                isAdminTheme
                  ? mode === AppMode.PWA
                    ? "bg-white/20 text-primary-background"
                    : "text-primary-background/70 hover:bg-white/10"
                  : mode === AppMode.PWA
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              Analytics
            </button>
          </div>
        )}
        <UserDropdownMenu theme={theme} />
      </div>
    </header>
  );
}
