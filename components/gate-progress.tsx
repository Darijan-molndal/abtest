"use client"

import { CheckCircle2, Circle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Status } from "@/lib/types"

const GATES: { key: Status; label: string }[] = [
  { key: "draft", label: "Utkast" },
  { key: "submitted", label: "Inskickad" },
  { key: "review", label: "Granskning" },
  { key: "approved", label: "Godkand" },
  { key: "planned", label: "Planerad" },
  { key: "ready", label: "REDO" },
  { key: "completed", label: "Avslutad" },
]

function gateIndex(status: Status): number {
  if (status === "needs_more_info") return 2 // sits at "Granskning"
  if (status === "rejected") return -1 // special
  return GATES.findIndex((g) => g.key === status)
}

export function GateProgress({ status }: { status: Status }) {
  const isRejected = status === "rejected"
  const isNeedsInfo = status === "needs_more_info"
  const currentIdx = gateIndex(status)

  return (
    <div className="w-full border-b border-border bg-card px-6 py-4">
      {/* Rejected banner */}
      {isRejected && (
        <div className="mb-3 flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600">
          <XCircle className="h-4 w-4" />
          Arendet har avslagits
        </div>
      )}

      {/* Needs more info banner */}
      {isNeedsInfo && (
        <div className="mb-3 flex items-center gap-2 rounded-md bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-600">
          <Circle className="h-4 w-4" />
          Komplettering begard -- vantande pa ansokande
        </div>
      )}

      {/* Gate steps */}
      <div className="flex items-center">
        {GATES.map((gate, i) => {
          const isPast = !isRejected && currentIdx > i
          const isCurrent = !isRejected && currentIdx === i
          const isFuture = isRejected || currentIdx < i

          return (
            <div key={gate.key} className="flex items-center flex-1 last:flex-none">
              {/* Gate node */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    isPast && "border-emerald-500 bg-emerald-500 text-white",
                    isCurrent && "border-primary bg-primary text-primary-foreground",
                    isFuture && "border-muted-foreground/30 bg-card text-muted-foreground/40",
                    isRejected && "border-muted-foreground/30 bg-card text-muted-foreground/40"
                  )}
                >
                  {isPast ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium whitespace-nowrap",
                    isPast && "text-emerald-600",
                    isCurrent && "text-foreground font-semibold",
                    isFuture && "text-muted-foreground/50",
                    isRejected && "text-muted-foreground/50"
                  )}
                >
                  {gate.label}
                </span>
              </div>

              {/* Connector line (not after last) */}
              {i < GATES.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-[2px] flex-1",
                    isPast && !isRejected ? "bg-emerald-500" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
