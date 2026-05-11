"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { EventsTimeline } from "@/components/events-timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CommandCenter } from "@/components/command-center"
import { services, type Service } from "@/lib/services-data"
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  FileText,
  Zap,
  Clock,
  Send,
  RefreshCw,
  Bell,
  Settings,
  HelpCircle,
  LayoutDashboard,
  BarChart3,
  Calendar,
  Command,
  Sun,
  Moon,
  Loader2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Componente de gráfico de líneas simple
const LineChart = ({ data, labels }: { data: number[]; labels: string[] }) => {
  const maxValue = Math.max(...data, 100)
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - (value / maxValue) * 80,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="relative h-48 w-full">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {[0, 25, 50, 75, 100].map((level) => (
          <line
            key={level}
            x1="0"
            y1={`${100 - level}%`}
            x2="100%"
            y2={`${100 - level}%`}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-muted/20"
            strokeDasharray="4"
          />
        ))}
        
        <polygon
          points={`${points.map(p => `${p.x},${p.y}`).join(' ')} ${points[points.length-1].x},100 0,100`}
          fill="currentColor"
          className="text-primary/10"
        />
        
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />
        
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="currentColor"
            className="text-primary"
          />
        ))}
      </svg>
      
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-muted-foreground">
        {labels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
    </div>
  )
}

// Componente de anillo de progreso
const ProgressRing = ({ value, label, color }: { value: number; label: string; color: string }) => {
  const radius = 40
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width="100" height="100" className="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={color}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-foreground">{value}%</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{label}</p>
    </div>
  )
}

// Métrica principal
const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = "primary" }: { 
  title: string
  value: string | number
  subtitle?: string
  icon: any
  trend?: { value: string; positive: boolean }
  color?: string
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn("p-2 rounded-lg", `bg-${color}/10`)}>
          <Icon className={cn("h-5 w-5", `text-${color}`)} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {trend.positive ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={cn("text-xs", trend.positive ? "text-green-500" : "text-red-500")}>
            {trend.value}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
)

// Componente de hora actual
const CurrentTime = () => {
  const [time, setTime] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(new Date().toLocaleTimeString('es-CL'))
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString('es-CL')), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null
  return <span>{time}</span>
}

// Componente de fecha actual
const CurrentDate = () => {
  const [date, setDate] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDate(new Date().toLocaleDateString('es-CL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
  }, [])

  if (!mounted) return null
  return <span className="capitalize">{date}</span>
}

