"use client"

import { cn } from "@/lib/utils"

const PRIORITY_CONFIG = {
  low: { label: "Lag", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medel", className: "bg-blue-100 text-blue-800" },
  high: { label: "Hog", className: "bg-orange-100 text-orange-800" },
  critical: { label: "Kritisk", className: "bg-red-100 text-red-800" },
}

export function PriorityIndicator({
  priority,
  className,
}: {
  priority: "low" | "medium" | "high" | "critical"
  className?: string
}) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
