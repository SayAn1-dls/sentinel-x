"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * AlertBadge Component
 *
 * A reusable badge component that displays alert severity levels
 * with appropriate color coding for the Sentinel-X dashboard.
 *
 * Severity Levels:
 * - CRITICAL: Red background — immediate action required
 * - HIGH: Orange background — high priority investigation
 * - MEDIUM: Yellow background — requires review
 * - LOW: Blue background — informational
 */

export type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface AlertBadgeProps {
  severity: AlertSeverity;
  count?: number;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
  onClick?: () => void;
}

const severityConfig: Record<
  AlertSeverity,
  { bg: string; text: string; ring: string; label: string }
> = {
  CRITICAL: {
    bg: "bg-red-500/15",
    text: "text-red-700 dark:text-red-400",
    ring: "ring-red-500/30",
    label: "Critical",
  },
  HIGH: {
    bg: "bg-orange-500/15",
    text: "text-orange-700 dark:text-orange-400",
    ring: "ring-orange-500/30",
    label: "High",
  },
  MEDIUM: {
    bg: "bg-yellow-500/15",
    text: "text-yellow-700 dark:text-yellow-400",
    ring: "ring-yellow-500/30",
    label: "Medium",
  },
  LOW: {
    bg: "bg-blue-500/15",
    text: "text-blue-700 dark:text-blue-400",
    ring: "ring-blue-500/30",
    label: "Low",
  },
};

const sizeConfig: Record<string, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export const AlertBadge: React.FC<AlertBadgeProps> = ({
  severity,
  count,
  size = "md",
  pulse = false,
  className,
  onClick,
}) => {
  const config = severityConfig[severity];
  const sizeClass = sizeConfig[size];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset",
        "transition-all duration-200 ease-in-out",
        config.bg,
        config.text,
        config.ring,
        sizeClass,
        onClick && "cursor-pointer hover:opacity-80",
        !onClick && "cursor-default",
        pulse && severity === "CRITICAL" && "animate-pulse",
        className
      )}
    >
      {/* Severity dot indicator */}
      <span
        className={cn(
          "inline-block rounded-full",
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
          severity === "CRITICAL" && "bg-red-500",
          severity === "HIGH" && "bg-orange-500",
          severity === "MEDIUM" && "bg-yellow-500",
          severity === "LOW" && "bg-blue-500"
        )}
      />

      {/* Label */}
      <span>{config.label}</span>

      {/* Optional count */}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "ml-0.5 rounded-full px-1.5 font-bold",
            size === "sm" ? "text-[10px]" : "text-xs",
            config.bg
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
};

export default AlertBadge;
