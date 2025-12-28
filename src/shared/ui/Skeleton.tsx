import React from "react";
import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  const baseClasses = "bg-white/10 backdrop-blur-sm animate-pulse";

  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded-xl",
    circular: "rounded-full",
  };

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={{
        width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
        height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
      }}
    />
  );
}

// Pre-built skeleton components for common layouts
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton variant="text" width="200px" height="32px" className="mb-2" />
        <Skeleton variant="text" width="300px" height="20px" />
      </div>

      {/* Monthly Overview Widgets */}
      <div>
        <Skeleton variant="text" width="150px" height="24px" className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton variant="text" width="80px" height="16px" className="mb-2" />
                  <Skeleton variant="text" width="60px" height="24px" className="mb-1" />
                </div>
                <Skeleton variant="circular" width="32px" height="32px" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
          <Skeleton variant="text" width="150px" height="24px" className="mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton variant="circular" width="32px" height="32px" />
                  <div>
                    <Skeleton variant="text" width="100px" height="16px" className="mb-1" />
                    <Skeleton variant="text" width="60px" height="14px" />
                  </div>
                </div>
                <Skeleton variant="text" width="50px" height="16px" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
          <Skeleton variant="text" width="150px" height="24px" className="mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton variant="circular" width="32px" height="32px" />
                  <div>
                    <Skeleton variant="text" width="120px" height="16px" className="mb-1" />
                    <Skeleton variant="text" width="80px" height="14px" />
                  </div>
                </div>
                <Skeleton variant="text" width="50px" height="16px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" width="80px" height="16px" />
          ))}
        </div>
      </div>
      {/* Table Body */}
      <div className="divide-y divide-white/10">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="flex items-center space-x-3">
                <Skeleton variant="circular" width="32px" height="32px" />
                <div>
                  <Skeleton variant="text" width="100px" height="16px" className="mb-1" />
                  <Skeleton variant="text" width="80px" height="14px" />
                </div>
              </div>
              <Skeleton variant="text" width="120px" height="16px" />
              <Skeleton variant="text" width="60px" height="16px" />
              <Skeleton variant="text" width="70px" height="16px" />
              <div className="flex space-x-2">
                <Skeleton variant="rectangular" width="24px" height="24px" />
                <Skeleton variant="rectangular" width="24px" height="24px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton variant="circular" width="40px" height="40px" />
              <div className="flex-1">
                <Skeleton variant="text" width="150px" height="20px" className="mb-2" />
                <Skeleton variant="text" width="100px" height="16px" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Skeleton variant="rectangular" width="24px" height="24px" />
              <Skeleton variant="rectangular" width="24px" height="24px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
