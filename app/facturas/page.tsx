"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  User,
  X,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"

interface Invoice {
  id: string
  number: string
  client: string
  amount: number
  date: string
  status: "aceptada" | "rechazada" | "pendiente"
  reason?: string
}

const invoices: Invoice[] = [
  { id: "1", number: "F-2026-001", client: "Latam", amount: 1250000, date: "2026-05-05", status: "aceptada" },
  { id: "2", number: "F-2026-002", client: "Global Horizon", amount: 3400000, date: "2026-05-05", status: "aceptada" },
  { id: "3", number: "F-2026-003", client: "TechCorp Chile", amount: 890000, date: "2026-05-04", status: "rechazada", reason: "Formato incorrecto" },
  { id: "4", number: "F-2026-004", client: "Retail Solutions", amount: 2100000, date: "2026-05-04", status: "aceptada" },
  { id: "5", number: "F-2026-005", client: "Latam", amount: 5670000, date: "2026-05-03", status: "pendiente" },
  { id: "6", number: "F-2026-006", client: "Global Horizon", amount: 890000, date: "2026-05-03", status: "rechazada", reason: "Sin firma digital" },
  { id: "7", number: "F-2026-007", client: "TechCorp Chile", amount: 3450000, date: "2026-05-02", status: "aceptada" },
  { id: "8", number: "F-2026-008", client: "Retail Solutions", amount: 1230000, date: "2026-05-02", status: "aceptada" },
  { id: "9", number: "F-2026-009", client: "Latam", amount: 2340000, date: "2026-05-01", status: "aceptada" },
  { id: "10", number: "F-2026-010", client: "Global Horizon", amount: 4560000, date: "2026-04-30", status: "rechazada", reason: "Monto incorrecto" },
  { id: "11", number: "F-2026-011", client: "TechCorp Chile", amount: 789000, date: "2026-04-30", status: "aceptada" },
  { id: "12", number: "F-2026-012", client: "Retail Solutions", amount: 3450000, date: "2026-04-29", status: "pendiente" },
]

const statusConfig = {
  aceptada: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20", label: "Aceptada" },
  rechazada: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20", label: "Rechazada" },
  pendiente: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/20", label: "Pendiente" },
}

const clients = ["Todos", "Latam", "Global Horizon", "TechCorp Chile", "Retail Solutions"]

