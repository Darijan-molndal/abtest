"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Filter,
  ChevronRight,
  FileText,
  Clock,
  MapPin,
  User,
  X,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { StatusChip } from "@/components/status-chip"
import { PriorityIndicator } from "@/components/priority-indicator"
import { useApp } from "@/lib/app-context"
import { STATUS_LABELS, ROLE_LABELS, type Status, type WorkRequest } from "@/lib/types"
import { FACILITIES } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function CompletedView() {
  const { requests } = useApp()
  const [facilityFilter, setFacilityFilter] = useState<string>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Filtrera endast avslutade ärenden (status: completed)
  const filtered = useMemo(() => {
    let result = requests.filter((r) => r.status === "completed")
    if (facilityFilter !== "all") {
      result = result.filter((r) => r.facility === facilityFilter)
    }
    return result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [requests, facilityFilter])

  const selectedRequest = selectedId ? requests.find((r) => r.id === selectedId) : null

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Avslutade ärenden
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} avslutade ärenden
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={facilityFilter} onValueChange={setFacilityFilter}>
          <SelectTrigger className="h-8 w-[220px]">
            <SelectValue placeholder="Anläggning" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla anläggningar</SelectItem>
            {FACILITIES.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {facilityFilter !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFacilityFilter("all")}
            className="h-8"
          >
            <X className="mr-1 h-3 w-3" />
            Rensa filter
          </Button>
        )}
      </div>

      {/* Content: list + preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: request list */}
        <div className="flex-1 overflow-y-auto border-r border-border">
          <div className="divide-y divide-border">
            {filtered.map((req) => (
              <button
                key={req.id}
                onClick={() => setSelectedId(req.id)}
                className={cn(
                  "flex w-full items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-accent",
                  selectedId === req.id && "bg-accent"
                )}
              >
                <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{req.id}</span>
                    <PriorityIndicator priority={req.priority} />
                    <StatusChip status={req.status} />
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">
                    {req.title}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {req.facility}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(req.updatedAt).toLocaleDateString("sv-SE")}
                    </span>
                  </div>
                </div>
                <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <CheckCircle2 className="mb-3 h-10 w-10" />
                <p className="text-sm">Inga avslutade ärenden</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: preview panel */}
        <div className="hidden w-[400px] shrink-0 overflow-y-auto lg:block">
          {selectedRequest ? (
            <PreviewPanel request={selectedRequest} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-10 w-10" />
                <p className="text-sm">Välj ett ärende för att se förhandsgranskning</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PreviewPanel({ request }: { request: WorkRequest }) {
  const fulfilled = request.requisites.filter((r) => r.fulfilled).length
  const total = request.requisites.length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-mono text-muted-foreground">{request.id}</span>
        <StatusChip status={request.status} />
        <PriorityIndicator priority={request.priority} />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-foreground">{request.title}</h2>
      <p className="mb-4 text-sm text-muted-foreground leading-relaxed">{request.description}</p>

      <Separator className="my-4" />

      {/* Quick facts */}
      <div className="mb-4 flex flex-col gap-3">
        <DetailRow icon={MapPin} label="Anläggning" value={request.facility} />
        <DetailRow icon={Clock} label="Önskat datum" value={request.requestedStart} />
        <DetailRow icon={Clock} label="Varaktighet" value={request.duration} />
        <DetailRow icon={User} label="Skapad av" value={request.createdBy} />
      </div>

      <Separator className="my-4" />

      {/* Requisites summary */}
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-semibold text-foreground">Rekvisit</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                fulfilled === total ? "bg-emerald-500" : "bg-amber-500"
              )}
              style={{ width: `${total > 0 ? (fulfilled / total) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {fulfilled}/{total}
          </span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {request.requisites.map((req) => (
            <li key={req.id} className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  req.fulfilled ? "bg-emerald-500" : "bg-red-400"
                )}
              />
              <span className={cn(req.fulfilled ? "text-muted-foreground" : "text-foreground font-medium")}>
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Separator className="my-4" />

      <Link href={`/requests/${request.id}`}>
        <Button className="w-full">
          Öppna ärende
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
