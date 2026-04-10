"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  CalendarDays,
  FileDown,
  Clock,
  MapPin,
  User,
  FileText,
  Upload,
  AlertTriangle,
  Shield,
  History,
  Eye,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { StatusChip } from "@/components/status-chip"
import { PriorityIndicator } from "@/components/priority-indicator"
import { RequestInfoModal } from "@/components/request-info-modal"
import { GateProgress } from "@/components/gate-progress"
import { useApp } from "@/lib/app-context"
import { ROLE_LABELS, type WorkRequest } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function RequestDetail({ requestId }: { requestId: string }) {
  const { getRequest, currentRole, updateRequest } = useApp()
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showWordPreview, setShowWordPreview] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null)
  const [showDriftorderKompletteringModal, setShowDriftorderKompletteringModal] = useState(false)
  const [driftorderKompletteringComment, setDriftorderKompletteringComment] = useState("")
  const request = getRequest(requestId)

  if (!request) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <FileText className="h-12 w-12" />
          <p>Arendet hittades inte</p>
          <Link href="/inbox">
            <Button variant="outline">Tillbaka till inkorg</Button>
          </Link>
        </div>
      </div>
    )
  }

  const fulfilled = request.requisites.filter((r) => r.fulfilled).length
  const total = request.requisites.length
  const allFulfilled = fulfilled === total
  const isReviewer =
    currentRole === "controlroom" ||
    currentRole === "shiftlead1" ||
    currentRole === "shiftlead2"

  const handleApprove = () => {
    updateRequest(requestId, {
      status: "approved",
      updatedAt: new Date().toISOString(),
      activityLog: [
        ...request.activityLog,
        {
          id: `a${request.activityLog.length + 1}`,
          timestamp: new Date().toISOString(),
          actor: "Demo-anvandare",
          role: currentRole,
          action: "Godkande arbetsbegaran",
        },
      ],
    })
  }

  const handleReject = () => {
    updateRequest(requestId, {
      status: "rejected",
      updatedAt: new Date().toISOString(),
      activityLog: [
        ...request.activityLog,
        {
          id: `a${request.activityLog.length + 1}`,
          timestamp: new Date().toISOString(),
          actor: "Demo-anvandare",
          role: currentRole,
          action: "Avslog arbetsbegaran",
        },
      ],
    })
  }

  const handleMarkPlanned = () => {
    updateRequest(requestId, {
      status: "planned",
      updatedAt: new Date().toISOString(),
      activityLog: [
        ...request.activityLog,
        {
          id: `a${request.activityLog.length + 1}`,
          timestamp: new Date().toISOString(),
          actor: "Demo-anvandare",
          role: currentRole,
          action: "Planerade arende",
        },
      ],
    })
  }

  const handleMarkReady = () => {
    updateRequest(requestId, {
      status: "ready",
      updatedAt: new Date().toISOString(),
      activityLog: [
        ...request.activityLog,
        {
          id: `a${request.activityLog.length + 1}`,
          timestamp: new Date().toISOString(),
          actor: "Demo-anvandare",
          role: currentRole,
          action: "Markerade som REDO",
        },
      ],
    })
  }

  const handleCancelDriftorder = () => {
    updateRequest(requestId, {
      status: "approved",
      updatedAt: new Date().toISOString(),
      activityLog: [
        ...request.activityLog,
        {
          id: `a${request.activityLog.length + 1}`,
          timestamp: new Date().toISOString(),
          actor: "Demo-anvandare",
          role: currentRole,
          action: "Avbröt driftorder - återgår till godkänd",
        },
      ],
    })
  }

  // Kolla om ärendet är en driftorder under utförande
  const isDriftorderUnderUtforande = request.status === "ready" && request.phase === "driftorder"

  // Kolla om ärendet är en driftorder (skriven eller godkänd)
  const isDriftorder = request.phase === "driftorder"
  
  // Kolla om ärendet är en skriven driftorder (för "Begär komplettering"-knappen)
  const isSkivenDriftorder = request.status === "planned" && request.phase === "driftorder"

  const handleDriftorderKomplettering = () => {
    if (!driftorderKompletteringComment.trim()) return
    
    updateRequest(requestId, {
      status: "needs_more_info",
      updatedAt: new Date().toISOString(),
      activityLog: [
        ...request.activityLog,
        {
          id: `a${request.activityLog.length + 1}`,
          timestamp: new Date().toISOString(),
          actor: "Demo-anvandare",
          role: currentRole,
          action: `Begärde komplettering av driftorder. Kommentar: ${driftorderKompletteringComment}`,
        },
        {
          id: `a${request.activityLog.length + 2}`,
          timestamp: new Date().toISOString(),
          actor: "System",
          role: "shiftlead1",
          action: `Notis: Komplettering begärd för driftorder ${request.id}. Meddelande: "${driftorderKompletteringComment}"`,
        },
      ],
    })
    setDriftorderKompletteringComment("")
    setShowDriftorderKompletteringModal(false)
  }
  
  // Hämta Word-filer från attachments
  const wordAttachments = request.attachments.filter(
    (att) => att.type === "word" || att.name.endsWith(".doc") || att.name.endsWith(".docx")
  )

  const handleOpenWordPreview = (attachmentName: string) => {
    setSelectedAttachment(attachmentName)
    setShowWordPreview(true)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Sticky top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/inbox">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Tillbaka</span>
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm font-mono text-muted-foreground">{request.id}</span>
          <h1 className="text-base font-semibold text-foreground truncate max-w-md">
            {request.title}
          </h1>
          <StatusChip status={request.status} />
          <PriorityIndicator priority={request.priority} />
        </div>

        {/* Action buttons */}
        {isReviewer && (
          <div className="flex items-center gap-2">
            {/* Avbryt driftorder-knapp för driftorder under utförande */}
            {isDriftorderUnderUtforande && (
              <Button 
                size="sm" 
                onClick={handleCancelDriftorder} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle className="mr-1.5 h-4 w-4" />
                Avbryt driftorder
              </Button>
            )}
            {/* Begär komplettering-knapp för skrivna driftorder */}
            {isSkivenDriftorder && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDriftorderKompletteringModal(true)}
              >
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Begär komplettering
              </Button>
            )}
            {(request.status === "review" || request.status === "submitted") && (
              <>
                <Button size="sm" onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Godkann
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowInfoModal(true)}
                >
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Begar komplettering
                </Button>
                <Button size="sm" variant="outline" onClick={handleReject} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Avsla
                </Button>
              </>
            )}
            {request.status === "approved" && (
              <Button size="sm" onClick={handleMarkPlanned}>
                <CalendarDays className="mr-1.5 h-4 w-4" />
                Boka tid
              </Button>
            )}
            {request.status === "planned" && allFulfilled && (
              <Button size="sm" onClick={handleMarkReady} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Shield className="mr-1.5 h-4 w-4" />
                Markera REDO
              </Button>
            )}
            <Button size="sm" variant="outline">
              <Upload className="mr-1.5 h-4 w-4" />
              Ladda upp dokument
            </Button>
          </div>
        )}
      </div>

      {/* Gate progress */}
      <GateProgress status={request.status} />

      {/* Body: main content + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content with tabs */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Oversikt</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="attachments">
                Bilagor
                {request.attachments.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 justify-center rounded-full px-1.5 text-xs">
                    {request.attachments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity">Logg</TabsTrigger>
            </TabsList>

            {/* Overview tab */}
            <TabsContent value="overview">
              <div className="flex flex-col gap-6">
                {/* Description */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Beskrivning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed">{request.description}</p>
                  </CardContent>
                </Card>

                {/* Bifogad Word-fil (endast för driftorder med bilagor) */}
                {isDriftorder && wordAttachments.length > 0 && (
                  <Card className="border-2 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Bifogad driftorderfil
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-3">
                        {wordAttachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{att.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {att.size} - Uppladdad av {att.uploadedBy}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenWordPreview(att.name)}
                              >
                                <Eye className="mr-1.5 h-4 w-4" />
                                Visa
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="mr-1.5 h-4 w-4" />
                                Ladda ner
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Requisites panel */}
                <Card className={cn(
                  "border-2",
                  allFulfilled ? "border-emerald-200" : "border-amber-200"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        {allFulfilled ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        )}
                        Rekvisit
                      </CardTitle>
                      <span className="text-xs font-medium text-muted-foreground">
                        {fulfilled} av {total} uppfyllda
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          allFulfilled ? "bg-emerald-500" : "bg-amber-500"
                        )}
                        style={{ width: `${total > 0 ? (fulfilled / total) * 100 : 0}%` }}
                      />
                    </div>
                    <ul className="flex flex-col gap-3">
                      {request.requisites.map((req) => (
                        <li key={req.id} className="flex items-start gap-3">
                          <span
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs",
                              req.fulfilled
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            )}
                          >
                            {req.fulfilled ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                          </span>
                          <div className="flex flex-col">
                            <span
                              className={cn(
                                "text-sm",
                                req.fulfilled
                                  ? "text-muted-foreground"
                                  : "font-medium text-foreground"
                              )}
                            >
                              {req.label}
                            </span>
                            {req.note && (
                              <span className="text-xs text-orange-600">{req.note}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Key details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Detaljer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoCell icon={MapPin} label="Anlaggning" value={request.facility} />
                      <InfoCell icon={FileText} label="Objekt" value={request.object} />
                      <InfoCell icon={CalendarDays} label="Onskat start" value={request.requestedStart} />
                      <InfoCell icon={Clock} label="Varaktighet" value={request.duration} />
                    </div>
                    <Separator className="my-4" />
                    <div>
                      <span className="text-xs font-medium uppercase text-muted-foreground">Risk / Konsekvens</span>
                      <p className="mt-1 text-sm text-foreground leading-relaxed">{request.riskImpact}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Metadata tab */}
            <TabsContent value="metadata">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Metadata (fran Word-mall)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col gap-1 rounded-md border border-border p-3">
                      <span className="text-xs text-muted-foreground">ID</span>
                      <span className="font-mono font-medium text-foreground">{request.id}</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-md border border-border p-3">
                      <span className="text-xs text-muted-foreground">Titel</span>
                      <span className="font-medium text-foreground">{request.title}</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-md border border-border p-3">
                      <span className="text-xs text-muted-foreground">Anlaggning</span>
                      <span className="font-medium text-foreground">{request.facility}</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-md border border-border p-3">
                      <span className="text-xs text-muted-foreground">Objekt</span>
                      <span className="font-medium text-foreground">{request.object}</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-md border border-border p-3">
                      <span className="text-xs text-muted-foreground">Onskat startdatum</span>
                      <span className="font-medium text-foreground">{request.requestedStart}</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-md border border-border p-3">
                      <span className="text-xs text-muted-foreground">Varaktighet</span>
                      <span className="font-medium text-foreground">{request.duration}</span>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1 rounded-md border border-border p-3">
                      <span className="text-xs text-muted-foreground">Beskrivning</span>
                      <span className="text-foreground">{request.description}</span>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1 rounded-md border border-border p-3">
                      <span className="text-xs text-muted-foreground">Risk / Konsekvens</span>
                      <span className="text-foreground">{request.riskImpact}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attachments tab */}
            <TabsContent value="attachments">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold">Bilagor</CardTitle>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-1.5 h-4 w-4" />
                    Ladda upp
                  </Button>
                </CardHeader>
                <CardContent>
                  {request.attachments.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {request.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-accent transition-colors"
                        >
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div className="flex flex-1 flex-col">
                            <span className="text-sm font-medium text-foreground">{att.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {att.size} - Uppladdad av {att.uploadedBy} ({new Date(att.uploadedAt).toLocaleDateString("sv-SE")})
                            </span>
                          </div>
                          <Badge variant="secondary">v{att.version}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">Inga bilagor uppladdade</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity log tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Aktivitetslogg
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative ml-3 border-l-2 border-border pl-6">
                    {request.activityLog.map((entry, i) => (
                      <div key={entry.id} className={cn("relative pb-6", i === request.activityLog.length - 1 && "pb-0")}>
                        {/* Dot */}
                        <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 border-border bg-card" />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground">{entry.actor}</span>
                            <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                              {ROLE_LABELS[entry.role]}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{entry.action}</p>
                          {entry.comment && (
                            <div className="mt-1 rounded-md border border-border bg-muted/50 p-2.5">
                              <p className="text-xs text-foreground italic">&ldquo;{entry.comment}&rdquo;</p>
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString("sv-SE")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar */}
        <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-l border-border p-5 lg:block">
          {/* Actors */}
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ansvar & aktorer
            </h3>
            <div className="flex flex-col gap-3">
              <ActorRow label="Ansokande" name={request.createdBy} />
              {request.approvers.map((a) => (
                <ActorRow
                  key={a.role}
                  label={ROLE_LABELS[a.role]}
                  name={a.name}
                  approved={a.approved}
                  date={a.date}
                />
              ))}
              {request.assignedTo && (
                <ActorRow label="Tilldelad" name={request.assignedTo} />
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Documents */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dokument
            </h3>
            {request.documents.length > 0 ? (
              <div className="flex flex-col gap-2">
                {request.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 rounded-md border border-border p-2.5"
                  >
                    <FileDown className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-1 flex-col">
                      <span className="text-xs font-medium text-foreground">{doc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        v{doc.version} - {doc.format.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="mt-1">
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Ladda upp ny version
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Inga dokument uppladdade</p>
            )}
          </div>
        </aside>
      </div>

      {/* Request info modal */}
      <RequestInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        request={request}
        onSubmit={(comment, missing) => {
          updateRequest(requestId, {
            status: "needs_more_info",
            updatedAt: new Date().toISOString(),
            activityLog: [
              ...request.activityLog,
              {
                id: `a${request.activityLog.length + 1}`,
                timestamp: new Date().toISOString(),
                actor: "Demo-anvandare",
                role: currentRole,
                action: "Begarde komplettering",
                comment,
              },
            ],
          })
          setShowInfoModal(false)
        }}
      />

      {/* Word-fil förhandsvisning modal */}
      <Dialog open={showWordPreview} onOpenChange={setShowWordPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {selectedAttachment}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="rounded-lg border border-border bg-muted/30 p-8">
              <div className="mx-auto max-w-2xl bg-white shadow-lg rounded-lg p-8 min-h-[400px]">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h1 className="text-xl font-bold text-gray-900">{request.title}</h1>
                  <p className="text-sm text-gray-500 mt-1">Driftorder {request.id}</p>
                </div>
                
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h2 className="font-semibold text-gray-900 mb-1">Beskrivning</h2>
                    <p>{request.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Anläggning</h3>
                      <p>{request.facility}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Objekt</h3>
                      <p>{request.object || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Startdatum</h3>
                      <p>{request.requestedStart}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Varaktighet</h3>
                      <p>{request.duration || "-"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Skapad av</h3>
                    <p>{request.createdBy}</p>
                  </div>
                  
                  {request.riskImpact && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Risk / Konsekvens</h3>
                      <p>{request.riskImpact}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400 text-center">
                    Detta är en förhandsvisning av driftorderns innehåll
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowWordPreview(false)}>
              Stäng
            </Button>
            <Button>
              <Download className="mr-1.5 h-4 w-4" />
              Ladda ner original
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Driftorder komplettering modal */}
      <Dialog open={showDriftorderKompletteringModal} onOpenChange={setShowDriftorderKompletteringModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Begär komplettering av driftorder
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Ange vad som behöver kompletteras för driftorder {request.id}. 
            Driftledare 1 ({request.createdBy}) kommer att notifieras.
          </p>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="driftorder-comment" className="text-sm font-medium">
              Kommentar <span className="text-destructive">*</span>
            </label>
            <textarea
              id="driftorder-comment"
              placeholder="Beskriv vad som behöver kompletteras..."
              value={driftorderKompletteringComment}
              onChange={(e) => setDriftorderKompletteringComment(e.target.value)}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDriftorderKompletteringModal(false)}>
              Avbryt
            </Button>
            <Button 
              onClick={handleDriftorderKomplettering} 
              disabled={!driftorderKompletteringComment.trim()}
            >
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Skicka begäran
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
    </div>
  )
}

function ActorRow({
  label,
  name,
  approved,
  date,
}: {
  label: string
  name: string
  approved?: boolean
  date?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-foreground">{name}</span>
      </div>
      {approved !== undefined && (
        <span
          className={cn(
            "text-xs",
            approved ? "text-emerald-600" : "text-muted-foreground"
          )}
        >
          {approved ? "Godkand" : "Vantar"}
        </span>
      )}
    </div>
  )
}
