"use client"

import { AppProvider } from "@/lib/app-context"
import { AppShell } from "@/components/app-shell"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <AppProvider>
      <AppShell>
        <Dashboard />
      </AppShell>
    </AppProvider>
  )
}
