"use client"

import { use } from "react"
import { AppProvider } from "@/lib/app-context"
import { AppShell } from "@/components/app-shell"
import { RequestDetail } from "@/components/request-detail"

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <AppProvider>
      <AppShell>
        <RequestDetail requestId={id} />
      </AppShell>
    </AppProvider>
  )
}
