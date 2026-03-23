"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Send } from "lucide-react"
import type { WorkRequest } from "@/lib/types"

interface RequestInfoModalProps {
  open: boolean
  onClose: () => void
  request: WorkRequest
  onSubmit: (comment: string, missingRequisites: string[]) => void
}

export function RequestInfoModal({
  open,
  onClose,
  request,
  onSubmit,
}: RequestInfoModalProps) {
  const [comment, setComment] = useState("")
  const unfulfilledReqs = request.requisites.filter((r) => !r.fulfilled)
  const [selectedMissing, setSelectedMissing] = useState<string[]>(
    unfulfilledReqs.map((r) => r.id)
  )

  const toggleMissing = (id: string) => {
    setSelectedMissing((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    if (!comment.trim()) return
    onSubmit(comment, selectedMissing)
    setComment("")
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Begar komplettering
          </DialogTitle>
          <DialogDescription>
            Ange vad som saknas for {request.id}. Ansokande notifieras automatiskt.
          </DialogDescription>
        </DialogHeader>

        {/* Auto-filled missing requisites */}
        {unfulfilledReqs.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Saknade rekvisit (auto-ifyllda)</Label>
            <div className="rounded-md border border-border p-3 flex flex-col gap-2">
              {unfulfilledReqs.map((req) => (
                <div key={req.id} className="flex items-center gap-2">
                  <Checkbox
                    id={req.id}
                    checked={selectedMissing.includes(req.id)}
                    onCheckedChange={() => toggleMissing(req.id)}
                  />
                  <Label htmlFor={req.id} className="text-sm cursor-pointer">
                    {req.label}
                    {req.note && (
                      <span className="ml-1 text-xs text-muted-foreground">({req.note})</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comment */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="comment" className="text-sm font-medium">
            Kommentar (obligatorisk)
          </Label>
          <Textarea
            id="comment"
            placeholder="Beskriv vad som behover kompletteras..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={!comment.trim()}>
            <Send className="mr-1.5 h-4 w-4" />
            Skicka begaran
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
