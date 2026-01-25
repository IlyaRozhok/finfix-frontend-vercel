import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { clsx } from "clsx";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "ghost"
  | "glass"
  | "glass-primary"
  | "glass-secondary";

type ButtonSize = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  handler?: (param?: string | number) => void;
  param?: string | number;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600/50 shadow-lg",
  secondary:
    "bg-gray-600 text-white hover:bg-gray-700 border border-gray-600/50 shadow-lg",
  success:
    "bg-green-600 text-white hover:bg-green-700 border border-green-600/50 shadow-lg",
  danger:
    "bg-red-900 text-white hover:bg-red-800 border border-red-600/50 shadow-lg",
  ghost:
    "bg-transparent text-primary-background hover:bg-white/10 border border-transparent hover:border-white/20",
  glass:
    "bg-white/10 backdrop-blur-md text-primary-background hover:bg-white/20 border border-white/20",
  "glass-primary":
    "bg-white/20 backdrop-blur-md text-primary-background hover:bg-white/30 border border-white/30",
  "glass-secondary":
    "bg-white/15 backdrop-blur-md text-primary-background hover:bg-white/25 border border-white/25",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    className,
    handler,
    param,
    variant = "primary",
    size = "md",
    leftIcon,
    rightIcon,
    isLoading = false,
    children,
    disabled,
    onClick,
    ...p
  },
  ref
) {
  const baseClasses =
    "font-medium transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border focus:border-white/40 focus:shadow-[0_0_8px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Call onClick from props if provided (this is the primary way)
    if (onClick) {
      onClick(e);
    }
    // Also call handler if provided (for backward compatibility)
    if (handler && param !== undefined) {
      handler(param);
      return;
    }
    if (handler) {
      handler();
    }
  };

  const buttonContent = (
    <>
      {leftIcon && !isLoading && leftIcon}
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
      {rightIcon && !isLoading && rightIcon}
    </>
  );

  return (
    <button
      onClick={handleClick}
      ref={ref}
      disabled={disabled || isLoading}
      className={clsx(
        baseClasses,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...p}
    >
      {buttonContent}
    </button>
  );
});
