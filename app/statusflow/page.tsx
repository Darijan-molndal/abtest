"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusChip } from "@/components/status-chip"
import { PriorityIndicator } from "@/components/priority-indicator"
import { AppProvider, useApp } from "@/lib/app-context"
import { AppShell } from "@/components/app-shell"
import type { Status } from "@/lib/types"

function StatusFlowContent() {
  const { requests } = useApp()

  const stats = useMemo(() => {
    const byStatus = (s: Status) => requests.filter((r) => r.status === s).length
    return {
      draft: byStatus("draft"),
      submitted: byStatus("submitted"),
      review: byStatus("review"),
      needsMoreInfo: byStatus("needs_more_info"),
      approved: byStatus("approved"),
      planned: byStatus("planned"),
      ready: byStatus("ready"),
      completed: byStatus("completed"),
    }
  }, [requests])

  const requestsByStatus = useMemo(() => {
    const groupByStatus = (s: Status) => requests.filter((r) => r.status === s)
    return {
      draft: groupByStatus("draft"),
      submitted: groupByStatus("submitted"),
      review: groupByStatus("review"),
      needs_more_info: groupByStatus("needs_more_info"),
      approved: groupByStatus("approved"),
      planned: groupByStatus("planned"),
      ready: groupByStatus("ready"),
      completed: groupByStatus("completed"),
    }
  }, [requests])

  const statusOrder: Status[] = [
    "draft",
    "submitted",
    "review",
    "needs_more_info",
    "approved",
    "planned",
    "ready",
    "completed",
  ]

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Statusflöde</h1>
        <p className="text-sm text-muted-foreground">
          Överblick av ärenden per status
        </p>
      </div>

      {/* Status flow visualization */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Flödesöversikt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(
              [
                { status: "draft" as Status, count: stats.draft },
                { status: "submitted" as Status, count: stats.submitted },
                { status: "review" as Status, count: stats.review },
                { status: "needs_more_info" as Status, count: stats.needsMoreInfo },
                { status: "approved" as Status, count: stats.approved },
                { status: "planned" as Status, count: stats.planned },
                { status: "ready" as Status, count: stats.ready },
                { status: "completed" as Status, count: stats.completed },
              ] as const
            ).map((item, i) => (
              <div key={item.status} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 min-w-[100px]">
                  <StatusChip status={item.status} />
                  <span className="text-lg font-bold text-foreground">{item.count}</span>
                </div>
                {i < 7 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed view per status */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statusOrder.map((status) => (
          <Card key={status}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <StatusChip status={status} />
                <span className="text-sm font-medium text-muted-foreground">
                  {requestsByStatus[status].length} st
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border max-h-64 overflow-y-auto">
                {requestsByStatus[status].length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Inga ärenden</p>
                ) : (
                  requestsByStatus[status].map((req) => (
                    <Link
                      key={req.id}
                      href={`/requests/${req.id}`}
                      className="flex flex-col gap-1 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{req.id}</span>
                        <PriorityIndicator priority={req.priority} />
                      </div>
                      <span className="text-sm font-medium text-foreground truncate">
                        {req.title}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function StatusFlowPage() {
  return (
    <AppProvider>
      <AppShell>
        <StatusFlowContent />
      </AppShell>
    </AppProvider>
  )
}
