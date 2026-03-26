"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowRight, ArrowDown, CornerDownLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PriorityIndicator } from "@/components/priority-indicator"
import { AppProvider, useApp } from "@/lib/app-context"
import { AppShell } from "@/components/app-shell"
import type { Status, Phase, WorkRequest } from "@/lib/types"

// Nya kategorier för statusflödet med phase-stöd
type FlowCategory = {
  id: string
  label: string
  filter: (r: WorkRequest) => boolean
}

// Huvudflödet
const MAIN_FLOW_CATEGORIES: FlowCategory[] = [
  { id: "inkommen", label: "Inkommen arbetsbegäran", filter: (r) => r.status === "submitted" && r.phase === "arbetsbegaran" },
  { id: "begaran_godkand", label: "Arbetsbegäran godkänd", filter: (r) => r.status === "approved" && r.phase === "arbetsbegaran" },
  { id: "driftorder_skriven", label: "Driftorder skriven", filter: (r) => r.status === "planned" && r.phase === "driftorder" },
  { id: "driftorder_godkand", label: "Driftorder godkänd", filter: (r) => r.status === "approved" && r.phase === "driftorder" },
  { id: "under_utforande", label: "Driftorder under utförande", filter: (r) => r.status === "ready" && r.phase === "driftorder" },
  { id: "avslutad", label: "Avslutad", filter: (r) => r.status === "completed" },
]

// Sidoflöden för komplettering
const SIDE_FLOW_ARBETSBEGARAN: FlowCategory = { 
  id: "komplettering_arbetsbegaran", 
  label: "Komplettering arbetsbegäran", 
  filter: (r) => r.status === "needs_more_info" && r.phase === "arbetsbegaran"
}

const SIDE_FLOW_DRIFTORDER: FlowCategory = { 
  id: "komplettering_driftorder", 
  label: "Komplettering driftorder", 
  filter: (r) => r.status === "needs_more_info" && r.phase === "driftorder"
}

// Alla kategorier för detaljvyn
const ALL_CATEGORIES: FlowCategory[] = [
  MAIN_FLOW_CATEGORIES[0], // Inkommen
  SIDE_FLOW_ARBETSBEGARAN, // Komplettering arbetsbegäran
  MAIN_FLOW_CATEGORIES[1], // Arbetsbegäran godkänd
  MAIN_FLOW_CATEGORIES[2], // Driftorder skriven
  SIDE_FLOW_DRIFTORDER,    // Komplettering driftorder
  ...MAIN_FLOW_CATEGORIES.slice(3), // Resten
]

function StatusFlowContent() {
  const { requests } = useApp()

  const mainFlowData = useMemo(() => {
    return MAIN_FLOW_CATEGORIES.map((category) => {
      const categoryRequests = requests.filter(category.filter)
      return {
        ...category,
        count: categoryRequests.length,
        requests: categoryRequests,
      }
    })
  }, [requests])

  const sideFlowArbetsbegaran = useMemo(() => {
    const categoryRequests = requests.filter(SIDE_FLOW_ARBETSBEGARAN.filter)
    return {
      ...SIDE_FLOW_ARBETSBEGARAN,
      count: categoryRequests.length,
      requests: categoryRequests,
    }
  }, [requests])

  const sideFlowDriftorder = useMemo(() => {
    const categoryRequests = requests.filter(SIDE_FLOW_DRIFTORDER.filter)
    return {
      ...SIDE_FLOW_DRIFTORDER,
      count: categoryRequests.length,
      requests: categoryRequests,
    }
  }, [requests])

  const allCategoryData = useMemo(() => {
    return ALL_CATEGORIES.map((category) => {
      const categoryRequests = requests.filter(category.filter)
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
          {/* Huvudflöde */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {mainFlowData.map((category, i) => (
              <div key={category.id} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 min-w-[140px]">
                  <span className="text-xs font-medium text-muted-foreground text-center whitespace-nowrap">
                    {category.label}
                  </span>
                  <span className="text-lg font-bold text-foreground">{category.count}</span>
                </div>
                {i < mainFlowData.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          {/* Sidoflöden för komplettering */}
          <div className="flex items-start gap-2 mt-4">
            {/* Komplettering arbetsbegäran - under "Inkommen arbetsbegäran" */}
            <div className="flex flex-col items-center ml-[70px]">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col items-center gap-1 rounded-lg border bg-card p-3 min-w-[140px] border-dashed border-orange-300">
                <span className="text-xs font-medium text-orange-600 text-center whitespace-nowrap">
                  {sideFlowArbetsbegaran.label}
                </span>
                <span className="text-lg font-bold text-foreground">{sideFlowArbetsbegaran.count}</span>
              </div>
              <CornerDownLeft className="h-4 w-4 text-muted-foreground mt-1 -scale-x-100" />
            </div>

            {/* Komplettering driftorder - under "Driftorder skriven" (position 2, index 2) */}
            <div className="flex flex-col items-center ml-[232px]">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col items-center gap-1 rounded-lg border bg-card p-3 min-w-[140px] border-dashed border-orange-300">
                <span className="text-xs font-medium text-orange-600 text-center whitespace-nowrap">
                  {sideFlowDriftorder.label}
                </span>
                <span className="text-lg font-bold text-foreground">{sideFlowDriftorder.count}</span>
              </div>
              <CornerDownLeft className="h-4 w-4 text-muted-foreground mt-1 -scale-x-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed view per category */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allCategoryData.map((category) => (
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
