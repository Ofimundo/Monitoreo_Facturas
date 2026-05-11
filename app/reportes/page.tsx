"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  FileText,
  DollarSign,
  Percent,
  Activity,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"

// Componente de gráfico de líneas
const LineChart = ({ data, labels, color = "primary" }: { data: number[]; labels: string[]; color?: string }) => {
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
          <line key={level} x1="0" y1={`${100 - level}%`} x2="100%" y2={`${100 - level}%`} stroke="currentColor" strokeWidth="0.5" className="text-muted/20" strokeDasharray="4" />
        ))}
        <polygon points={`${points.map(p => `${p.x},${p.y}`).join(' ')} ${points[points.length-1].x},100 0,100`} fill="currentColor" className={`text-${color}/10`} />
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2" className={`text-${color}`} />
        {points.map((p, i) => (<circle key={i} cx={p.x} cy={p.y} r="3" fill="currentColor" className={`text-${color}`} />))}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-muted-foreground">
        {labels.map((label, i) => (<span key={i}>{label}</span>))}
      </div>
    </div>
  )
}

// Componente de gráfico de barras
const BarChart = ({ data, labels, color = "primary" }: { data: number[]; labels: string[]; color?: string }) => {
  const maxValue = Math.max(...data)

  return (
    <div className="h-48 w-full">
      <div className="flex h-40 items-end gap-2">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn("w-full rounded-t-lg transition-all duration-500", `bg-${color}/80 hover:bg-${color}`)}
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
            <span className="text-[10px] text-muted-foreground">{labels[index]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Componente de selector de fechas
const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange, onApply, onCancel }: {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onApply: () => void
  onCancel: () => void
}) => {
  return (
    <div className="absolute top-full right-0 mt-2 z-10 bg-popover rounded-lg border shadow-lg p-4 w-80">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium mb-1 block">Fecha Inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Fecha Fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">Cancelar</Button>
          <Button size="sm" onClick={onApply} className="flex-1">Aplicar</Button>
        </div>
      </div>
    </div>
  )
}

