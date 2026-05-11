"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar as CalendarIcon,
  Clock,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ScheduledTask {
  id: string
  name: string
  description: string
  schedule: string
  scheduleType: string
  scheduleTime?: string
  scheduleDay?: string
  nextRun: string
  status: "activo" | "pausado" | "completado"
  lastRun?: string
  lastResult?: "éxito" | "fallo"
}

// Tareas iniciales
const initialTasks: ScheduledTask[] = [
  { id: "1", name: "Validación de Facturas", description: "Validación automática de facturas electrónicas", schedule: "Cada hora", scheduleType: "hourly", nextRun: "2026-05-05 15:00:00", status: "activo", lastRun: "2026-05-05 14:00:00", lastResult: "éxito" },
  { id: "2", name: "Reenvío al SII", description: "Reenvío de facturas rechazadas al SII", schedule: "Cada 6 horas", scheduleType: "hourly", nextRun: "2026-05-05 18:00:00", status: "activo", lastRun: "2026-05-05 12:00:00", lastResult: "éxito" },
  { id: "3", name: "Notificaciones", description: "Envío de notificaciones a clientes", schedule: "Diario - 09:00", scheduleType: "daily", scheduleTime: "09:00", nextRun: "2026-05-06 09:00:00", status: "pausado", lastRun: "2026-05-04 09:00:00", lastResult: "éxito" },
  { id: "4", name: "Reporte Diario", description: "Generación de reporte diario de facturación", schedule: "Diario - 23:59", scheduleType: "daily", scheduleTime: "23:59", nextRun: "2026-05-05 23:59:00", status: "activo", lastRun: "2026-05-04 23:59:00", lastResult: "éxito" },
  { id: "5", name: "Backup de Datos", description: "Respaldo de información de facturas", schedule: "Semanal - Domingo 02:00", scheduleType: "weekly", scheduleDay: "Domingo", scheduleTime: "02:00", nextRun: "2026-05-10 02:00:00", status: "activo", lastRun: "2026-05-03 02:00:00", lastResult: "éxito" },
]

