"use client"

import { Settings, FileText, Users, ListChecks } from "lucide-react"
import { AppProvider } from "@/lib/app-context"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function SettingsView() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Installningar</h1>
        <p className="text-sm text-muted-foreground">
          Administrera mallar, metadata-falt och roller
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-lg bg-muted p-2.5">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Metadata-mallar</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Hantera faltlistor och valideringsregler for arbetsbegaran-formularet.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-lg bg-muted p-2.5">
              <ListChecks className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Rekvisit-definitioner</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Definiera vilka rekvisit som kravs for olika typer av arbeten.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-lg bg-muted p-2.5">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Roller & behorigheter</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Hantera anvandare, roller och agarskap for granskningsprocessen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 rounded-md border border-dashed border-border bg-muted/30 p-6 text-center">
        <Settings className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Installningssidorna ar platshallare i denna skiss. <br />
          Har skulle admin-funktioner for mallar, rekvisit och roller byggas ut.
        </p>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AppProvider>
      <AppShell>
        <SettingsView />
      </AppShell>
    </AppProvider>
  )
}