export default function FacturasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState<string>("todos")
  const [filterClient, setFilterClient] = useState<string>("Todos")
  const [filterDateFrom, setFilterDateFrom] = useState<string>("")
  const [filterDateTo, setFilterDateTo] = useState<string>("")
  const [filterAmountMin, setFilterAmountMin] = useState<string>("")
  const [filterAmountMax, setFilterAmountMax] = useState<string>("")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Aplicar todos los filtros
  const filteredInvoices = invoices.filter(invoice => {
    // Búsqueda por texto
    const matchesSearch = searchTerm === "" || 
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtro por estado
    const matchesStatus = filterStatus === "todos" || invoice.status === filterStatus
    
    // Filtro por cliente
    const matchesClient = filterClient === "Todos" || invoice.client === filterClient
    
    // Filtro por fecha desde
    const matchesDateFrom = !filterDateFrom || invoice.date >= filterDateFrom
    
    // Filtro por fecha hasta
    const matchesDateTo = !filterDateTo || invoice.date <= filterDateTo
    
    // Filtro por monto mínimo
    const matchesAmountMin = !filterAmountMin || invoice.amount >= parseInt(filterAmountMin)
    
    // Filtro por monto máximo
    const matchesAmountMax = !filterAmountMax || invoice.amount <= parseInt(filterAmountMax)
    
    return matchesSearch && matchesStatus && matchesClient && matchesDateFrom && 
           matchesDateTo && matchesAmountMin && matchesAmountMax
  })

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm("")
    setFilterStatus("todos")
    setFilterClient("Todos")
    setFilterDateFrom("")
    setFilterDateTo("")
    setFilterAmountMin("")
    setFilterAmountMax("")
  }

  // Verificar si hay filtros activos
  const hasActiveFilters = filterStatus !== "todos" || filterClient !== "Todos" || 
    filterDateFrom !== "" || filterDateTo !== "" || filterAmountMin !== "" || filterAmountMax !== ""

  // Exportar a Excel
  const handleExportToExcel = () => {
    const exportData = filteredInvoices.map(inv => ({
      "N° Factura": inv.number,
      "Cliente": inv.client,
      "Fecha": inv.date,
      "Monto": inv.amount,
      "Estado": statusConfig[inv.status].label,
      "Motivo Rechazo": inv.reason || "-"
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas")
    
    const fileName = `facturas_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const stats = {
    total: filteredInvoices.length,
    aceptadas: filteredInvoices.filter(i => i.status === "aceptada").length,
    rechazadas: filteredInvoices.filter(i => i.status === "rechazada").length,
    pendientes: filteredInvoices.filter(i => i.status === "pendiente").length,
    montoTotal: filteredInvoices.reduce((sum, i) => sum + i.amount, 0),
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Gestión de Facturas</h1>
          <p className="text-sm text-muted-foreground">Visualiza y gestiona todas las facturas electrónicas</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Facturas</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Aceptadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.aceptadas}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rechazadas}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Monto Total</p>
                  <p className="text-2xl font-bold">${(stats.montoTotal / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant={hasActiveFilters ? "default" : "outline"} className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {Object.values({filterStatus, filterClient, filterDateFrom, filterDateTo, filterAmountMin, filterAmountMax}).filter(v => v && v !== "todos" && v !== "Todos").length}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Estado</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="aceptada">Aceptadas</SelectItem>
                      <SelectItem value="rechazada">Rechazadas</SelectItem>
                      <SelectItem value="pendiente">Pendientes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-medium mb-1 block">Cliente</label>
                  <Select value={filterClient} onValueChange={setFilterClient}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client} value={client}>{client}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Fecha desde</label>
                    <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Fecha hasta</label>
                    <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Monto mínimo</label>
                    <Input type="number" placeholder="$0" value={filterAmountMin} onChange={(e) => setFilterAmountMin(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Monto máximo</label>
                    <Input type="number" placeholder="$∞" value={filterAmountMax} onChange={(e) => setFilterAmountMax(e.target.value)} />
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                  <X className="h-3 w-3 mr-1" />
                  Limpiar filtros
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="icon" onClick={handleExportToExcel}>
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filterStatus !== "todos" && (
              <Badge variant="secondary" className="gap-1">
                Estado: {statusConfig[filterStatus as keyof typeof statusConfig]?.label || filterStatus}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStatus("todos")} />
              </Badge>
            )}
            {filterClient !== "Todos" && (
              <Badge variant="secondary" className="gap-1">
                Cliente: {filterClient}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterClient("Todos")} />
              </Badge>
            )}
            {filterDateFrom && (
              <Badge variant="secondary" className="gap-1">
                Desde: {filterDateFrom}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterDateFrom("")} />
              </Badge>
            )}
            {filterDateTo && (
              <Badge variant="secondary" className="gap-1">
                Hasta: {filterDateTo}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterDateTo("")} />
              </Badge>
            )}
            {filterAmountMin && (
              <Badge variant="secondary" className="gap-1">
                Monto ≥ ${parseInt(filterAmountMin).toLocaleString()}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterAmountMin("")} />
              </Badge>
            )}
            {filterAmountMax && (
              <Badge variant="secondary" className="gap-1">
                Monto ≤ ${parseInt(filterAmountMax).toLocaleString()}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterAmountMax("")} />
              </Badge>
            )}
          </div>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Factura</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron facturas con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const config = statusConfig[invoice.status]
                    const Icon = config.icon
                    return (
                      <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{invoice.number}</TableCell>
                        <TableCell>{invoice.client}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1", config.bg, config.color)} variant="outline">
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Detail Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Factura</DialogTitle>
            <DialogDescription>{selectedInvoice?.number}</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="font-medium flex items-center gap-1"><User className="h-3 w-3" /> {selectedInvoice.client}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-medium flex items-center gap-1"><Calendar className="h-3 w-3" /> {selectedInvoice.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monto</p>
                  <p className="font-medium text-lg">${selectedInvoice.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge className={cn("gap-1", statusConfig[selectedInvoice.status].bg)} variant="outline">
                    {statusConfig[selectedInvoice.status].label}
                  </Badge>
                </div>
              </div>
              {selectedInvoice.reason && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3">
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Motivo de rechazo: {selectedInvoice.reason}
                  </p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Cerrar</Button>
                {selectedInvoice.status === "rechazada" && (
                  <Button>Reintentar</Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}