"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Upload,
  Calendar,
  X,
  Check,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/lib/app-context"
import { FACILITIES } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { WorkRequest } from "@/lib/types"

const STEPS = [
  { id: 1, label: "Allman information", desc: "Grundlaggande projektinformation" },
  { id: 2, label: "Etapper", desc: "Planerade arbetsetapper" },
  { id: 3, label: "Slutfor", desc: "Ovrig information och status" },
]

interface StageForm {
  name: string
  startTime: string
  endTime: string
  description: string
  constraints: string[]
  requiresNotification: boolean
}

const emptyStage = (): StageForm => ({
  name: "",
  startTime: "",
  endTime: "",
  description: "",
  constraints: [""],
  requiresNotification: false,
})

const DEFAULT_REQUISITES = [
  "Riskanalys bifogad",
  "Arbetsschema godkant",
  "Reservdelar bestallda",
  "Sakerhetsgenomgang genomford",
  "Berorda system identifierade",
]

export function CreateRequestForm() {
  const router = useRouter()
  const { setRequests, requests, currentRole } = useApp()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)

  // Step 1 state
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [projectLeaderName, setProjectLeaderName] = useState("")
  const [projectLeaderEmail, setProjectLeaderEmail] = useState("")
  const [projectLeaderPhone, setProjectLeaderPhone] = useState("")
  const [driftLeaderName, setDriftLeaderName] = useState("")
  const [driftLeaderEmail, setDriftLeaderEmail] = useState("")
  const [elSafetyName, setElSafetyName] = useState("")
  const [elSafetyEmail, setElSafetyEmail] = useState("")
  const [elSafetyPhone, setElSafetyPhone] = useState("")
  const [contacts, setContacts] = useState([""])
  const [interruptionType, setInterruptionType] = useState("")

  // Step 2 state
  const [stages, setStages] = useState<StageForm[]>([emptyStage()])

  // Step 3 state
  const [notes, setNotes] = useState("")
  const [syncToEventList, setSyncToEventList] = useState(false)
  const [sendCalendarInvite, setSendCalendarInvite] = useState(false)
  const [statusOverride, setStatusOverride] = useState("submitted")

  const newId = `ARB-${1000 + requests.length + 1}`

  const addContact = () => setContacts([...contacts, ""])
  const removeContact = (i: number) => setContacts(contacts.filter((_, idx) => idx !== i))
  const updateContact = (i: number, val: string) => {
    const copy = [...contacts]
    copy[i] = val
    setContacts(copy)
  }

  const addStage = () => setStages([...stages, emptyStage()])
  const removeStage = (i: number) => {
    if (stages.length <= 1) return
    setStages(stages.filter((_, idx) => idx !== i))
  }
  const updateStage = (i: number, updates: Partial<StageForm>) => {
    const copy = [...stages]
    copy[i] = { ...copy[i], ...updates }
    setStages(copy)
  }
  const addConstraint = (stageIdx: number) => {
    const copy = [...stages]
    copy[stageIdx].constraints.push("")
    setStages(copy)
  }
  const updateConstraint = (stageIdx: number, cIdx: number, val: string) => {
    const copy = [...stages]
    copy[stageIdx].constraints[cIdx] = val
    setStages(copy)
  }

  const handleSubmit = () => {
    const facility = FACILITIES[0] || "HSP 10 kV"
    const newReq: WorkRequest = {
      id: newId,
      title: projectName || "Ny arbetsbegaran",
      description,
      facility,
      object: "",
      requestedStart: stages[0]?.startTime || "",
      duration: stages[0]?.endTime ? `Till ${stages[0].endTime}` : "",
      riskImpact: "",
      status: "submitted",
      priority: "medium",
      createdBy: projectLeaderName || "Demo-anvandare",
      createdByRole: "applicant",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requisites: DEFAULT_REQUISITES.map((label, i) => ({
        id: `r${i + 1}`,
        label,
        fulfilled: false,
      })),
      activityLog: [
        {
          id: "a1",
          timestamp: new Date().toISOString(),
          actor: projectLeaderName || "Demo-anvandare",
          role: "applicant",
          action: "Skapade och skickade in arbetsbegaran",
        },
      ],
      attachments: [],
      documents: [
        {
          id: "doc1",
          name: `ARB.BEG #${newId.replace("ARB-", "")}`,
          version: 1,
          generatedBy: "System",
          generatedAt: new Date().toISOString(),
          format: "pdf",
        },
      ],
      approvers: [
        { role: "shiftlead1", name: "Erik Johansson" },
        { role: "shiftlead2", name: "Maria Svensson" },
      ],
    }
    setRequests([newReq, ...requests])
    router.push("/inbox")
  }

  const isAdmin = currentRole === "controlroom" || currentRole === "shiftlead1" || currentRole === "shiftlead2"

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Laddar formularet...</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Title header */}
      <div className="border-b border-border px-6 py-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Arbetsbegaran for planerade avbrott
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          HSP 10 kV - Registrera din arbetsbegaran
        </p>
      </div>

      {/* Step indicator */}
      <div className="border-b border-border px-6 py-4">
        <Card>
          <CardContent className="flex items-center justify-center gap-4 p-4">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (s.id < step) setStep(s.id)
                  }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      step === s.id
                        ? "bg-foreground text-background"
                        : step > s.id
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                  </div>
                  <div className="text-left">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        step >= s.id ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {s.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-12",
                      step > s.id ? "bg-foreground" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl">
          {/* STEP 1 - Allman information */}
          {step === 1 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground">Allman information</h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  Fyll i grundlaggande information om projektet
                </p>

                <div className="flex flex-col gap-5">
                  {/* Projektnamn */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="projectName">
                      Projektnamn <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="projectName"
                      placeholder="Ange projektnamn"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Arbetsbegärans namn satts automatiskt till projektnamnet.
                    </p>
                  </div>

                  {/* Beskrivning */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="descArea">Beskrivning av arbetsbegaran</Label>
                    <Textarea
                      id="descArea"
                      placeholder="Beskriv syftet med arbetet, omfattning och viktiga forutsattningar."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Projektledare */}
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <h3 className="mb-3 text-sm font-semibold text-foreground">Projektledare</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <Label>
                            Namn <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            placeholder="Ange namn"
                            value={projectLeaderName}
                            onChange={(e) => setProjectLeaderName(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label>
                            E-post <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="email"
                            placeholder="namn@exempel.se"
                            value={projectLeaderEmail}
                            onChange={(e) => setProjectLeaderEmail(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label>
                            Telefon <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="tel"
                            placeholder="070-123 45 67"
                            value={projectLeaderPhone}
                            onChange={(e) => setProjectLeaderPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Driftledare */}
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <h3 className="mb-3 text-sm font-semibold text-foreground">Driftledare</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <Label>Namn</Label>
                          <Input
                            placeholder="Ange namn"
                            value={driftLeaderName}
                            onChange={(e) => setDriftLeaderName(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label>E-post</Label>
                          <Input
                            type="email"
                            placeholder="namn@exempel.se"
                            value={driftLeaderEmail}
                            onChange={(e) => setDriftLeaderEmail(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Elsakerhetsledare */}
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <h3 className="mb-3 text-sm font-semibold text-foreground">
                        Elsakerhetsledare
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <Label>Namn</Label>
                          <Input
                            placeholder="Ange namn"
                            value={elSafetyName}
                            onChange={(e) => setElSafetyName(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label>E-post</Label>
                          <Input
                            type="email"
                            placeholder="namn@exempel.se"
                            value={elSafetyEmail}
                            onChange={(e) => setElSafetyEmail(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label>
                            Telefon <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="tel"
                            placeholder="070-123 45 67"
                            value={elSafetyPhone}
                            onChange={(e) => setElSafetyPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Kontaktpersoner */}
                  <div className="flex flex-col gap-1.5">
                    <Label>
                      Kontaktperson(er) <span className="text-destructive">*</span>
                    </Label>
                    {contacts.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          placeholder="Ange kontaktperson"
                          value={c}
                          onChange={(e) => updateContact(i, e.target.value)}
                        />
                        {contacts.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            onClick={() => removeContact(i)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Ta bort</span>
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-fit" onClick={addContact}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Lagg till kontaktperson
                    </Button>
                  </div>

                  {/* Typ av avbrott */}
                  <div className="flex flex-col gap-1.5">
                    <Label>
                      Typ av avbrott <span className="text-destructive">*</span>
                    </Label>
                    <Select value={interruptionType} onValueChange={setInterruptionType}>
                      <SelectTrigger className="w-[240px]">
                        <SelectValue placeholder="Valj typ av avbrott" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planerat avbrott</SelectItem>
                        <SelectItem value="urgent">Akut avbrott</SelectItem>
                        <SelectItem value="maintenance">Underhall</SelectItem>
                        <SelectItem value="expansion">Utbyggnad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 2 - Etapper */}
          {step === 2 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground">Etapper</h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  Definiera arbetsetapper for projektet (minst en etapp kravs)
                </p>

                <div className="flex flex-col gap-4">
                  {stages.map((stage, i) => (
                    <div
                      key={i}
                      className="relative rounded-lg border border-border bg-card pl-4"
                    >
                      {/* Blue left accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-blue-500" />

                      <div className="p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-base font-semibold text-foreground">
                            Etapp {i + 1}
                          </h3>
                          {stages.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStage(i)}
                              className="text-muted-foreground"
                            >
                              <X className="mr-1 h-3.5 w-3.5" />
                              Ta bort
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-col gap-4">
                          {/* Etappnamn */}
                          <div className="flex flex-col gap-1.5">
                            <Label>
                              Etappnamn <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              placeholder="Ange etappnamn"
                              value={stage.name}
                              onChange={(e) => updateStage(i, { name: e.target.value })}
                            />
                          </div>

                          {/* Start / Sluttid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <Label>
                                Starttid <span className="text-destructive">*</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  type="datetime-local"
                                  value={stage.startTime}
                                  onChange={(e) =>
                                    updateStage(i, { startTime: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label>
                                Sluttid <span className="text-destructive">*</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  type="datetime-local"
                                  value={stage.endTime}
                                  onChange={(e) =>
                                    updateStage(i, { endTime: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          {/* Beskrivning */}
                          <div className="flex flex-col gap-1.5">
                            <Label>Beskrivning</Label>
                            <Textarea
                              placeholder="Beskriv arbetsetappen"
                              value={stage.description}
                              onChange={(e) =>
                                updateStage(i, { description: e.target.value })
                              }
                              rows={3}
                            />
                          </div>

                          {/* Avgransningar */}
                          <div className="flex flex-col gap-1.5">
                            <Label>Avgransningar for etappen</Label>
                            {stage.constraints.map((c, ci) => (
                              <Input
                                key={ci}
                                placeholder="Beskriv avgransning (omrade, kunder, stationer, m.m.)"
                                value={c}
                                onChange={(e) =>
                                  updateConstraint(i, ci, e.target.value)
                                }
                              />
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-fit"
                              onClick={() => addConstraint(i)}
                            >
                              <Plus className="mr-1.5 h-3.5 w-3.5" />
                              Lagg till avgransning
                            </Button>
                          </div>

                          {/* Avisering checkbox */}
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`notify-${i}`}
                              checked={stage.requiresNotification}
                              onCheckedChange={(checked) =>
                                updateStage(i, {
                                  requiresNotification: checked === true,
                                })
                              }
                            />
                            <Label htmlFor={`notify-${i}`} className="text-sm font-normal">
                              Avisering kravs for denna etapp
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Lagg till etapp */}
                  <button
                    onClick={addStage}
                    className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Lagg till etapp
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3 - Slutfor */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              {/* Ovrig information */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground">Ovrig information</h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Lagg till kommentarer och bilagor
                  </p>

                  <div className="flex flex-col gap-5">
                    {/* Noteringar */}
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="notes">Noteringar / Kommentarer</Label>
                      <Textarea
                        id="notes"
                        placeholder="Tydlig info om bilagor (fore/efter-bilder, kartor, driftschema) m.m."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    {/* Ovriga bilagor dropzone */}
                    <div className="flex flex-col gap-1.5">
                      <Label>Ovriga bilagor</Label>
                      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center">
                        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Dra och slapp filer har eller klicka for att valja
                        </p>
                        <Button variant="outline" size="sm" className="mt-3">
                          Valj filer
                        </Button>
                      </div>
                    </div>

                    {/* Specific file upload areas 2x2 */}
                    <div className="grid grid-cols-2 gap-4">
                      <FileUploadBox
                        title="Fore/Efter-bilder"
                        description="Lagg upp tydliga fore/efter-bilder som dokumenterar arbetet."
                      />
                      <FileUploadBox
                        title="Karta - Fore/Efter i SLD / Driftkarta"
                        description="Ladda upp kartor/SLD for nulage och efter utfort arbete."
                      />
                      <FileUploadBox
                        title="Driftschema"
                        description="Bifoga driftschema enligt beredningen."
                      />
                      <FileUploadBox
                        title="Fore/Efter-karta (enligt beredningen)"
                        description="Bifoga kartor som visar forandringar."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status / Arbetsflode - only for admin roles */}
              {isAdmin && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-foreground">
                      Status / Arbetsflode
                    </h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Endast synligt for driftledare/admin
                    </p>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label>Status</Label>
                        <Select value={statusOverride} onValueChange={setStatusOverride}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="submitted">Inskickad</SelectItem>
                            <SelectItem value="review">Granskning</SelectItem>
                            <SelectItem value="planned">Planerad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="syncEvent"
                            checked={syncToEventList}
                            onCheckedChange={(c) => setSyncToEventList(c === true)}
                          />
                          <Label htmlFor="syncEvent" className="text-sm font-normal">
                            Synka till handelselistan
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="calInvite"
                            checked={sendCalendarInvite}
                            onCheckedChange={(c) => setSendCalendarInvite(c === true)}
                          />
                          <Label htmlFor="calInvite" className="text-sm font-normal">
                            Skicka kalenderinbjudan
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <div>
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Foregaende
            </Button>
          ) : (
            <Button variant="outline" onClick={() => router.push("/inbox")}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Foregaende
            </Button>
          )}
        </div>
        <div>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>
              Nasta
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Skicka arbetsbegaran
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function FileUploadBox({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-6">
        <Button variant="outline" size="sm">
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          Valj filer
        </Button>
      </div>
    </div>
  )
}
