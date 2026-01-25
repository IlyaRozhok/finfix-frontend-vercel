import React from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { UserDropdownMenu } from "../UserDropdownMenu";
import { useMode } from "@/app/providers/ModeProvider";
import { AppMode } from "@/app/modes/types";

interface HeaderProps {
  className?: string;
}

export function PWAHeader({ className }: HeaderProps) {
  const navigate = useNavigate();
  const { mode, setMode } = useMode();

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === AppMode.PWA) {
      navigate("/analytics");
    } else {
      navigate("/profile");
    }
  };

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 h-16 flex items-center justify-between backdrop-blur-xl bg-white/10 border-b border-white/20 px-6",
        className
      )}
    >
        <div
          onClick={() => navigate("/analytics")}
          className="cursor-pointer"
        >
        <h1 className="text-2xl font-light text-primary-background tracking-wider">
          FinFix
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleModeChange(AppMode.ADMIN)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === AppMode.ADMIN
                ? "bg-white/20 text-primary-background"
                : "text-primary-background/70 hover:bg-white/10"
            )}
          >
                Profile
          </button>
          <button
            onClick={() => handleModeChange(AppMode.PWA)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === AppMode.PWA
                ? "bg-white/20 text-primary-background"
                : "text-primary-background/70 hover:bg-white/10"
            )}
          >
            Analytics
          </button>
        </div>
        <UserDropdownMenu theme="admin" />
      </div>
    </header>
  );
}