// Modal de Notificaciones
const NotificationsModal = ({ open, onOpenChange, notifications, onMarkAsRead, onMarkAllAsRead, onDelete, onDeleteRead }: any) => {
  const unreadCount = notifications.filter((n: any) => !n.read).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} nuevas
                </Badge>
              )}
            </DialogTitle>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="h-7 text-xs">
                  Marcar todas
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onDeleteRead} className="h-7 text-xs text-red-500">
                Limpiar leídas
              </Button>
            </div>
          </div>
          <DialogDescription>
            Tus notificaciones recientes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay notificaciones</p>
              <p className="text-xs">Las nuevas notificaciones aparecerán aquí</p>
            </div>
          ) : (
            notifications.map((notif: any) => (
              <div 
                key={notif.id} 
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  !notif.read 
                    ? "bg-primary/5 border-primary/20 shadow-sm" 
                    : "bg-muted/30 border-border opacity-75"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-medium", !notif.read && "text-primary")}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{notif.time}</p>
                  </div>
                  <div className="flex gap-1">
                    {!notif.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs"
                        onClick={() => onMarkAsRead(notif.id)}
                      >
                        Leer
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-red-500"
                      onClick={() => onDelete(notif.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Modal de Configuración
const SettingsModal = ({ open, onOpenChange, notificationsEnabled, setNotificationsEnabled, theme, setTheme }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración
        </DialogTitle>
        <DialogDescription>
          Personaliza tu experiencia
        </DialogDescription>
      </DialogHeader>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tema</Label>
              <p className="text-xs text-muted-foreground">Cambiar apariencia de la aplicación</p>
            </div>
            <div className="flex gap-2">
              <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4 mr-1" />
                Claro
              </Button>
              <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4 mr-1" />
                Oscuro
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-0.5">
              <Label>Idioma</Label>
              <p className="text-xs text-muted-foreground">Seleccionar idioma</p>
            </div>
            <select className="rounded-md border border-input bg-background px-3 py-1 text-sm">
              <option>Español</option>
              <option>English</option>
            </select>
          </div>
        </TabsContent>
        
        <TabsContent value="notificaciones" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones push</Label>
              <p className="text-xs text-muted-foreground">Recibir alertas en tiempo real</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-0.5">
              <Label>Sonido de notificaciones</Label>
              <p className="text-xs text-muted-foreground">Reproducir sonido al recibir alertas</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-0.5">
              <Label>Notificaciones por email</Label>
              <p className="text-xs text-muted-foreground">Recibir reportes por correo</p>
            </div>
            <Switch />
          </div>
        </TabsContent>
        
        <TabsContent value="seguridad" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Autenticación de dos factores</Label>
              <p className="text-xs text-muted-foreground">Añadir capa extra de seguridad</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-0.5">
              <Label>Alertas de seguridad</Label>
              <p className="text-xs text-muted-foreground">Notificar sobre accesos sospechosos</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button variant="outline" className="w-full mt-4">
            Cambiar contraseña
          </Button>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
)

// Modal de Ayuda
const HelpModal = ({ open, onOpenChange }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Centro de Ayuda
        </DialogTitle>
        <DialogDescription>
          ¿En qué podemos ayudarte?
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm font-medium">📚 Guía rápida</p>
          <p className="text-xs text-muted-foreground mt-1">Consulta nuestra documentación para empezar</p>
          <Button variant="link" className="p-0 h-auto mt-2 text-xs">Ver documentación →</Button>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm font-medium">💬 Soporte técnico</p>
          <p className="text-xs text-muted-foreground mt-1">Contacta con nuestro equipo de soporte</p>
          <Button variant="link" className="p-0 h-auto mt-2 text-xs">Enviar ticket →</Button>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm font-medium">📞 Contacto</p>
          <p className="text-xs text-muted-foreground mt-1">soporte@facturas.cl | +56 2 1234 5678</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)

export default function HomePage() {
  const router = useRouter()
  const pathname = usePathname()
  const service = services.find((s) => s.id === "1")
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  
  // Modales
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  
  // Configuración
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  
  // Notificaciones - Datos iniciales
  const [notifications, setNotifications] = useState([
    { id: "1", title: "Factura procesada", message: "La factura F-2026-001 fue aceptada correctamente", time: "Hace 5 min", read: false },
    { id: "2", title: "Rechazo detectado", message: "Factura F-2026-003 rechazada por formato incorrecto", time: "Hace 15 min", read: false },
    { id: "3", title: "Sincronización completa", message: "Datos actualizados con el SII", time: "Hace 1 hora", read: true },
  ])

  // Cargar notificaciones guardadas al iniciar
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications")
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications)
        setNotifications(parsed)
      } catch (e) {
        console.error("Error loading notifications", e)
      }
    }
  }, [])

  // Guardar notificaciones cuando cambien
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("notifications", JSON.stringify(notifications))
    }
  }, [notifications, mounted])

  // Datos dinámicos
  const [facturasProcesadas, setFacturasProcesadas] = useState(12456)
  const [facturasRechazadas, setFacturasRechazadas] = useState(1557)
  const [tasaExito, setTasaExito] = useState(87.5)
  const [weeklyData, setWeeklyData] = useState([145, 234, 189, 278, 356, 298, 312])

  const weeklyLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const hourlyData = [32, 45, 67, 89, 123, 156, 189, 234, 278, 312, 298, 267]
  const hourlyLabels = ['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/facturas", label: "Facturas", icon: FileText },
    { href: "/reportes", label: "Reportes", icon: BarChart3 },
    { href: "/programacion", label: "Programación", icon: Calendar },
  ]

  // Función para seleccionar servicio en la línea de tiempo
  const handleSelectService = (service: Service) => {
    router.push(`/servicio/${service.id}`)
  }

  // Mostrar mensaje temporal
  const showMessage = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Agregar notificación
  const addNotification = (title: string, message: string) => {
    if (notificationsEnabled) {
      const newNotification = { 
        id: Date.now().toString(), 
        title, 
        message, 
        time: "Ahora", 
        read: false 
      }
      setNotifications(prev => [newNotification, ...prev])
    }
  }

  // Marcar notificación como leída
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id 
        ? { ...notification, read: true }
        : notification
    ))
  }

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ 
      ...notification, 
      read: true 
    })))
    showMessage("Todas las notificaciones marcadas como leídas")
  }

  // Eliminar notificación
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  // Eliminar todas las notificaciones leídas
  const deleteReadNotifications = () => {
    setNotifications(prev => prev.filter(notification => !notification.read))
    showMessage("Notificaciones leídas eliminadas")
  }

  // Sincronizar datos
  const handleSync = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const nuevasFacturas = Math.floor(Math.random() * 100) + 50
    const nuevasRechazadas = Math.floor(Math.random() * 20)
    
    const newTotal = facturasProcesadas + nuevasFacturas
    const newRejected = facturasRechazadas + nuevasRechazadas
    const newTasaExito = ((newTotal - newRejected) / newTotal) * 100
    
    setFacturasProcesadas(newTotal)
    setFacturasRechazadas(newRejected)
    setTasaExito(parseFloat(newTasaExito.toFixed(1)))
    
    const lastValue = weeklyData[weeklyData.length - 1]
    setWeeklyData([...weeklyData.slice(1), lastValue + Math.floor(Math.random() * 50)])
    
    setIsLoading(false)
    addNotification("Sincronización completada", `Se procesaron ${nuevasFacturas} nuevas facturas`)
    showMessage("✅ Sincronización completada exitosamente")
  }

  // Reintentar rechazados
  const handleRetryRejected = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const retriedCount = facturasRechazadas
    const newTasaExito = 100
    
    setFacturasRechazadas(0)
    setTasaExito(newTasaExito)
    
    setIsLoading(false)
    addNotification("Reintento masivo", `Se reintentaron ${retriedCount} facturas rechazadas`)
    showMessage(`✅ Se reintentaron ${retriedCount} facturas rechazadas`)
  }

  // Cambiar tema
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!service) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Servicio no encontrado</div>
        </main>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-4" />
            <div className="h-4 w-64 bg-muted rounded mb-8" />
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded" />)}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900`}>
      {/* Header con navegación completa */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-lg hidden sm:inline-block">Monitoreo Servicios</span>
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
              
              {/* Botón Centro de Comandos */}
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
            <Button variant="ghost" size="icon" className="relative" onClick={() => setNotificationsOpen(true)}>
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setHelpOpen(true)}>
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Command Center Modal */}
      <CommandCenter open={isCommandOpen} onOpenChange={setIsCommandOpen} />
      
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4 inline mr-2" />
            {successMessage}
          </div>
        )}

        {/* Header del Dashboard */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel de Facturación</h1>
              <p className="text-sm text-muted-foreground">
                {service.name} · <CurrentDate />
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="gap-2" onClick={handleSync} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Sincronizar
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={handleRetryRejected} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Reintentar Rechazados
              </Button>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <MetricCard
            title="Facturas Procesadas"
            value={facturasProcesadas.toLocaleString()}
            subtitle="Este mes"
            icon={FileText}
            trend={{ value: "+12.3%", positive: true }}
            color="blue"
          />
          <MetricCard
            title="Tasa de Éxito"
            value={`${tasaExito}%`}
            subtitle="Aprobación"
            icon={CheckCircle}
            trend={{ value: "+2.4%", positive: true }}
            color="green"
          />
          <MetricCard
            title="Facturas Rechazadas"
            value={facturasRechazadas.toLocaleString()}
            subtitle={`${(100 - tasaExito).toFixed(1)}% del total`}
            icon={XCircle}
            trend={{ value: "-5.1%", positive: true }}
            color="red"
          />
          <MetricCard
            title="Tiempo Promedio"
            value="1.2s"
            subtitle="Por factura"
            icon={Clock}
            trend={{ value: "-0.3s", positive: true }}
            color="purple"
          />
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Tendencia Semanal
                </span>
                <Badge variant="outline" className="text-[10px]">Facturas procesadas</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={weeklyData} labels={weeklyLabels} />
              <div className="flex justify-between mt-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Promedio diario</span>
                  <p className="text-lg font-bold">259</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Pico máximo</span>
                  <p className="text-lg font-bold text-green-600">356</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Proyección</span>
                  <p className="text-lg font-bold text-primary">~7,770</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Distribución por Hora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={hourlyData} labels={hourlyLabels} />
              <div className="flex justify-between mt-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Horario pico</span>
                  <p className="text-sm font-bold">17:00 - 312</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Horario valle</span>
                  <p className="text-sm font-bold">08:00 - 32</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado del servicio y acciones */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Estado del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado actual</span>
                <Badge className="bg-green-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-white mr-1 animate-pulse" />
                  Operativo
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="font-semibold">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Última factura</span>
                <span className="font-semibold">Hace 2 min</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full mt-2">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "99.9%" }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Calidad de Procesamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <ProgressRing value={tasaExito} label="Tasa de éxito" color="text-green-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Procesamiento</span>
                  <span>1.2k/min</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: "24%" }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Máx: 5k/min</p>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Calidad de datos</span>
                  <span>98.5%</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "98.5%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Línea de tiempo */}
        <div className="mb-6">
          <EventsTimeline onSelectService={handleSelectService} />
        </div>
      </main>

      {/* Modales */}
      <NotificationsModal 
        open={notificationsOpen} 
        onOpenChange={setNotificationsOpen} 
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
        onDeleteRead={deleteReadNotifications}
      />
      
      <SettingsModal 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        theme={theme}
        setTheme={setTheme}
      />
      
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />

      {/* Footer */}
      <footer className="border-t py-4 bg-background/50">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© 2026 - Aceptación y rechazo de facturas</p>
          <p className="mt-1">Última actualización: <CurrentTime /></p>
        </div>
      </footer>
    </div>
  )
}