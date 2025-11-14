// Tipos TypeScript para compras recurrentes
export interface RecurringOrderConfig {
  isRecurring: boolean;
  intervalMonths: number;
  totalDurationMonths: number;
  startDate: string;
  totalCycles: number;
}

export interface RecurringOrder extends RecurringOrderConfig {
  id: string;
  parentOrderId: number;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  nextOrderDate: string;
  cyclesCompleted: number;
  createdAt: string;
}