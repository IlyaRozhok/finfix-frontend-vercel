import { clsx } from "clsx";

export type StatusBadgeVariant = "success" | "warning" | "error" | "neutral";

const variantStyles: Record<StatusBadgeVariant, string> = {
  success:
    "bg-transparent border border-green-500/70 text-primary-background",
  warning:
    "bg-transparent border border-amber-500/70 text-primary-background",
  error:
    "bg-transparent border border-red-500/70 text-primary-background",
  neutral:
    "bg-transparent border border-white/20 text-primary-background/80",
};

type StatusBadgeProps = {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  className?: string;
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

type StatusDotVariant = "success" | "warning" | "error" | "neutral";

const dotVariantStyles: Record<StatusDotVariant, string> = {
  success: "border-green-500/70",
  warning: "border-amber-500/70",
  error: "border-red-500/70",
  neutral: "border-white/30",
};

type StatusDotProps = {
  variant: StatusDotVariant;
  className?: string;
};

export function StatusDot({ variant, className }: StatusDotProps) {
  return (
    <span
      className={clsx(
        "inline-block w-2.5 h-2.5 rounded-full border-2 bg-transparent shrink-0",
        dotVariantStyles[variant],
        className
      )}
      aria-hidden
    />
  );
}
