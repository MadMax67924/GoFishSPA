"use client";

import { useCountdown } from '@/hooks/use-countdown';

interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
  className?: string;
}

export function CountdownTimer({ targetDate, title = "¡Oferta por tiempo limitado!", className = "" }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded-lg p-4 text-center ${className}`}>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <span className="text-lg font-semibold">¡Oferta expirada!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 shadow-lg ${className}`}>
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg font-bold">{title}</span>
        </div>
      </div>
      
      <div className="flex justify-center items-center gap-4">
        <div className="text-center">
          <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
            <div className="text-2xl font-bold">{days.toString().padStart(2, '0')}</div>
            <div className="text-xs uppercase tracking-wide">Días</div>
          </div>
        </div>
        
        <div className="text-2xl font-bold">:</div>
        
        <div className="text-center">
          <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
            <div className="text-2xl font-bold">{hours.toString().padStart(2, '0')}</div>
            <div className="text-xs uppercase tracking-wide">Horas</div>
          </div>
        </div>
        
        <div className="text-2xl font-bold">:</div>
        
        <div className="text-center">
          <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
            <div className="text-2xl font-bold">{minutes.toString().padStart(2, '0')}</div>
            <div className="text-xs uppercase tracking-wide">Min</div>
          </div>
        </div>
        
        <div className="text-2xl font-bold">:</div>
        
        <div className="text-center">
          <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
            <div className="text-2xl font-bold">{seconds.toString().padStart(2, '0')}</div>
            <div className="text-xs uppercase tracking-wide">Seg</div>
          </div>
        </div>
      </div>
    </div>
  );
}