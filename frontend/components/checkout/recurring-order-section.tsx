"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Info } from "lucide-react"
import type { RecurringOrderConfig } from "@/types/recurring-orders"

interface RecurringOrderSectionProps {
  onConfigChange: (config: RecurringOrderConfig) => void
  disabled?: boolean
}

export default function RecurringOrderSection({ 
  onConfigChange, 
  disabled = false 
}: RecurringOrderSectionProps) {
  const [isRecurring, setIsRecurring] = useState(false)
  const [intervalMonths, setIntervalMonths] = useState(1)
  const [totalDurationMonths, setTotalDurationMonths] = useState(6)

  // Calcular ciclos totales
  const totalCycles = Math.floor(totalDurationMonths / intervalMonths)

  useEffect(() => {
    const config: RecurringOrderConfig = {
      isRecurring,
      intervalMonths: isRecurring ? intervalMonths : 0,
      totalDurationMonths: isRecurring ? totalDurationMonths : 0,
      startDate: new Date().toISOString().split('T')[0],
      totalCycles: isRecurring ? totalCycles : 0
    }
    onConfigChange(config)
  }, [isRecurring, intervalMonths, totalDurationMonths, totalCycles, onConfigChange])

  if (disabled) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔄 Compra Recurrente</span>
          <Info className="h-4 w-4 text-gray-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="recurring-toggle" className="text-base cursor-pointer">
            <input
              id="recurring-toggle"
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            Activar compra recurrente
          </Label>
        </div>

        {isRecurring && (
          <div className="space-y-4 pl-4 border-l-2 border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interval-months">
                  Intervalo (meses)
                </Label>
                <Input
                  id="interval-months"
                  type="number"
                  min="1"
                  max="12"
                  value={intervalMonths}
                  onChange={(e) => setIntervalMonths(Number(e.target.value))}
                  placeholder="Cada cuántos meses"
                />
                <p className="text-xs text-gray-500">
                  Ej: 2 = cada 2 meses
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-duration">
                  Duración total (meses)
                </Label>
                <Input
                  id="total-duration"
                  type="number"
                  min="1"
                  max="24"
                  value={totalDurationMonths}
                  onChange={(e) => setTotalDurationMonths(Number(e.target.value))}
                  placeholder="Por cuántos meses"
                />
                <p className="text-xs text-gray-500">
                  Ej: 6 = durante 6 meses
                </p>
              </div>
            </div>

            {/* Resumen de la configuración */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Resumen:</h4>
              <p className="text-sm text-blue-700">
                Se realizarán <strong>{totalCycles} compras</strong> automáticas
                cada <strong>{intervalMonths} mes(es)</strong> durante{' '}
                <strong>{totalDurationMonths} meses</strong>.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                💡 Solo disponible con WebPay. El pago se procesará automáticamente en cada ciclo.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}