export default function ProgramacionPage() {
  const [mounted, setMounted] = useState(false)
  const [tasks, setTasks] = useState<ScheduledTask[]>(initialTasks)
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<ScheduledTask | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    scheduleType: "hourly" as "hourly" | "daily" | "weekly",
    hourlyInterval: "1",
    dailyTime: "09:00",
    weeklyDay: "Lunes",
    weeklyTime: "09:00",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const getNextRunDate = (scheduleType: string, hourlyInterval?: string, dailyTime?: string, weeklyDay?: string, weeklyTime?: string): string => {
    const now = new Date()
    let nextRun = new Date(now)
    
    if (scheduleType === "hourly") {
      const hours = parseInt(hourlyInterval || "1")
      nextRun.setHours(now.getHours() + hours, 0, 0, 0)
    } else if (scheduleType === "daily" && dailyTime) {
      const [hour, minute] = dailyTime.split(":").map(Number)
      nextRun.setHours(hour, minute, 0, 0)
      if (nextRun <= now) nextRun.setDate(now.getDate() + 1)
    } else if (scheduleType === "weekly" && weeklyDay && weeklyTime) {
      const days = { "Lunes": 1, "Martes": 2, "Miércoles": 3, "Jueves": 4, "Viernes": 5, "Sábado": 6, "Domingo": 0 }
      const targetDay = days[weeklyDay as keyof typeof days]
      const [hour, minute] = weeklyTime.split(":").map(Number)
      nextRun.setHours(hour, minute, 0, 0)
      const currentDay = now.getDay()
      let daysToAdd = targetDay - currentDay
      if (daysToAdd <= 0) daysToAdd += 7
      nextRun.setDate(now.getDate() + daysToAdd)
    }
    
    return nextRun.toISOString().slice(0, 19).replace("T", " ")
  }

  const getScheduleDisplay = (form: typeof formData): string => {
    if (form.scheduleType === "hourly") {
      return `Cada ${form.hourlyInterval} ${parseInt(form.hourlyInterval) === 1 ? "hora" : "horas"}`
    } else if (form.scheduleType === "daily") {
      return `Diario - ${form.dailyTime}`
    } else {
      return `Semanal - ${form.weeklyDay} ${form.weeklyTime}`
    }
  }

  const handleAddTask = () => {
    const nextRun = getNextRunDate(
      formData.scheduleType,
      formData.hourlyInterval,
      formData.dailyTime,
      formData.weeklyDay,
      formData.weeklyTime
    )
    
    const scheduleDisplay = getScheduleDisplay(formData)
    
    const newTask: ScheduledTask = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      schedule: scheduleDisplay,
      scheduleType: formData.scheduleType,
      scheduleTime: formData.scheduleType === "daily" ? formData.dailyTime : formData.weeklyTime,
      scheduleDay: formData.scheduleType === "weekly" ? formData.weeklyDay : undefined,
      nextRun,
      status: "activo",
    }
    
    setTasks([newTask, ...tasks])
    setNewTaskOpen(false)
    resetForm()
  }

  const handleEditTask = () => {
    if (!editingTask) return
    
    const nextRun = getNextRunDate(
      formData.scheduleType,
      formData.hourlyInterval,
      formData.dailyTime,
      formData.weeklyDay,
      formData.weeklyTime
    )
    
    const scheduleDisplay = getScheduleDisplay(formData)
    
    const updatedTask: ScheduledTask = {
      ...editingTask,
      name: formData.name,
      description: formData.description,
      schedule: scheduleDisplay,
      scheduleType: formData.scheduleType,
      scheduleTime: formData.scheduleType === "daily" ? formData.dailyTime : formData.weeklyTime,
      scheduleDay: formData.scheduleType === "weekly" ? formData.weeklyDay : undefined,
      nextRun,
    }
    
    setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t))
    setEditingTask(null)
    resetForm()
  }

  const handleDeleteTask = () => {
    if (deleteConfirm) {
      setTasks(tasks.filter(t => t.id !== deleteConfirm.id))
      setDeleteConfirm(null)
    }
  }

  const toggleTaskStatus = (task: ScheduledTask) => {
    setTasks(tasks.map(t => 
      t.id === task.id 
        ? { ...t, status: t.status === "activo" ? "pausado" : "activo" as "activo" | "pausado" }
        : t
    ))
  }

  const openEditDialog = (task: ScheduledTask) => {
    setEditingTask(task)
    setFormData({
      name: task.name,
      description: task.description,
      scheduleType: task.scheduleType,
      hourlyInterval: task.scheduleType === "hourly" ? (task.schedule.match(/\d+/)?.toString() || "1") : "1",
      dailyTime: task.scheduleTime?.slice(0, 5) || "09:00",
      weeklyDay: task.scheduleDay || "Lunes",
      weeklyTime: task.scheduleTime?.slice(0, 5) || "09:00",
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      scheduleType: "hourly",
      hourlyInterval: "1",
      dailyTime: "09:00",
      weeklyDay: "Lunes",
      weeklyTime: "09:00",
    })
  }

  const weeklyDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  const hourlyIntervals = ["1", "2", "3", "4", "6", "8", "12", "24"]

  if (!mounted) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Cargando...</div>
        </main>
      </div>
    )
  }

  const activeTasks = tasks.filter(t => t.status === "activo").length
  const successRate = tasks.filter(t => t.lastResult === "éxito").length / (tasks.filter(t => t.lastResult).length || 1) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Programación de Tareas</h1>
            <p className="text-sm text-muted-foreground">Gestiona tareas automatizadas del sistema</p>
          </div>
          <Button className="gap-2" onClick={() => setNewTaskOpen(true)}>
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Tareas Activas</p>
              <p className="text-2xl font-bold text-green-600">{activeTasks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Ejecuciones Hoy</p>
              <p className="text-2xl font-bold">{Math.floor(activeTasks * 2.5)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Próxima Tarea</p>
              <p className="text-sm font-semibold truncate">{tasks.find(t => t.status === "activo")?.name || "-"}</p>
              <p className="text-xs text-muted-foreground">{tasks.find(t => t.status === "activo")?.nextRun.split(' ')[1]?.slice(0, 5) || "-"} hrs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Tasa de Éxito</p>
              <p className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Tareas Programadas ({tasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay tareas programadas. Haz clic en "Nueva Tarea" para crear una.
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className={cn("flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md", task.status === "activo" ? "bg-card" : "bg-muted/30")}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn("p-2 rounded-lg cursor-pointer", task.status === "activo" ? "bg-green-50 dark:bg-green-950/20" : "bg-gray-50 dark:bg-gray-950/20")} onClick={() => toggleTaskStatus(task)}>
                        {task.status === "activo" ? <Play className="h-4 w-4 text-green-500" /> : <Pause className="h-4 w-4 text-gray-500" />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{task.name}</p>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><CalendarIcon className="h-3 w-3"/>{task.schedule}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3"/>Próxima: {task.nextRun.split(' ')[1]?.slice(0, 5) || "-"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.status === "activo" ? "default" : "secondary"} className={task.status === "activo" ? "bg-green-500" : ""}>
                        {task.status === "activo" ? "Activo" : task.status === "pausado" ? "Pausado" : "Completado"}
                      </Badge>
                      {task.lastResult && (
                        <div className={task.lastResult === "éxito" ? "text-green-500" : "text-red-500"}>
                          {task.lastResult === "éxito" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        </div>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleTaskStatus(task)}>
                        {task.status === "activo" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(task)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteConfirm(task)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent executions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              Ejecuciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.filter(t => t.lastRun).slice(0, 5).map((task, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    {task.lastResult === "éxito" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                    <div>
                      <p className="text-sm font-medium">{task.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.lastResult === "éxito" ? "Completado exitosamente" : "Error en la ejecución"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{task.lastRun?.split(' ')[1]?.slice(0, 5)}</span>
                </div>
              ))}
              {tasks.filter(t => t.lastRun).length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No hay ejecuciones recientes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modal Nueva Tarea */}
      <Dialog open={newTaskOpen || !!editingTask} onOpenChange={(open) => {
        if (!open) {
          setNewTaskOpen(false)
          setEditingTask(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Editar Tarea" : "Nueva Tarea Programada"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Modifica los detalles de la tarea" : "Configura una nueva tarea automatizada"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre de la tarea</Label>
              <Input
                id="name"
                placeholder="Ej: Validación de Facturas"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe qué hace esta tarea..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            
            <div>
              <Label>Tipo de programación</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <Button
                  type="button"
                  variant={formData.scheduleType === "hourly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, scheduleType: "hourly" })}
                >
                  Por hora
                </Button>
                <Button
                  type="button"
                  variant={formData.scheduleType === "daily" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, scheduleType: "daily" })}
                >
                  Diario
                </Button>
                <Button
                  type="button"
                  variant={formData.scheduleType === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, scheduleType: "weekly" })}
                >
                  Semanal
                </Button>
              </div>
            </div>
            
            {formData.scheduleType === "hourly" && (
              <div>
                <Label>Intervalo</Label>
                <Select value={formData.hourlyInterval} onValueChange={(v) => setFormData({ ...formData, hourlyInterval: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hourlyIntervals.map(h => (
                      <SelectItem key={h} value={h}>Cada {h} {parseInt(h) === 1 ? "hora" : "horas"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {formData.scheduleType === "daily" && (
              <div>
                <Label>Hora de ejecución</Label>
                <Input
                  type="time"
                  value={formData.dailyTime}
                  onChange={(e) => setFormData({ ...formData, dailyTime: e.target.value })}
                />
              </div>
            )}
            
            {formData.scheduleType === "weekly" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Día</Label>
                  <Select value={formData.weeklyDay} onValueChange={(v) => setFormData({ ...formData, weeklyDay: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weeklyDays.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hora</Label>
                  <Input
                    type="time"
                    value={formData.weeklyTime}
                    onChange={(e) => setFormData({ ...formData, weeklyTime: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewTaskOpen(false)
              setEditingTask(null)
              resetForm()
            }}>
              Cancelar
            </Button>
            <Button onClick={editingTask ? handleEditTask : handleAddTask} disabled={!formData.name}>
              {editingTask ? "Guardar Cambios" : "Crear Tarea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Eliminación */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar la tarea "{deleteConfirm?.name}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}