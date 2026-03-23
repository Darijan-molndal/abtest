"use client"

import { cn } from "@/lib/utils"
import { STATUS_LABELS, STATUS_COLORS, type Status } from "@/lib/types"

export function StatusChip({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_COLORS[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
