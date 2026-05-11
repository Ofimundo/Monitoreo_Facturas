"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceCard } from "@/components/service-card"
import { ErrorsModal } from "@/components/errors-modal"
import { StatusLegend } from "@/components/status-legend"
import { HeatMap } from "@/components/heat-map"
import { EventsTimeline } from "@/components/events-timeline"
import { ClientComparison } from "@/components/client-comparison"
import { CommandCenter } from "@/components/command-center"
import { services, type Service } from "@/lib/services-data"
import { 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  LayoutGrid,
  List,
} from "lucide-react"

export function ServicesList() {
  const router = useRouter()
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showErrorsModal, setShowErrorsModal] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "heatmap">("grid")

  const handleViewErrors = (service: Service) => {
    setSelectedService(service)
    setShowErrorsModal(true)
  }

  const handleSelectService = (service: Service) => {
    router.push(`/servicio/${service.id}`)
  }

  // Calculate summary stats
  const successCount = services.filter(s => s.status === "success").length
  const warningCount = services.filter(s => s.status === "warning").length
  const errorCount = services.filter(s => s.status === "error").length
  const totalClients = services.reduce((sum, s) => sum + s.clients.length, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{successCount}</p>
              <p className="text-sm text-muted-foreground">Servicios OK</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
              <AlertTriangle className="h-6 w-6 text-warning-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{warningCount}</p>
              <p className="text-sm text-muted-foreground">Con alertas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
              <XCircle className="h-6 w-6 text-error" />
            </div>
            <div>
              <p className="text-2xl font-bold">{errorCount}</p>
              <p className="text-sm text-muted-foreground">Con errores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Server className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalClients}</p>
              <p className="text-sm text-muted-foreground">Clientes activos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Services & HeatMap */}
        <div className="lg:col-span-2 space-y-6">
          {/* View Toggle Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "heatmap")}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="grid" className="gap-1.5">
                  <List className="h-4 w-4" />
                  Lista
                </TabsTrigger>
                <TabsTrigger value="heatmap" className="gap-1.5">
                  <LayoutGrid className="h-4 w-4" />
                  Mapa de Calor
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="grid" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Server className="h-5 w-5" />
                    Servicios SaaS Disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {services.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onViewErrors={handleViewErrors}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="heatmap" className="mt-4">
              <HeatMap onSelectService={handleSelectService} />
            </TabsContent>
          </Tabs>

          {/* Timeline */}
          <EventsTimeline onSelectService={handleSelectService} />
        </div>

        {/* Right Column - Tools & Legend */}
        <div className="space-y-6">
          <CommandCenter />
          <ClientComparison />
          <StatusLegend />
        </div>
      </div>

      {/* Modals */}
      <ErrorsModal
        service={selectedService}
        open={showErrorsModal}
        onOpenChange={setShowErrorsModal}
      />
    </div>
  )
}
