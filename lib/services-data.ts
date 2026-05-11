export type ServiceStatus = "success" | "warning" | "error"

export interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: "info" | "success" | "warning" | "error"
}

export interface Client {
  id: string
  name: string
  status: ServiceStatus
  errorPercentage: number
}

export interface Service {
  id: string
  name: string
  description: string
  errorPercentage: number
  status: ServiceStatus
  clients: Client[]
  logs: LogEntry[]
}

export const services: Service[] = [
  {
    id: "1",
    name: "Aceptación y Rechazo de Facturas",
    description: "El proyecto tiene como objetivo automatizar el flujo de aceptación y rechazo de facturas electrónicas registradas en el Servicio de Impuestos Internos (SII) de Chile. Mediante un sistema modular, se gestionan los documentos pendientes, se extrae la información relevante y se procesan automáticamente según las reglas de negocio definidas.",
    errorPercentage: 0,
    status: "success",
    clients: [
      { id: "c1", name: "Latam", status: "success", errorPercentage: 0 },
      { id: "c2", name: "Global Horizon", status: "success", errorPercentage: 0 },
      { id: "c3", name: "TechCorp Chile", status: "success", errorPercentage: 0 },
      { id: "c4", name: "Retail Solutions", status: "success", errorPercentage: 0 },
    ],
    logs: [
      { id: "l1", timestamp: "2026-04-28 10:30:00", message: "SE ACEPTÓ LA FACTURA #12345", type: "success" },
      { id: "l2", timestamp: "2026-04-28 10:28:00", message: "Se ingresó en el SII correctamente", type: "info" },
      { id: "l3", timestamp: "2026-04-28 10:25:00", message: "Se envió reporte de procesamiento", type: "success" },
      { id: "l4", timestamp: "2026-04-28 10:20:00", message: "Factura #12344 procesada exitosamente", type: "success" },
    ],
  },
  {
    id: "2",
    name: "Saldos Bancarios",
    description: "Sistema automatizado para la consulta y consolidación de saldos bancarios de múltiples instituciones financieras. Permite obtener información actualizada de cuentas corrientes, cuentas de ahorro y líneas de crédito de forma centralizada.",
    errorPercentage: 0,
    status: "success",
    clients: [
      { id: "c5", name: "Banco Nacional", status: "success", errorPercentage: 0 },
      { id: "c6", name: "Finanzas Corp", status: "success", errorPercentage: 0 },
      { id: "c7", name: "Inversiones SA", status: "success", errorPercentage: 0 },
    ],
    logs: [
      { id: "l5", timestamp: "2026-04-28 10:15:00", message: "Saldos actualizados correctamente", type: "success" },
      { id: "l6", timestamp: "2026-04-28 10:10:00", message: "Conexión establecida con API bancaria", type: "info" },
    ],
  },
  {
    id: "3",
    name: "Finiquitos",
    description: "Gestión automatizada del proceso de finiquitos laborales, incluyendo cálculo de indemnizaciones, generación de documentos legales y notificaciones a las partes involucradas.",
    errorPercentage: 0,
    status: "success",
    clients: [
      { id: "c8", name: "RRHH Solutions", status: "success", errorPercentage: 0 },
      { id: "c9", name: "PeopleFirst", status: "success", errorPercentage: 0 },
    ],
    logs: [
      { id: "l7", timestamp: "2026-04-28 09:45:00", message: "Finiquito procesado correctamente", type: "success" },
      { id: "l8", timestamp: "2026-04-28 09:40:00", message: "Documentos generados exitosamente", type: "success" },
    ],
  },
  {
    id: "4",
    name: "Cuentas Básicas",
    description: "Sistema de gestión de cuentas básicas bancarias que permite la apertura, modificación y cierre de cuentas de manera automatizada, cumpliendo con la normativa vigente.",
    errorPercentage: 2,
    status: "warning",
    clients: [
      { id: "c10", name: "MicroBank", status: "success", errorPercentage: 0 },
      { id: "c11", name: "Banco Popular", status: "warning", errorPercentage: 3 },
      { id: "c12", name: "FinTech Solutions", status: "success", errorPercentage: 0 },
    ],
    logs: [
      { id: "l9", timestamp: "2026-04-28 10:00:00", message: "Error de validación en cuenta #7890", type: "warning" },
      { id: "l10", timestamp: "2026-04-28 09:55:00", message: "Cuenta básica creada exitosamente", type: "success" },
      { id: "l11", timestamp: "2026-04-28 09:50:00", message: "Timeout en conexión con Banco Popular", type: "warning" },
    ],
  },
  {
    id: "5",
    name: "DTE",
    description: "Sistema de Documentos Tributarios Electrónicos que gestiona la emisión, recepción y almacenamiento de facturas, boletas, notas de crédito y débito electrónicas según normativa SII.",
    errorPercentage: 85,
    status: "error",
    clients: [
      { id: "c13", name: "Comercial ABC", status: "error", errorPercentage: 90 },
      { id: "c14", name: "Distribuidora XYZ", status: "error", errorPercentage: 85 },
      { id: "c15", name: "Importadora Sur", status: "warning", errorPercentage: 15 },
    ],
    logs: [
      { id: "l12", timestamp: "2026-04-28 10:05:00", message: "Error crítico: No se pudo conectar con SII", type: "error" },
      { id: "l13", timestamp: "2026-04-28 10:03:00", message: "Fallo en la firma electrónica", type: "error" },
      { id: "l14", timestamp: "2026-04-28 10:01:00", message: "Error de timeout en servidor", type: "error" },
      { id: "l15", timestamp: "2026-04-28 09:58:00", message: "Certificado digital expirado", type: "error" },
      { id: "l16", timestamp: "2026-04-28 09:55:00", message: "Error de validación XML", type: "error" },
    ],
  },
  {
    id: "6",
    name: "Contabilización",
    description: "Automatización del proceso de contabilización de documentos tributarios, incluyendo asientos contables, cuadratura de cuentas y generación de reportes financieros.",
    errorPercentage: 2,
    status: "warning",
    clients: [
      { id: "c16", name: "Contadores Asociados", status: "success", errorPercentage: 0 },
      { id: "c17", name: "Auditoría Global", status: "warning", errorPercentage: 5 },
      { id: "c18", name: "Finanzas Pro", status: "success", errorPercentage: 0 },
    ],
    logs: [
      { id: "l17", timestamp: "2026-04-28 10:10:00", message: "Asiento contable registrado", type: "success" },
      { id: "l18", timestamp: "2026-04-28 10:08:00", message: "Error menor en cuadratura", type: "warning" },
      { id: "l19", timestamp: "2026-04-28 10:05:00", message: "Reporte mensual generado", type: "success" },
    ],
  },
  {
    id: "7",
    name: "Notas de Crédito",
    description: "Sistema automatizado para la emisión y gestión de notas de crédito electrónicas. Permite anular o modificar facturas emitidas, gestionar devoluciones y mantener el registro actualizado ante el SII.",
    errorPercentage: 0,
    status: "success",
    clients: [
      { id: "c19", name: "Comercial del Norte", status: "success", errorPercentage: 0 },
      { id: "c20", name: "Distribuidora Central", status: "success", errorPercentage: 0 },
      { id: "c21", name: "Mayorista Express", status: "success", errorPercentage: 0 },
      { id: "c22", name: "RetailMax", status: "success", errorPercentage: 0 },
    ],
    logs: [
      { id: "l20", timestamp: "2026-04-28 10:25:00", message: "Nota de crédito #NC-4521 emitida correctamente", type: "success" },
      { id: "l21", timestamp: "2026-04-28 10:20:00", message: "Documento enviado al SII exitosamente", type: "success" },
      { id: "l22", timestamp: "2026-04-28 10:15:00", message: "Validación de factura original completada", type: "info" },
      { id: "l23", timestamp: "2026-04-28 10:10:00", message: "Nota de crédito #NC-4520 procesada", type: "success" },
    ],
  },
]

export function getStatusFromPercentage(percentage: number): ServiceStatus {
  if (percentage === 0) return "success"
  if (percentage <= 10) return "warning"
  return "error"
}

export function getStatusLabel(status: ServiceStatus): string {
  switch (status) {
    case "success":
      return "Funciona al 100% sin ningún error"
    case "warning":
      return "Tiene como mínimo 1 o 2 errores"
    case "error":
      return "Tiene varios errores que impiden que funcione"
  }
}
