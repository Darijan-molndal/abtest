"use client"

import { AppProvider } from "@/lib/app-context"
import { AppShell } from "@/components/app-shell"
import { CompletedView } from "@/components/completed-view"

export default function RequestsPage() {
  return (
    <AppProvider>
      <AppShell>
        <CompletedView />
      </AppShell>
    </AppProvider>
  )
}
