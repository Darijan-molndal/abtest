"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/lib/app-context"
import { FACILITIES } from "@/lib/mock-data"
import type { WorkRequest } from "@/lib/types"

interface UploadedFile {
  name: string
  size: string
  type: string
}

export function CreateDriftorderForm() {
  const router = useRouter()
  const { setRequests, requests } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [driftorderName, setDriftorderName] = useState("")
  const [createdBy, setCreatedBy] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const newId = `ARB-${1000 + requests.length + 1}`

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles: UploadedFile[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // Acceptera Word-filer (.doc, .docx)
        if (
          file.type === "application/msword" ||
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.name.endsWith(".doc") ||
          file.name.endsWith(".docx")
        ) {
          newFiles.push({
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
          })
        }
      }
      setUploadedFiles([...uploadedFiles, ...newFiles])
    }
    // Återställ input för att kunna ladda upp samma fil igen
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!driftorderName.trim()) {
      return
    }

    const facility = FACILITIES[0] || "HSP 10 kV"
    const newReq: WorkRequest = {
      id: newId,
      title: driftorderName,
      description: `Driftorder skapad av ${createdBy || "Okänd"}`,
      facility,
      object: "",
      requestedStart: new Date().toISOString().split("T")[0],
      duration: "",
      riskImpact: "",
      status: "planned",
      phase: "driftorder",
      priority: "medium",
      createdBy: createdBy || "Demo-användare",
      createdByRole: "applicant",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requisites: [],
      activityLog: [
        {
          id: "a1",
          timestamp: new Date().toISOString(),
          actor: createdBy || "Demo-användare",
          role: "applicant",
          action: "Skapade driftorder",
        },
      ],
      attachments: uploadedFiles.map((file, i) => ({
        id: `att${i + 1}`,
        name: file.name,
        type: "word",
        size: file.size,
        uploadedBy: createdBy || "Demo-användare",
        uploadedAt: new Date().toISOString(),
        version: 1,
      })),
      documents: [],
      approvers: [],
    }

    setRequests([newReq, ...requests])
    router.push("/")
  }

  const isValid = driftorderName.trim().length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Tillbaka</span>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Skapa Driftorder
            </h1>
            <p className="text-sm text-muted-foreground">
              Fyll i uppgifterna för den nya driftordern
            </p>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Driftorderuppgifter</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Driftordernamn */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="driftorderName">
                  Driftordernamn <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="driftorderName"
                  placeholder="Ange namn på driftordern"
                  value={driftorderName}
                  onChange={(e) => setDriftorderName(e.target.value)}
                />
              </div>

              {/* Skapad av */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="createdBy">Skapad av</Label>
                <Input
                  id="createdBy"
                  placeholder="Ange vem som skapar driftordern"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                />
              </div>

              {/* Filuppladdning */}
              <div className="flex flex-col gap-2">
                <Label>Bifoga Word-fil</Label>
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Klicka för att ladda upp
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Endast Word-filer (.doc, .docx)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Uppladdade filer */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-border bg-card p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {file.size}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Ta bort fil</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Avbryt
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid}>
              Skapa Driftorder
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
