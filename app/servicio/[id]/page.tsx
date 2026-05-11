"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Header } from "@/components/header"
import { StatusIndicator } from "@/components/status-indicator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { services, type Client } from "@/lib/services-data"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Clock,
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  RefreshCw,
  Send,
  Bell,
  Settings,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileX,
  Percent,
  Activity,
  Zap,
  Shield,
  Calendar,
  Download,
  Filter,
} from "lucide-react"

// Componente para gráfico de barras simple
const SimpleBarChart = ({ data, maxValue }: { data: number[]; maxValue: number }) => (
  <div className="flex items-end gap-2 h-32">
    {data.map((value, index) => (
      <div key={index} className="flex-1 flex flex-col items-center gap-1">
        <div
          className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-lg transition-all duration-500 hover:from-primary hover:to-primary/90"
          style={{ height: `${(value / maxValue) * 100}%` }}
        />
        <span className="text-xs text-muted-foreground">{['L', 'M', 'M', 'J', 'V', 'S', 'D'][index]}</span>
      </div>
    ))}
  </div>
)

// Componente para el anillo de progreso
const ProgressRing = ({ value, size = 120, strokeWidth = 12 }: { value: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{value}%</span>
      </div>
    </div>
  )
}

// Componente de métrica con tendencia
const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue 
}: { 
  title: string
  value: string | number
  subtitle?: string
  icon: any
  trend?: 'up' | 'down'
  trendValue?: string
}) => (
  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={cn("text-xs font-medium", trend === 'up' ? "text-green-500" : "text-red-500")}>
            {trendValue}
          </span>
          <span className="text-xs text-muted-foreground">vs mes anterior</span>
        </div>
      )}
    </CardContent>
  </Card>
)

