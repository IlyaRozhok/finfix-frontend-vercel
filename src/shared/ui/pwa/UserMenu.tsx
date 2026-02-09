import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import LogoutButton from "@/features/auth/logout/LogoutButton";
import { CloseButton } from "../CloseButton";
import { clsx } from "clsx";

export function UserDropdownMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-primary-background font-semibold text-xs">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            getInitials(user.userName || user.email)
          )}
        </div>
      </button>

      {isMenuOpen && (
        <>
          <div className="absolute right-0 top-12 w-64 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-4 z-[9999]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-primary-background font-semibold text-sm">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.userName || user.email)
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-background">
                  {user.userName}
                </p>
                <p className="text-xs text-primary-background/60">{user.email}</p>
              </div>
            </div>
            <CloseButton handleClose={() => setIsMenuOpen(false)} fill="black" />
          </div>

          <div className="pt-4 border-t border-white/20">
            <LogoutButton onLogoutStart={() => setIsMenuOpen(false)} />
          </div>
        </div>
        </>
      )}
    </div>
  );
}
