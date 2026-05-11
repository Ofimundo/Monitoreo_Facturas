// components/header.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Menu, 
  X, 
  Command, 
  BarChart3, 
  Calendar,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Bell,
  FileText,
} from "lucide-react"
import { CommandCenter } from "@/components/command-center"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function Header() {
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/facturas", label: "Facturas", icon: FileText },
    { href: "/reportes", label: "Reportes", icon: BarChart3 },
    { href: "/programacion", label: "Programación", icon: Calendar },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo y nombre */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-lg hidden sm:inline-block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Monitoreo Servicios
              </span>
            </Link>
            
            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "gap-2 transition-all",
                        isActive && "bg-primary text-primary-foreground shadow-md"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
              
              {/* Botón Centro de Comandos - Solo en el menú, no en la página */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2 ml-2 border-primary/50 hover:bg-primary/10 transition-all"
                onClick={() => setIsCommandOpen(true)}
              >
                <Command className="h-4 w-4 text-primary" />
                Centro de Comandos
              </Button>
            </nav>
          </div>

          {/* Acciones derecha */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Menú</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-2",
                            isActive && "bg-primary text-primary-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    )
                  })}
                  
                  {/* Botón Centro de Comandos en mobile */}
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 mt-2 border-primary/50"
                    onClick={() => setIsCommandOpen(true)}
                  >
                    <Command className="h-4 w-4 text-primary" />
                    Centro de Comandos
                  </Button>

                  <div className="border-t my-4" />
                  
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Bell className="h-4 w-4" />
                    Notificaciones
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Ayuda
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Command Center Modal - Solo se abre desde el botón del header */}
      <CommandCenter open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </>
  )
}