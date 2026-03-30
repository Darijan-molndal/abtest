"use client"

import { AppProvider } from "@/lib/app-context"
import { AppShell } from "@/components/app-shell"
import { CreateDriftorderForm } from "@/components/create-driftorder-form"

export default function NewDriftorderPage() {
  return (
    <AppProvider>
      <AppShell>
        <CreateDriftorderForm />
      </AppShell>
    </AppProvider>
  )
}
