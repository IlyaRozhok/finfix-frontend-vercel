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
          "relative flex h-11 items-center rounded-xl transition-shadow",
          "bg-black/90 backdrop-blur-md",
          "ring-1 ring-slate-400/25 hover:ring-slate-400/40",
          "focus-within:ring-2 focus-within:ring-sky-400/40",
          disabled && "opacity-60 pointer-events-none",
          textError && "!ring-2 !ring-rose-500/70"
        )}
      >
        <input
          disabled={disabled}
          className={clsx(
            "w-full bg-transparent outline-none",
            "px-3 py-2 text-sm leading-5",
            "text-slate-200 placeholder:text-slate-300",
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
