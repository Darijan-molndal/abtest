"use client"

import { useMemo } from "react"
import Link from "next/link"
import { CalendarDays, Clock, MapPin } from "lucide-react"
import { AppProvider } from "@/lib/app-context"
import { AppShell } from "@/components/app-shell"
import { useApp } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusChip } from "@/components/status-chip"
import { PriorityIndicator } from "@/components/priority-indicator"

function CalendarView() {
  const { requests } = useApp()

  const planned = useMemo(
    () =>
      requests.filter(
        (r) => r.status === "planned" || r.status === "ready" || r.status === "approved"
      ),
    [requests]
  )

  // Simple week view with days
  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay() + 1 + i) // Mon-Sun
    return d
  })

  const dayNames = ["Man", "Tis", "Ons", "Tor", "Fre", "Lor", "Son"]

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Planering</h1>
          <p className="text-sm text-muted-foreground">
            Veckovy - {planned.length} planerade arenden
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Week grid */}
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day, i) => {
            const dateStr = day.toISOString().split("T")[0]
            const dayRequests = planned.filter((r) => r.requestedStart === dateStr)
            const isToday = day.toDateString() === today.toDateString()

            return (
              <div key={i} className="flex flex-col gap-2">
                <div
                  className={`rounded-md border p-2 text-center text-sm ${
                    isToday
                      ? "border-foreground bg-foreground text-background font-bold"
                      : "border-border text-foreground"
                  }`}
                >
                  <div className="text-xs text-inherit opacity-70">{dayNames[i]}</div>
                  <div className="text-lg font-semibold">{day.getDate()}</div>
                </div>
                <div className="flex flex-col gap-1.5 min-h-[120px]">
                  {dayRequests.map((req) => (
                    <Link key={req.id} href={`/requests/${req.id}`}>
                      <div className="rounded-md border border-border bg-card p-2 hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-center gap-1 mb-1">
                          <StatusChip status={req.status} />
                        </div>
                        <p className="text-xs font-medium text-foreground truncate">{req.title}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {req.duration}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Upcoming list */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Kommande planerade arenden
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {planned.length > 0 ? (
                planned.map((req) => (
                  <Link
                    key={req.id}
                    href={`/requests/${req.id}`}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-accent transition-colors"
                  >
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{req.id}</span>
                        <PriorityIndicator priority={req.priority} />
                        <StatusChip status={req.status} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{req.title}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.facility}</span>
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{req.requestedStart}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{req.duration}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="px-6 py-8 text-center text-sm text-muted-foreground">Inga planerade arenden</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <AppProvider>
      <AppShell>
        <CalendarView />
      </AppShell>
    </AppProvider>
  )
}
