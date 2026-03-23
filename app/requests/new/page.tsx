"use client"

import { AppProvider } from "@/lib/app-context"
import { AppShell } from "@/components/app-shell"
import { CreateRequestForm } from "@/components/create-request-form"

export default function NewRequestPage() {
  return (
    <AppProvider>
      <AppShell>
        <CreateRequestForm />
      </AppShell>
    </AppProvider>
  )
}
