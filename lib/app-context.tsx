"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Role, WorkRequest } from "./types"
import { MOCK_REQUESTS } from "./mock-data"

interface AppContextType {
  currentRole: Role
  setCurrentRole: (role: Role) => void
  requests: WorkRequest[]
  setRequests: (requests: WorkRequest[]) => void
  selectedRequestId: string | null
  setSelectedRequestId: (id: string | null) => void
  getRequest: (id: string) => WorkRequest | undefined
  updateRequest: (id: string, updates: Partial<WorkRequest>) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>("controlroom")
  const [requests, setRequests] = useState<WorkRequest[]>(MOCK_REQUESTS)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  const getRequest = useCallback(
    (id: string) => requests.find((r) => r.id === id),
    [requests]
  )

  const updateRequest = useCallback(
    (id: string, updates: Partial<WorkRequest>) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      )
    },
    []
  )

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        requests,
        setRequests,
        selectedRequestId,
        setSelectedRequestId,
        getRequest,
        updateRequest,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
