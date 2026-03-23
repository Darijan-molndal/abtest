export type Role = "applicant" | "shiftlead1" | "shiftlead2" | "controlroom"

export type Status =
  | "draft"
  | "submitted"
  | "review"
  | "needs_more_info"
  | "approved"
  | "rejected"
  | "planned"
  | "ready"
  | "completed"

export const STATUS_LABELS: Record<Status, string> = {
  draft: "Utkast",
  submitted: "Inskickad",
  review: "Granskning",
  needs_more_info: "Komplettering",
  approved: "Godkand",
  rejected: "Avslagen",
  planned: "Planerad",
  ready: "REDO",
  completed: "Avslutad",
}

export const STATUS_COLORS: Record<Status, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800",
  review: "bg-amber-100 text-amber-800",
  needs_more_info: "bg-orange-100 text-orange-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  planned: "bg-sky-100 text-sky-800",
  ready: "bg-emerald-200 text-emerald-900",
  completed: "bg-muted text-muted-foreground",
}

export const ROLE_LABELS: Record<Role, string> = {
  applicant: "Ansokande",
  shiftlead1: "Driftledare 1",
  shiftlead2: "Driftledare 2",
  controlroom: "Kontrollrum",
}

export interface Requisite {
  id: string
  label: string
  fulfilled: boolean
  note?: string
}

export interface ActivityEntry {
  id: string
  timestamp: string
  actor: string
  role: Role
  action: string
  comment?: string
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: string
  uploadedBy: string
  uploadedAt: string
  version: number
}

export interface DocumentVersion {
  id: string
  name: string
  version: number
  generatedBy: string
  generatedAt: string
  format: "docx" | "pdf"
}

export interface WorkRequest {
  id: string
  title: string
  description: string
  facility: string
  object: string
  requestedStart: string
  duration: string
  riskImpact: string
  status: Status
  priority: "low" | "medium" | "high" | "critical"
  createdBy: string
  createdByRole: Role
  createdAt: string
  updatedAt: string
  assignedTo?: string
  requisites: Requisite[]
  activityLog: ActivityEntry[]
  attachments: Attachment[]
  documents: DocumentVersion[]
  approvers: { role: Role; name: string; approved?: boolean; date?: string }[]
}