// Componente de factura rechazada
const RejectedInvoiceCard = ({ invoice, onAction }: { invoice: any; onAction: (action: string, id: string) => void }) => (
  <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 transition-all cursor-pointer group">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
          <FileX className="h-4 w-4 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-sm text-foreground">{invoice.number}</p>
          <p className="text-xs text-muted-foreground">{invoice.client}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="text-xs">
          {invoice.reason}
        </Badge>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onAction('resend', invoice.id)}>
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onAction('view', invoice.id)}>
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
    <div className="mt-2 flex items-center justify-between text-xs">
      <span className="text-muted-foreground">Monto: ${invoice.amount}</span>
      <span className="text-muted-foreground">{invoice.date}</span>
    </div>
  </div>
)

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [activeDashboardTab, setActiveDashboardTab] = useState("overview")

  const service = services.find((s) => s.id === params.id)

  // Datos de ejemplo para el dashboard
  const weeklyData = [145, 234, 189, 278, 356, 298, 312]
  const rejectionRate = 12.5
  const totalInvoices = 12456
  const rejectedInvoices = 1557
  const pendingInvoices = 234
  const successRate = 87.5

  const rejectedInvoicesList = [
    { id: "1", number: "F-2024-001", client: "Tech Solutions SRL", amount: "1,250.00", date: "2024-01-15", reason: "Formato incorrecto" },
    { id: "2", number: "F-2024-002", client: "Digital Services SA", amount: "3,400.00", date: "2024-01-14", reason: "Datos fiscales inválidos" },
    { id: "3", number: "F-2024-003", client: "Innovatech", amount: "890.00", date: "2024-01-14", reason: "Vencida" },
    { id: "4", number: "F-2024-004", client: "Global Solutions", amount: "2,100.00", date: "2024-01-13", reason: "Formato incorrecto" },
    { id: "5", number: "F-2024-005", client: "NextGen Corp", amount: "5,670.00", date: "2024-01-13", reason: "Sin firma digital" },
  ]

  const topRejectionReasons = [
    { reason: "Formato incorrecto", count: 423, percentage: 27.2 },
    { reason: "Datos fiscales inválidos", count: 356, percentage: 22.9 },
    { reason: "Factura vencida", count: 289, percentage: 18.6 },
    { reason: "Sin firma digital", count: 245, percentage: 15.7 },
    { reason: "Monto incorrecto", count: 244, percentage: 15.6 },
  ]

  const handleInvoiceAction = (action: string, id: string) => {
    console.log(`Action: ${action}, Invoice: ${id}`)
    // Aquí iría la lógica para manejar las acciones
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Servicio no encontrado</h1>
            <Button onClick={() => router.push("/")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const getLogIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getLogBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
      default:
        return "bg-muted/30 border-border"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Back button and title */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista de servicios
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{service.name}</h1>
                <p className="text-muted-foreground mt-1">Administración y gestión de facturas</p>
              </div>
              <StatusIndicator status={service.status} errorPercentage={service.errorPercentage} size="lg" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <RefreshCw className="h-4 w-4" />
                Sincronizar
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Impactante */}
        <div className="mb-8">
          <Tabs value={activeDashboardTab} onValueChange={setActiveDashboardTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <Activity className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="rejections" className="gap-2">
                <FileX className="h-4 w-4" />
                Rechazos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard
                  title="Total Facturas"
                  value={totalInvoices.toLocaleString()}
                  subtitle="Últimos 30 días"
                  icon={FileText}
                  trend="up"
                  trendValue="+12.3%"
                />
                <MetricCard
                  title="Facturas Rechazadas"
                  value={rejectedInvoices.toLocaleString()}
                  subtitle={`${rejectionRate}% del total`}
                  icon={FileX}
                  trend="down"
                  trendValue="-5.1%"
                />
                <MetricCard
                  title="Tasa de Éxito"
                  value={`${successRate}%`}
                  subtitle="Aprobación de facturas"
                  icon={Percent}
                  trend="up"
                  trendValue="+2.4%"
                />
                <MetricCard
                  title="Pendientes"
                  value={pendingInvoices.toLocaleString()}
                  subtitle="Por procesar"
                  icon={Clock}
                />
              </div>

              {/* Gráficos y análisis */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Gráfico de tendencia semanal */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Tendencia de Facturación Semanal
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Última semana
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SimpleBarChart data={weeklyData} maxValue={400} />
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">Promedio diario</span>
                          <p className="text-lg font-bold text-foreground">259</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pico máximo</span>
                          <p className="text-lg font-bold text-green-600">356</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Proyección mensual</span>
                          <p className="text-lg font-bold text-primary">~7,770</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Anillo de progreso */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Tasa de Rechazo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <ProgressRing value={rejectionRate} size={140} strokeWidth={12} />
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">Facturas rechazadas</p>
                      <p className="text-2xl font-bold text-red-600">{rejectionRate}%</p>
                      <p className="text-xs text-muted-foreground mt-2">Meta mensual: &lt;10%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Razones de rechazo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Principales Causas de Rechazo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topRejectionReasons.map((reason, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground">{reason.reason}</span>
                          <span className="text-muted-foreground">{reason.count} facturas ({reason.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-1000"
                            style={{ width: `${reason.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rejections">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de facturas rechazadas */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileX className="h-5 w-5 text-red-500" />
                        Últimas Facturas Rechazadas
                      </span>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Send className="h-3 w-3" />
                        Reenviar todas
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-2">
                        {rejectedInvoicesList.map((invoice) => (
                          <RejectedInvoiceCard
                            key={invoice.id}
                            invoice={invoice}
                            onAction={handleInvoiceAction}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Acciones rápidas para rechazos */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Acciones Masivas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start gap-2" variant="outline">
                        <RefreshCw className="h-4 w-4" />
                        Reintentar todos los rechazados
                      </Button>
                      <Button className="w-full justify-start gap-2" variant="outline">
                        <Bell className="h-4 w-4" />
                        Notificar a clientes afectados
                      </Button>
                      <Button className="w-full justify-start gap-2" variant="outline">
                        <Download className="h-4 w-4" />
                        Exportar reporte de rechazos
                      </Button>
                      <Button className="w-full justify-start gap-2" variant="default">
                        <Settings className="h-4 w-4" />
                        Configurar reglas automáticas
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Resumen del Día
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Rechazos hoy</span>
                        <span className="font-bold text-red-600">23</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Procesados hoy</span>
                        <span className="font-bold text-green-600">456</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Rechazo más común</span>
                        <span className="font-medium text-sm">Formato incorrecto</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sección original de logs, clientes, etc. */}
        <div className="mt-8 pt-8 border-t border-border">
          <Tabs defaultValue="logs" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descripción
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clientes ({service.clients.length})
              </TabsTrigger>
            </TabsList>

            {/* Logs Tab */}
            <TabsContent value="logs">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    {service.status === "success" ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Sin errores - Funcionando correctamente
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Registro de actividad
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {service.logs.map((log) => (
                        <div
                          key={log.id}
                          className={cn(
                            "p-4 rounded-lg border transition-colors",
                            getLogBgColor(log.type)
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {getLogIcon(log.type)}
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{log.message}</p>
                              <p className="text-sm text-muted-foreground mt-1">{log.timestamp}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                log.type === "success" && "border-green-300 text-green-700 dark:border-green-700 dark:text-green-400",
                                log.type === "error" && "border-red-300 text-red-700 dark:border-red-700 dark:text-red-400",
                                log.type === "warning" && "border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400",
                                log.type === "info" && "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400"
                              )}
                            >
                              {log.type === "success" && "Exitoso"}
                              {log.type === "error" && "Error"}
                              {log.type === "warning" && "Advertencia"}
                              {log.type === "info" && "Info"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Información del Servicio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Descripción</h3>
                    <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Estado actual</div>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusIndicator status={service.status} errorPercentage={service.errorPercentage} />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Total de clientes</div>
                        <div className="text-2xl font-bold text-foreground mt-1">{service.clients.length}</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Características</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Procesamiento automatizado en tiempo real</li>
                      <li>Validación automática de facturas</li>
                      <li>Sistema de notificaciones inteligentes</li>
                      <li>Dashboard con métricas en tiempo real</li>
                      <li>Reportes exportables en múltiples formatos</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clients Tab */}
            <TabsContent value="clients">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Clientes con este servicio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {service.clients.map((client) => (
                        <div
                          key={client.id}
                          className={cn(
                            "p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md",
                            selectedClient?.id === client.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                          onClick={() => setSelectedClient(client)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                                  client.status === "success" && "bg-green-500",
                                  client.status === "warning" && "bg-yellow-500",
                                  client.status === "error" && "bg-red-500"
                                )}
                              >
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{client.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {client.errorPercentage}% de errores
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusIndicator status={client.status} errorPercentage={client.errorPercentage} />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedClient(client)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar - Quick actions and client detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            {/* Espacio para contenido adicional si es necesario */}
          </div>
          
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reiniciar servicio
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Send className="mr-2 h-4 w-4" />
                  Reenviar fallidos
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="mr-2 h-4 w-4" />
                  Notificar clientes
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Button>
              </CardContent>
            </Card>

            {/* Selected Client Detail */}
            {selectedClient && (
              <Card className="border-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium flex items-center justify-between">
                    <span>Detalle del Cliente</span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg",
                        selectedClient.status === "success" && "bg-green-500",
                        selectedClient.status === "warning" && "bg-yellow-500",
                        selectedClient.status === "error" && "bg-red-500"
                      )}
                    >
                      {selectedClient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedClient.name}</p>
                      <StatusIndicator status={selectedClient.status} errorPercentage={selectedClient.errorPercentage} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {1000 - selectedClient.errorPercentage * 10}
                      </div>
                      <div className="text-xs text-muted-foreground">Transacciones</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-foreground">{selectedClient.errorPercentage}%</div>
                      <div className="text-xs text-muted-foreground">Errores</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resincronizar
                    </Button>
                    <Button className="w-full" variant="outline" size="sm">
                      <Bell className="mr-2 h-4 w-4" />
                      Contactar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Sistema de Administración y Monitoreo de Facturas &copy; 2026 | Dashboard en Tiempo Real
        </div>
      </footer>
    </div>
  )
}