export default function ReportesPage() {
  const [mounted, setMounted] = useState(false)
  const [period, setPeriod] = useState<"mes" | "ultimoMes" | "anio" | "personalizado">("mes")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Datos según el período seleccionado
  const getMonthlyData = () => {
    if (period === "mes") {
      return [45, 67, 89, 123, 156, 189, 234, 278, 312, 298, 267, 245, 234, 212, 198, 187, 176, 165, 154, 143, 132, 121, 110, 98, 87, 76, 65, 54, 43, 32, 21]
    } else if (period === "ultimoMes") {
      return [32, 54, 76, 98, 134, 167, 198, 234, 267, 289, 276, 254, 243, 231, 219, 207, 195, 183, 171, 159, 147, 135, 123, 111, 99, 87, 75, 63, 51, 39, 27]
    } else {
      return [234, 345, 456, 567, 678, 789, 890, 901, 876, 765, 654, 543]
    }
  }

  const getLabels = () => {
    if (period === "mes" || period === "ultimoMes") {
      return ['1', '3', '5', '7', '9', '11', '13', '15', '17', '19', '21', '23', '25', '27', '29', '31']
    } else {
      return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    }
  }

  const getRejectionData = () => {
    if (period === "mes") {
      return [27, 23, 19, 16, 15]
    } else if (period === "ultimoMes") {
      return [25, 24, 20, 15, 16]
    } else {
      return [28, 22, 18, 17, 15]
    }
  }

  const getRejectionLabels = () => ["Formato incorrecto", "Datos fiscales inválidos", "Factura vencida", "Sin firma digital", "Monto incorrecto"]

  const getStats = () => {
    if (period === "mes") {
      return {
        totalFacturas: "12,456",
        tasaExito: "87.5",
        facturasRechazadas: "1,557",
        montoTotal: "$12.5M",
        trendTotal: "+12.3",
        trendExito: "+2.4",
        trendRechazos: "-5.1",
        trendMonto: "+18.2",
      }
    } else if (period === "ultimoMes") {
      return {
        totalFacturas: "11,234",
        tasaExito: "85.2",
        facturasRechazadas: "1,662",
        montoTotal: "$11.2M",
        trendTotal: "+8.5",
        trendExito: "+1.2",
        trendRechazos: "-3.8",
        trendMonto: "+14.5",
      }
    } else {
      return {
        totalFacturas: "98,456",
        tasaExito: "86.8",
        facturasRechazadas: "13,021",
        montoTotal: "$98.5M",
        trendTotal: "+15.3",
        trendExito: "+2.8",
        trendRechazos: "-4.2",
        trendMonto: "+22.1",
      }
    }
  }

  const getClientData = () => {
    return [
      { name: "Latam", success: 98.5, facturas: 3245, monto: "$3.2M" },
      { name: "Global Horizon", success: 96.2, facturas: 2890, monto: "$2.9M" },
      { name: "TechCorp Chile", success: 94.8, facturas: 2456, monto: "$2.5M" },
      { name: "Retail Solutions", success: 91.3, facturas: 2123, monto: "$2.1M" },
    ]
  }

  const handleExportToExcel = () => {
    const stats = getStats()
    const rejectionData = getRejectionData()
    const rejectionLabels = getRejectionLabels()
    const clientData = getClientData()
    const monthlyData = getMonthlyData()
    const labels = getLabels()

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new()

    // Hoja 1: Resumen General
    const summaryData = [
      ["REPORTE DE FACTURACIÓN", ""],
      ["Fecha de exportación", new Date().toLocaleString('es-CL')],
      ["Período", period === "mes" ? "Mes actual" : period === "ultimoMes" ? "Mes anterior" : period === "anio" ? "Año actual" : `Personalizado: ${startDate} - ${endDate}`],
      ["", ""],
      ["MÉTRICAS PRINCIPALES", ""],
      ["Total Facturas", stats.totalFacturas],
      ["Tasa de Éxito", `${stats.tasaExito}%`],
      ["Facturas Rechazadas", stats.facturasRechazadas],
      ["Monto Total", stats.montoTotal],
      ["", ""],
      ["TENDENCIAS", ""],
      ["Crecimiento Total Facturas", `${stats.trendTotal}%`],
      ["Crecimiento Tasa Éxito", `${stats.trendExito}%`],
      ["Reducción Rechazos", `${stats.trendRechazos}%`],
      ["Crecimiento Monto", `${stats.trendMonto}%`],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen General")

    // Hoja 2: Facturación por período
    const billingData = [["Período", "Facturas Procesadas"]]
    if (period === "anio") {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      monthlyData.forEach((value, i) => {
        billingData.push([meses[i], value])
      })
    } else {
      for (let i = 0; i < monthlyData.length; i++) {
        billingData.push([`Día ${i + 1}`, monthlyData[i]])
      }
    }
    const billingSheet = XLSX.utils.aoa_to_sheet(billingData)
    billingSheet['!cols'] = [{ wch: 20 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, billingSheet, "Facturación Diaria")

    // Hoja 3: Motivos de Rechazo
    const rejectionDataRows = [["Motivo", "Porcentaje", "Cantidad Aprox"]]
    const totalRechazos = parseInt(stats.facturasRechazadas.replace(/,/g, ''))
    rejectionLabels.forEach((label, i) => {
      const cantidad = Math.round(totalRechazos * (rejectionData[i] / 100))
      rejectionDataRows.push([label, `${rejectionData[i]}%`, cantidad.toLocaleString()])
    })
    const rejectionSheet = XLSX.utils.aoa_to_sheet(rejectionDataRows)
    rejectionSheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, rejectionSheet, "Motivos de Rechazo")

    // Hoja 4: Rendimiento por Cliente
    const clientDataRows = [["Cliente", "Tasa de Éxito", "Facturas", "Monto"]]
    clientData.forEach(client => {
      clientDataRows.push([client.name, `${client.success}%`, client.facturas, client.monto])
    })
    const clientSheet = XLSX.utils.aoa_to_sheet(clientDataRows)
    clientSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, clientSheet, "Rendimiento Clientes")

    // Hoja 5: Datos completos para análisis
    const fullDataRows = [["Fecha", "Facturas Procesadas"]]
    if (period === "anio") {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      monthlyData.forEach((value, i) => {
        fullDataRows.push([meses[i], value])
      })
    } else {
      for (let i = 0; i < monthlyData.length; i++) {
        fullDataRows.push([`2026-05-${String(i + 1).padStart(2, '0')}`, monthlyData[i]])
      }
    }
    const fullDataSheet = XLSX.utils.aoa_to_sheet(fullDataRows)
    fullDataSheet['!cols'] = [{ wch: 15 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, fullDataSheet, "Datos Completos")

    // Guardar archivo
    const fileName = `reporte_facturacion_${period}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const handleCustomPeriod = () => {
    if (startDate && endDate) {
      setPeriod("personalizado")
      setShowDatePicker(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }, [])

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

  const stats = getStats()
  const rejectionData = getRejectionData()
  const rejectionLabels = getRejectionLabels()
  const maxRejection = Math.max(...rejectionData)
  const clientData = getClientData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reportes y Análisis</h1>
            <p className="text-sm text-muted-foreground">Visualiza estadísticas y tendencias de facturación</p>
          </div>
          <Button variant="default" size="sm" className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleExportToExcel}>
            <Download className="h-4 w-4" />
            Exportar a Excel
          </Button>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button variant={period === "mes" ? "default" : "outline"} size="sm" onClick={() => setPeriod("mes")}>
            Este Mes
          </Button>
          <Button variant={period === "ultimoMes" ? "default" : "outline"} size="sm" onClick={() => setPeriod("ultimoMes")}>
            Último Mes
          </Button>
          <Button variant={period === "anio" ? "default" : "outline"} size="sm" onClick={() => setPeriod("anio")}>
            Este Año
          </Button>
          <div className="relative">
            <Button 
              variant={period === "personalizado" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Personalizado
              {period === "personalizado" && <X className="h-3 w-3 ml-1" onClick={(e) => { e.stopPropagation(); setPeriod("mes"); }} />}
            </Button>
            {showDatePicker && (
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onApply={handleCustomPeriod}
                onCancel={() => setShowDatePicker(false)}
              />
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Facturación {period === "mes" ? "Diaria" : period === "ultimoMes" ? "Diaria (Mes Anterior)" : "Mensual"}
                </span>
                <Badge variant="outline">
                  {period === "mes" ? "Mayo 2026" : period === "ultimoMes" ? "Abril 2026" : "2026"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={getMonthlyData()} labels={getLabels()} />
              <div className="flex justify-between mt-4 text-sm">
                <div><span className="text-muted-foreground">Total periodo</span><p className="text-xl font-bold">{stats.montoTotal}</p></div>
                <div><span className="text-muted-foreground">Promedio {period === "anio" ? "mensual" : "diario"}</span><p className="text-xl font-bold">{period === "anio" ? "$683K" : "$403K"}</p></div>
                <div><span className="text-muted-foreground">Crecimiento</span><p className="text-xl font-bold text-green-600">+{stats.trendMonto}%</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Facturas</p>
                  <p className="text-2xl font-bold">{stats.totalFacturas}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+{stats.trendTotal}%</span>
                <span className="text-xs text-muted-foreground ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Tasa de Éxito</p>
                  <p className="text-2xl font-bold text-green-600">{stats.tasaExito}%</p>
                </div>
                <Percent className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+{stats.trendExito}%</span>
                <span className="text-xs text-muted-foreground ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Facturas Rechazadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.facturasRechazadas}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-500">{stats.trendRechazos}%</span>
                <span className="text-xs text-muted-foreground ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Monto Total</p>
                  <p className="text-2xl font-bold">{stats.montoTotal}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+{stats.trendMonto}%</span>
                <span className="text-xs text-muted-foreground ml-1">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional reports */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Top Motivos de Rechazo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart data={rejectionData} labels={rejectionLabels} color="red" />
              <div className="mt-4 space-y-2">
                {rejectionLabels.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{item}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{rejectionData[i]}%</span>
                      <div className="h-1.5 bg-muted rounded-full w-24">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${(rejectionData[i] / maxRejection) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Rendimiento por Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientData.map((client, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm">{client.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{client.success}%</span>
                    <div className="h-1.5 bg-muted rounded-full w-32">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${client.success}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Resumen del período personalizado */}
        {period === "personalizado" && startDate && endDate && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Resumen del Período Personalizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    📅 {new Date(startDate).toLocaleDateString('es-CL')} - {new Date(endDate).toLocaleDateString('es-CL')}
                  </Badge>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Días</p>
                    <p className="text-lg font-bold">{Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Facturas/día</p>
                    <p className="text-lg font-bold">~412</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Tasa éxito</p>
                    <p className="text-lg font-bold text-green-600">86.2%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}