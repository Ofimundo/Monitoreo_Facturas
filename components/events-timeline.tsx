"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { services, type Service, type LogEntry } from "@/lib/services-data"
import { cn } from "@/lib/utils"
import { 
  Clock, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Calendar,
  X,
  ChevronDown,
} from "lucide-react"

interface TimelineEvent {
  id: string
  serviceName: string
  serviceId: string
  log: LogEntry
  service: Service
}

interface EventsTimelineProps {
  onSelectService: (service: Service) => void
}

export function EventsTimeline({ onSelectService }: EventsTimelineProps) {
  const [filterType, setFilterType] = useState<"all" | "error" | "warning" | "success" | "info">("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // No establecer fechas por defecto - empezar sin filtros de fecha
  }, [])

  // Collect all logs from all services and sort by timestamp
  const allEvents: TimelineEvent[] = services
    .flatMap((service) =>
      service.logs.map((log) => ({
        id: `${service.id}-${log.id}`,
        serviceName: service.name,
        serviceId: service.id,
        log,
        service,
      }))
    )
    .sort((a, b) => new Date(b.log.timestamp).getTime() - new Date(a.log.timestamp).getTime())

  // Aplicar filtros
  const filteredEvents = allEvents.filter(event => {
    // Filtro por tipo
    if (filterType !== "all" && event.log.type !== filterType) {
      return false
    }
    
    // Filtro por fecha desde
    if (dateFrom && dateFrom !== "") {
      const eventDate = new Date(event.log.timestamp).toISOString().split('T')[0]
      if (eventDate < dateFrom) return false
    }
    
    // Filtro por fecha hasta
    if (dateTo && dateTo !== "") {
      const eventDate = new Date(event.log.timestamp).toISOString().split('T')[0]
      if (eventDate > dateTo) return false
    }
    
    return true
  })

  // Limpiar todos los filtros - AHORA SÍ FUNCIONA CORRECTAMENTE
  const clearFilters = () => {
    setFilterType("all")
    setDateFrom("")  // Vacío, no fecha por defecto
    setDateTo("")    // Vacío, no fecha por defecto
  }

  // Verificar si hay filtros activos
  const hasActiveFilters = filterType !== "all" || (dateFrom && dateFrom !== "") || (dateTo && dateTo !== "")

  // Contar filtros activos
  const activeFiltersCount = (filterType !== "all" ? 1 : 0) + 
    (dateFrom && dateFrom !== "" ? 1 : 0) + 
    (dateTo && dateTo !== "" ? 1 : 0)

  const getTypeIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "border-l-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20"
      case "warning":
        return "border-l-amber-500 bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-950/10 dark:hover:bg-amber-950/20"
      case "error":
        return "border-l-red-500 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/10 dark:hover:bg-red-950/20"
      default:
        return "border-l-blue-500 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/10 dark:hover:bg-blue-950/20"
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  // Eliminar filtro individual de fecha
  const removeDateFrom = () => setDateFrom("")
  const removeDateTo = () => setDateTo("")
  const removeFilterType = () => setFilterType("all")

  if (!mounted) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            Línea de Tiempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded" />)}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            Línea de Tiempo
            <Badge variant="secondary" className="text-xs">
              {filteredEvents.length} eventos
            </Badge>
          </CardTitle>
          
          {/* Botón de filtros */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant={hasActiveFilters ? "default" : "outline"} size="sm" className="gap-1 h-7 text-xs">
                <Filter className="h-3 w-3" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-[10px]">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Tipo de evento</label>
                  <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="success">Exitosos</SelectItem>
                      <SelectItem value="warning">Alertas</SelectItem>
                      <SelectItem value="error">Errores</SelectItem>
                      <SelectItem value="info">Información</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-medium mb-1 block">Fecha desde</label>
                  <Input 
                    type="date" 
                    value={dateFrom} 
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium mb-1 block">Fecha hasta</label>
                  <Input 
                    type="date" 
                    value={dateTo} 
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={clearFilters} className="flex-1">
                    <X className="h-3 w-3 mr-1" />
                    Limpiar todo
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)} className="flex-1">
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Filtros rápidos por tipo */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
            className="h-7 text-xs"
          >
            Todos
          </Button>
          <Button
            variant={filterType === "error" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("error")}
            className="h-7 text-xs"
          >
            <XCircle className="h-3 w-3 mr-1 text-red-500" />
            Errores
          </Button>
          <Button
            variant={filterType === "warning" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("warning")}
            className="h-7 text-xs"
          >
            <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
            Alertas
          </Button>
          <Button
            variant={filterType === "success" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("success")}
            className="h-7 text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1 text-emerald-500" />
            Exitosos
          </Button>
        </div>

        {/* Mostrar badges de filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {filterType !== "all" && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                Tipo: {filterType === "error" ? "Errores" : filterType === "warning" ? "Alertas" : filterType === "success" ? "Exitosos" : "Información"}
                <X className="h-2 w-2 cursor-pointer" onClick={removeFilterType} />
              </Badge>
            )}
            {dateFrom && dateFrom !== "" && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                Desde: {new Date(dateFrom).toLocaleDateString('es-CL')}
                <X className="h-2 w-2 cursor-pointer" onClick={removeDateFrom} />
              </Badge>
            )}
            {dateTo && dateTo !== "" && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                Hasta: {new Date(dateTo).toLocaleDateString('es-CL')}
                <X className="h-2 w-2 cursor-pointer" onClick={removeDateTo} />
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className="text-[10px] gap-1 cursor-pointer hover:bg-muted"
              onClick={clearFilters}
            >
              <X className="h-2 w-2" />
              Limpiar todos
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="max-h-[400px] overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay eventos que coincidan con los filtros</p>
            <Button variant="link" size="sm" onClick={clearFilters} className="mt-2">
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => onSelectService(event.service)}
                className={cn(
                  "w-full text-left rounded-lg border-l-4 p-3 transition-all hover:shadow-md cursor-pointer",
                  getTypeColor(event.log.type)
                )}
              >
                <div className="flex items-start gap-2">
                  {getTypeIcon(event.log.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {event.serviceName}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {formatDate(event.log.timestamp)}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTime(event.log.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-foreground line-clamp-2">
                      {event.log.message}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}