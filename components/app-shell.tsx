"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Inbox,
  FileText,
  CalendarDays,
  Settings,
  ChevronDown,
  Bell,
  Search,
  Menu,
  X,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/app-context"
import { ROLE_LABELS, type Role } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inkorg", icon: Inbox, badge: 3 },
  { href: "/requests", label: "Alla arenden", icon: FileText },
  // { href: "/calendar", label: "Planering", icon: CalendarDays },
  // { href: "/settings", label: "Installningar", icon: Settings },
]

const ROLE_COLORS: Record<Role, string> = {
  applicant: "bg-blue-100 text-blue-800 border-blue-200",
  shiftlead1: "bg-amber-100 text-amber-800 border-amber-200",
  shiftlead2: "bg-emerald-100 text-emerald-800 border-emerald-200",
  controlroom: "bg-sky-100 text-sky-800 border-sky-200",
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { currentRole, setCurrentRole } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-card transition-all duration-200",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        {/* Logo area */}
        <div className="flex h-14 items-center gap-3 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground">
            <FileText className="h-4 w-4 text-background" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none text-foreground">Arbetsorder</span>
            <span className="text-xs text-muted-foreground">SKISS v0.1</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="h-5 min-w-5 justify-center rounded-full px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Role switcher */}
        <div className="border-t border-border p-3">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Aktiv roll (skiss)
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-1 flex-col items-start">
                  <span className={cn("rounded-sm border px-1.5 py-0.5 text-xs font-medium", ROLE_COLORS[currentRole])}>
                    {ROLE_LABELS[currentRole]}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>Byt roll (for demo)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  className={cn(currentRole === role && "bg-accent")}
                >
                  <span className={cn("mr-2 rounded-sm border px-1.5 py-0.5 text-xs font-medium", ROLE_COLORS[role])}>
                    {ROLE_LABELS[role]}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="sr-only">Visa/dolj meny</span>
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Search */}
          <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Sok arende, ID, anlaggning..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-card" />
            <span className="sr-only">Notiser</span>
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
