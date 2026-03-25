"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PriorityIndicator } from "@/components/priority-indicator"
import { AppProvider, useApp } from "@/lib/app-context"
import { AppShell } from "@/components/app-shell"
import type { Status } from "@/lib/types"

// Nya kategorier för statusflödet
type FlowCategory = {
  id: string
  label: string
  statuses: Status[]
}

const FLOW_CATEGORIES: FlowCategory[] = [
  { id: "inkommen", label: "Inkommen arbetsbegäran", statuses: ["submitted"] },
  { id: "begaran_godkand", label: "Arbetsbegäran godkänd", statuses: ["approved"] },
  { id: "driftorder_skriven", label: "Driftorder skriven", statuses: ["review"] },
  { id: "driftorder_godkand", label: "Driftorder godkänd", statuses: ["planned"] },
  { id: "under_utforande", label: "Driftorder under utförande", statuses: ["ready"] },
  { id: "avslutad", label: "Avslutad", statuses: ["completed"] },
]

function StatusFlowContent() {
  const { requests } = useApp()

  const categoryData = useMemo(() => {
    return FLOW_CATEGORIES.map((category) => {
      const categoryRequests = requests.filter((r) => 
        category.statuses.includes(r.status)
      )
      return {
        ...category,
        count: categoryRequests.length,
        requests: categoryRequests,
      }
    })
  }, [requests])

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
            {categoryData.map((category, i) => (
              <div key={category.id} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 min-w-[140px]">
                  <span className="text-xs font-medium text-muted-foreground text-center whitespace-nowrap">
                    {category.label}
                  </span>
                  <span className="text-lg font-bold text-foreground">{category.count}</span>
                </div>
                {i < categoryData.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed view per category */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categoryData.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{category.label}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {category.count} st
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border max-h-64 overflow-y-auto">
                {category.requests.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Inga ärenden</p>
                ) : (
                  category.requests.map((req) => (
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
