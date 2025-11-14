// Utilidades para cálculos de órdenes recurrentes
import type { RecurringOrderConfig } from "@/types/recurring-orders"

export function calculateNextOrderDate(
  startDate: string, 
  intervalMonths: number, 
  cyclesCompleted: number
): string {
  const date = new Date(startDate)
  date.setMonth(date.getMonth() + (intervalMonths * (cyclesCompleted + 1)))
  return date.toISOString().split('T')[0]
}

export function validateRecurringConfig(config: RecurringOrderConfig): string | null {
  if (!config.isRecurring) return null

  if (config.intervalMonths < 1 || config.intervalMonths > 12) {
    return "El intervalo debe estar entre 1 y 12 meses"
  }

  if (config.totalDurationMonths < config.intervalMonths) {
    return "La duración total debe ser mayor o igual al intervalo"
  }

  if (config.totalDurationMonths > 24) {
    return "La duración máxima es de 24 meses"
  }

  const totalCycles = Math.floor(config.totalDurationMonths / config.intervalMonths)
  if (totalCycles < 1) {
    return "Debe haber al menos 1 ciclo de compra"
  }

  return null
}

export function getRecurringDescription(config: RecurringOrderConfig): string {
  if (!config.isRecurring) return "Compra única"

  const totalCycles = Math.floor(config.totalDurationMonths / config.intervalMonths)
  return `Recurrente: ${totalCycles} compras cada ${config.intervalMonths} mes(es) por ${config.totalDurationMonths} meses`
}