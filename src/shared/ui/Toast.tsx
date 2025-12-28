import React, { useEffect, useState } from "react";
import { clsx } from "clsx";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps extends ToastData {
  onClose: (id: string) => void;
}

const toastStyles = {
  success: {
    bg: "bg-emerald-500/8",
    border: "border-emerald-400/25",
    icon: CheckCircleIcon,
    iconColor: "text-emerald-400",
  },
  error: {
    bg: "bg-rose-500/8",
    border: "border-rose-400/25",
    icon: XCircleIcon,
    iconColor: "text-rose-400",
  },
  warning: {
    bg: "bg-amber-500/8",
    border: "border-amber-400/25",
    icon: ExclamationTriangleIcon,
    iconColor: "text-amber-400",
  },
  info: {
    bg: "bg-sky-500/8",
    border: "border-sky-400/25",
    icon: InformationCircleIcon,
    iconColor: "text-sky-400",
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const style = toastStyles[type];
  const Icon = style.icon;

  useEffect(() => {
    // Trigger enter animation
    setIsVisible(true);

    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300); // Wait for exit animation
  };

  return (
    <div
      className={clsx(
        "max-w-md w-full bg-white/15 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-2xl p-6 transition-all duration-300 ease-out",
        style.bg,
        {
          "translate-x-0 opacity-100 scale-100": isVisible && !isLeaving,
          "translate-x-full opacity-0 scale-95": isLeaving,
          "-translate-x-full opacity-0 scale-95": !isVisible && !isLeaving,
        }
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <div className={clsx(
            "p-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20",
          )}>
            <Icon className={clsx("h-4 w-4", style.iconColor)} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-primary-background leading-tight">
            {title}
          </p>
          {description && (
            <p className="mt-1 text-sm text-primary-background/70 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 self-start">
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-primary-background/50 hover:text-primary-background hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 transition-all duration-200"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
