import React from "react";
import clsx from "clsx";

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label?: string;
  error?: string | boolean;
  containerClassName?: string;
  reserveErrorSpace?: boolean;
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  disabled,
  className,
  containerClassName,
  ...rest
}) => {
  const textError = typeof error === "string" ? error : "";

  return (
    <div className={clsx("w-full", containerClassName)}>
      {label && (
        <label className="mb-1.5 block text-sm text-slate-300">{label}</label>
      )}

      <div
        className={clsx(
          "relative flex items-center rounded-xl transition-all duration-200",
          containerClassName?.includes("h-") ? "h-full" : "h-11",
          "bg-white/10 border border-white/20 hover:border-white/30",
          "focus-within:ring-2 focus-within:ring-white/30 focus-within:border focus-within:border-white/40",
          "focus-within:shadow-[0_0_8px_rgba(255,255,255,0.15)]",
          disabled && "opacity-60 pointer-events-none",
          textError && "!ring-2 !ring-rose-500/70 !border-rose-500/70"
        )}
        style={{ backdropFilter: 'none' }}
      >
        <input
          disabled={disabled}
          className={clsx(
            "w-full bg-transparent outline-none",
            "px-3 py-2 text-sm leading-5",
            "text-primary-background placeholder:text-primary-background/50",
            className
          )}
          {...rest}
        />
      </div>

      <div
        className={clsx(
          "mt-1 h-4 text-xs",
          textError ? "text-rose-400" : "invisible"
        )}
      >
        {textError || "placeholder"}
      </div>
    </div>
  );
};
