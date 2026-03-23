"use client"

import { AppProvider } from "@/lib/app-context"
import { AppShell } from "@/components/app-shell"
import { InboxView } from "@/components/inbox-view"

export default function InboxPage() {
  return (
    <AppProvider>
      <AppShell>
        <InboxView />
      </AppShell>
    </AppProvider>
  )
}
