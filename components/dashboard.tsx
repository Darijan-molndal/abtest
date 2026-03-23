"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Inbox,
  CalendarDays,
  Send,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusChip } from "@/components/status-chip"
import { PriorityIndicator } from "@/components/priority-indicator"
import { useApp } from "@/lib/app-context"
import { ROLE_LABELS, type Status } from "@/lib/types"
import { cn } from "@/lib/utils"

export function Dashboard() {
  const { currentRole, requests } = useApp()

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
      total: requests.length,
    }
  }, [requests])

  const recentRequests = useMemo(
    () =>
      [...requests]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [requests]
  )

  const arbetsordrar = useMemo(
    () => requests.filter((r) => r.status === "submitted"),
    [requests]
  )

  const skrivnaDriftordrar = useMemo(
    () => requests.filter((r) => r.status === "review" || r.status === "approved"),
    [requests]
  )

  const driftordrarUnderUtforande = useMemo(
    () => requests.filter((r) => r.status === "planned" || r.status === "ready"),
    [requests]
  )

  const isReviewer = currentRole === "controlroom" || currentRole === "shiftlead1" || currentRole === "shiftlead2"

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Översikt
          </p>
        </div>
        <Link href="/requests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Skapa Arbetsorder
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      {isReviewer ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Inkommen arbetsbegäran"
            value={stats.submitted}
            icon={Inbox}
            variant="blue"
          />
          <StatCard
            title="Skriven Driftorder"
            value={stats.review}
            icon={Clock}
            variant="amber"
          />
          <StatCard
            title="Driftorder under utförande"
            value={stats.needsMoreInfo}
            icon={AlertTriangle}
            variant="orange"
          />
          <StatCard
            title="Skickat för komplettering"
            value={stats.approved}
            icon={Send}
            variant="blue"
          />
          <StatCard
            title="Avslutade"
            value={stats.planned}
            icon={CalendarDays}
            variant="emerald"
          />
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Mina utkast"
            value={stats.draft}
            icon={FileText}
            variant="default"
          />
          <StatCard
            title="Inskickade"
            value={stats.submitted + stats.review}
            icon={Send}
            variant="blue"
          />
          <StatCard
            title="Komplettering kravs"
            value={stats.needsMoreInfo}
            icon={AlertTriangle}
            variant="orange"
          />
          <StatCard
            title="Planerade"
            value={stats.planned + stats.ready}
            icon={CheckCircle2}
            variant="emerald"
          />
        </div>
      )}

      {/* Status flow visualization */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Statusflöde</CardTitle>
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

      {/* Aktiva ärenden - tre kolumner */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Aktiva ärenden</h2>
          <Link href="/inbox">
            <Button variant="ghost" size="sm">
              Visa alla
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Kolumn 1: Arbetsordrar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Arbetsordrar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {arbetsordrar.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Inga arbetsordrar</p>
                ) : (
                  arbetsordrar.map((req) => (
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
                      <span className="text-xs text-muted-foreground">{req.facility}</span>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Kolumn 2: Skrivna driftordrar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Skrivna driftordrar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {skrivnaDriftordrar.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Inga skrivna driftordrar</p>
                ) : (
                  skrivnaDriftordrar.map((req) => (
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
                      <span className="text-xs text-muted-foreground">{req.facility}</span>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Kolumn 3: Driftordrar under utförande */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Driftordrar under utförande</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {driftordrarUnderUtforande.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Inga driftordrar under utförande</p>
                ) : (
                  driftordrarUnderUtforande.map((req) => (
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
                      <span className="text-xs text-muted-foreground">{req.facility}</span>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
}: {
  title: string
  value: number
  icon: React.ElementType
  variant?: "default" | "blue" | "amber" | "orange" | "emerald"
}) {
  const iconColors = {
    default: "text-muted-foreground",
    blue: "text-blue-600",
    amber: "text-amber-600",
    orange: "text-orange-600",
    emerald: "text-emerald-600",
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("rounded-lg bg-muted p-2.5", iconColors[variant])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
      </CardContent>
    </Card>
  )
}
