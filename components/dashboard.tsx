"use client"

import { useMemo, useState } from "react"
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
import { PriorityIndicator } from "@/components/priority-indicator"
import { useApp } from "@/lib/app-context"
import { ROLE_LABELS, type Status, type WorkRequest } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type CategoryKey = "submitted" | "review" | "godkandDriftorder" | "needsMoreInfo" | "approved" | "planned" | "draft" | "inskickade" | "planerade" | "ready"

const CATEGORY_TITLES: Record<CategoryKey, string> = {
  submitted: "Inkommen arbetsbegäran",
  review: "Driftorder skriven",
  godkandDriftorder: "Kontrollerad och godkänd driftorder",
  needsMoreInfo: "Skickat för komplettering",
  approved: "Arbetsbegäran godkänd",
  planned: "Avslutade",
  draft: "Mina utkast",
  inskickade: "Inskickade",
  planerade: "Planerade",
  ready: "Driftorder under utförande",
}

export function Dashboard() {
  const { currentRole, requests } = useApp()
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null)

  const stats = useMemo(() => {
    return {
      // Inkommen arbetsbegäran
      inkommenArbetsbegaran: requests.filter((r) => r.status === "submitted" && r.phase === "arbetsbegaran").length,
      // Arbetsbegäran godkänd  
      arbetsbegäranGodkand: requests.filter((r) => r.status === "approved" && r.phase === "arbetsbegaran").length,
      // Driftorder skriven
      driftorderSkriven: requests.filter((r) => r.status === "planned" && r.phase === "driftorder").length,
      // Driftorder godkänd
      driftorderGodkand: requests.filter((r) => r.status === "approved" && r.phase === "driftorder").length,
      // Driftorder under utförande
      driftorderUnderUtforande: requests.filter((r) => r.status === "ready" && r.phase === "driftorder").length,
      // Avslutad
      completed: requests.filter((r) => r.status === "completed").length,
      // Komplettering arbetsbegäran
      kompletteringArbetsbegaran: requests.filter((r) => r.status === "needs_more_info" && r.phase === "arbetsbegaran").length,
      // Komplettering driftorder
      kompletteringDriftorder: requests.filter((r) => r.status === "needs_more_info" && r.phase === "driftorder").length,
      // Totalt
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
    () => requests.filter((r) => r.status === "submitted" && r.phase === "arbetsbegaran"),
    [requests]
  )

  const skrivnaDriftordrar = useMemo(
    () => requests.filter((r) => r.status === "planned" && r.phase === "driftorder"),
    [requests]
  )

  const godkandaDriftordrar = useMemo(
    () => requests.filter((r) => r.status === "approved" && r.phase === "driftorder"),
    [requests]
  )

  const driftordrarUnderUtforande = useMemo(
    () => requests.filter((r) => r.status === "ready" && r.phase === "driftorder"),
    [requests]
  )

  const kompletteringar = useMemo(
    () => requests.filter((r) => r.status === "needs_more_info"),
    [requests]
  )

  const getRequestsForCategory = (category: CategoryKey): WorkRequest[] => {
    switch (category) {
      case "submitted":
        return requests.filter((r) => r.status === "submitted" && r.phase === "arbetsbegaran")
      case "review":
        return requests.filter((r) => r.status === "planned" && r.phase === "driftorder")
      case "godkandDriftorder":
        return requests.filter((r) => r.status === "approved" && r.phase === "driftorder")
      case "needsMoreInfo":
        return requests.filter((r) => r.status === "needs_more_info")
      case "approved":
        return requests.filter((r) => r.status === "approved" && r.phase === "arbetsbegaran")
      case "planned":
        return requests.filter((r) => r.status === "completed")
      case "draft":
        return requests.filter((r) => r.status === "draft")
      case "inskickade":
        return requests.filter((r) => (r.status === "submitted" || r.status === "approved") && r.phase === "arbetsbegaran")
      case "planerade":
        return requests.filter((r) => r.status === "planned" || r.status === "ready")
      case "ready":
        return requests.filter((r) => r.status === "ready" && r.phase === "driftorder")
      default:
        return []
    }
  }

  const selectedRequests = selectedCategory ? getRequestsForCategory(selectedCategory) : []

  const isReviewer = currentRole === "controlroom" || currentRole === "shiftlead1" || currentRole === "shiftlead2"

  return (
    <div className="p-6">
      {/* Dialog för att visa ärenden i vald kategori */}
      <Dialog open={selectedCategory !== null} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? CATEGORY_TITLES[selectedCategory] : ""}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {selectedRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Inga ärenden i denna kategori.</p>
            ) : (
              <div className="divide-y divide-border">
                {selectedRequests.map((req) => (
                  <Link
                    key={req.id}
                    href={`/requests/${req.id}`}
                    onClick={() => setSelectedCategory(null)}
                    className="flex flex-col gap-1 px-4 py-3 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{req.id}</span>
                      <PriorityIndicator priority={req.priority} />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {req.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{req.facility}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Översikt
          </p>
        </div>
        <Link href="/driftorder/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Skapa Driftorder
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      {isReviewer ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Inkommen arbetsbegäran"
            value={stats.inkommenArbetsbegaran}
            icon={Inbox}
            variant="blue"
            onClick={() => setSelectedCategory("submitted")}
          />
          <StatCard
            title="Skriven Driftorder"
            value={stats.driftorderSkriven}
            icon={Clock}
            variant="amber"
            onClick={() => setSelectedCategory("review")}
          />
          <StatCard
            title="Kontrollerad och godkänd driftorder"
            value={stats.driftorderGodkand}
            icon={CheckCircle2}
            variant="emerald"
            onClick={() => setSelectedCategory("godkandDriftorder")}
          />
          <StatCard
            title="Driftorder under utförande"
            value={stats.driftorderUnderUtforande}
            icon={AlertTriangle}
            variant="orange"
            onClick={() => setSelectedCategory("ready")}
          />
          <StatCard
            title="Skickat för komplettering"
            value={stats.kompletteringArbetsbegaran + stats.kompletteringDriftorder}
            icon={Send}
            variant="blue"
            onClick={() => setSelectedCategory("needsMoreInfo")}
          />
          <StatCard
            title="Avslutade"
            value={stats.completed}
            icon={CalendarDays}
            variant="emerald"
            onClick={() => setSelectedCategory("planned")}
          />
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Mina utkast"
            value={0}
            icon={FileText}
            variant="default"
            onClick={() => setSelectedCategory("draft")}
          />
          <StatCard
            title="Inskickade"
            value={stats.inkommenArbetsbegaran + stats.arbetsbegäranGodkand}
            icon={Send}
            variant="blue"
            onClick={() => setSelectedCategory("inskickade")}
          />
          <StatCard
            title="Komplettering kravs"
            value={stats.kompletteringArbetsbegaran + stats.kompletteringDriftorder}
            icon={AlertTriangle}
            variant="orange"
            onClick={() => setSelectedCategory("needsMoreInfo")}
          />
          <StatCard
            title="Planerade"
            value={stats.driftorderSkriven + stats.driftorderUnderUtforande}
            icon={CheckCircle2}
            variant="emerald"
            onClick={() => setSelectedCategory("planerade")}
          />
        </div>
      )}

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Kolumn 1: Arbetsbegäran */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Arbetsbegäran</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {arbetsordrar.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Inga arbetsbegäran</p>
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

          {/* Kolumn 3: Kontrollerad och godkänd driftorder */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Kontrollerad och godkänd driftorder</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {godkandaDriftordrar.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Inga godkända driftordrar</p>
                ) : (
                  godkandaDriftordrar.map((req) => (
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

          {/* Kolumn 4: Driftordrar under utförande */}
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

          {/* Kolumn 5: Kompletteringar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Kompletteringar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {kompletteringar.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Inga kompletteringar</p>
                ) : (
                  kompletteringar.map((req) => (
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
  onClick,
}: {
  title: string
  value: number
  icon: React.ElementType
  variant?: "default" | "blue" | "amber" | "orange" | "emerald"
  onClick?: () => void
}) {
  const iconColors = {
    default: "text-muted-foreground",
    blue: "text-blue-600",
    amber: "text-amber-600",
    orange: "text-orange-600",
    emerald: "text-emerald-600",
  }

  return (
    <Card 
      className={cn(
        onClick && "cursor-pointer hover:bg-accent/50 transition-colors"
      )}
      onClick={onClick}
    >
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
