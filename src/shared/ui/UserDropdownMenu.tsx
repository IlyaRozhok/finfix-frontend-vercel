import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import LogoutButton from "@/features/auth/logout/LogoutButton";
import { UserIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

type UserDropdownMenuTheme = "admin" | "pwa";

interface UserDropdownMenuProps {
  theme?: UserDropdownMenuTheme;
}

export function UserDropdownMenu({ theme }: UserDropdownMenuProps) {
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

  const buttonClasses = clsx(
    "flex items-center space-x-2 p-2 rounded-lg transition-all",
    "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
  );

  const iconClasses = clsx(
    "h-4 w-4 transition-transform duration-200 text-primary-background/70",
    isMenuOpen ? "rotate-180" : ""
  );

  const avatarClasses = clsx(
    "w-8 h-8 rounded-full flex items-center justify-center",
    "bg-orange-500 text-white text-sm font-medium"
  );

  const avatarIconClasses = clsx(
    "h-4 w-4 text-white"
  );

  const menuClasses = clsx(
    "absolute right-0 top-12 w-72 rounded-2xl border shadow-2xl p-4 z-[9999]",
    "bg-gray-300 backdrop-blur-xl border-white/30",
    "animate-in fade-in slide-in-from-top-2 duration-200"
  );

  const userInfoNameClasses = clsx(
    "text-sm font-semibold text-gray-900"
  );

  const userInfoEmailClasses = clsx(
    "text-xs text-gray-600"
  );

  const dividerClasses = clsx(
    "border-t border-gray-200"
  );

  const largeAvatarClasses = clsx(
    "w-10 h-10 rounded-full flex items-center justify-center",
    "bg-orange-500 text-white text-base font-medium"
  );

  const largeAvatarIconClasses = clsx(
    "h-5 w-5 text-white"
  );

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={buttonClasses}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-contain"
          />
        ) : (
          <div className={avatarClasses}>
            {user.userName?.charAt(0)?.toUpperCase() || (
              <UserIcon className={avatarIconClasses} />
            )}
          </div>
        )}
        <ChevronDownIcon className={iconClasses} />
      </button>

      {isMenuOpen && (
        <div className={menuClasses}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-contain"
                />
              ) : (
                <div className={largeAvatarClasses}>
                  {user.userName?.charAt(0)?.toUpperCase() || (
                    <UserIcon className={largeAvatarIconClasses} />
                  )}
                </div>
              )}
              <div>
                <p className={userInfoNameClasses}>{user.userName}</p>
                <p className={userInfoEmailClasses}>{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-6 h-6 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className={clsx("pt-4", dividerClasses)}>
            <div className="w-full">
              <LogoutButton onLogoutStart={() => setIsMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
