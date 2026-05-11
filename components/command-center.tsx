// components/command-center.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { services } from "@/lib/services-data"
import {
  Zap,
  RefreshCw,
  Send,
  Bell,
  Headphones,
  PlayCircle,
  StopCircle,
  RotateCcw,
  CheckCircle,
  FileText,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionLog {
  id: string
  action: string
  service: string
  timestamp: Date
  status: "success" | "pending" | "error"
  details?: string
}

interface CommandCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandCenter({ open, onOpenChange }: CommandCenterProps) {
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    action: string
    description: string
    details?: string
    onConfirm: () => void
  } | null>(null)

  const selectedService = services.find((s) => s.id === "1")

  const executeAction = async (action: string, description: string, details?: string) => {
    if (!selectedService) return

    setConfirmAction({
      action,
      description,
      details,
      onConfirm: async () => {
        setConfirmAction(null)
        setIsExecuting(true)

        const newLog: ActionLog = {
          id: Date.now().toString(),
          action,
          service: selectedService.name,
          timestamp: new Date(),
          status: "pending",
          details,
        }
        setActionLogs((prev) => [newLog, ...prev])

        await new Promise((resolve) => setTimeout(resolve, 1500))

        setActionLogs((prev) =>
          prev.map((log) =>
            log.id === newLog.id ? { ...log, status: "success" } : log
          )
        )
        setIsExecuting(false)
      },
    })
  }

  const actions = [
    {
      icon: RefreshCw,
      label: "Reintentar Facturas Rechazadas",
      description: "Reintenta automáticamente todas las facturas que fueron rechazadas",
      color: "text-blue-500",
      bgColor: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20",
    },
    {
      icon: Send,
      label: "Reenviar al SII",
      description: "Reenvía las facturas fallidas al Servicio de Impuestos Internos",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20",
    },
    {
      icon: Bell,
      label: "Notificar Clientes",
      description: "Envía notificaciones sobre facturas rechazadas",
      color: "text-purple-500",
      bgColor: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20",
    },
    {
      icon: Headphones,
      label: "Reportar Problemas",
      description: "Crea un reporte de fallas en el sistema",
      color: "text-red-500",
      bgColor: "bg-red-50 hover:bg-red-100 dark:bg-red-950/20",
    },
    {
      icon: PlayCircle,
      label: "Procesar Lote Manual",
      description: "Inicia procesamiento manual de facturas pendientes",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20",
    },
    {
      icon: TrendingUp,
      label: "Optimizar Reglas",
      description: "Ejecuta optimización de reglas de validación",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/20",
    },
    {
      icon: StopCircle,
      label: "Detener Validación",
      description: "Detiene temporalmente la validación automática",
      color: "text-orange-500",
      bgColor: "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20",
    },
    {
      icon: FileText,
      label: "Generar Reporte",
      description: "Genera reporte detallado de facturas",
      color: "text-teal-500",
      bgColor: "bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20",
    },
  ]

  if (!selectedService) return null

  return (
    <>
      {/* Modal del Centro de Comandos */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Centro de Comandos
            </DialogTitle>
            <DialogDescription>
              Servicio: <span className="font-semibold text-primary">{selectedService.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Estado del servicio */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Estado: Operativo</span>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tasa Error:</span>
                  <span className="ml-1 font-semibold">{selectedService.errorPercentage}%</span>
                </div>
              </div>
            </div>

            {/* Botones de acciones */}
            <div className="grid grid-cols-2 gap-2">
              {actions.map((action) => (
                <Button
                  key={action.label}
                  variant="ghost"
                  className={`h-auto flex-col items-center gap-1.5 p-3 ${action.bgColor} transition-all`}
                  onClick={() => executeAction(action.label, action.description)}
                  disabled={isExecuting}
                >
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-[10px] font-medium text-center">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Historial de Acciones */}
            {actionLogs.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Historial de Acciones
                </h4>
                <div className="max-h-[150px] overflow-y-auto space-y-1.5">
                  {actionLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center gap-2 rounded-md bg-muted/50 p-2 text-xs">
                      {log.status === "pending" ? (
                        <Spinner className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{log.action}</p>
                      </div>
                      <span className="text-muted-foreground text-[10px]">
                        {log.timestamp.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Acción</DialogTitle>
            <DialogDescription>
              {confirmAction?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmAction?.onConfirm}>
              Ejecutar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}