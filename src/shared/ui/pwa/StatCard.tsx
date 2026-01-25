import React from "react";
import { Card } from "./Card";
import { clsx } from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  variant?: "default" | "positive" | "negative";
  className?: string;
}

export function StatCard({ label, value, variant = "default", className }: StatCardProps) {
  const valueClasses = clsx(
    "text-xl font-bold",
    variant === "positive" && "text-green-500",
    variant === "negative" && "text-red-500",
    variant === "default" && "text-primary-background"
  );

  return (
    <Card className={clsx("p-4", className)}>
      <div className="text-xs font-medium text-primary-background/60 uppercase tracking-wide mb-2">
        {label}
      </div>
      <div className={valueClasses}>{value}</div>
    </Card>
  );
}
