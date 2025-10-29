"use client";

import { CountdownTimer } from '@/components/ui/countdown-timer';
import { Badge } from '@/components/ui/badge';
import { Percent } from 'lucide-react';
import Link from 'next/link';

interface PromotionBannerProps {
  productName: string;
  originalPrice: number;
  discountPrice: number;
  endDate: Date;
  discountPercentage: number;
  productId?: string; // Opcional para hacer el banner clickeable
}

export function PromotionBanner({ 
  productName, 
  originalPrice, 
  discountPrice, 
  endDate, 
  discountPercentage,
  productId // Quitar el valor por defecto aquí
}: PromotionBannerProps) {
  const BannerContent = () => (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Información de la promoción */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
            <Badge variant="destructive" className="text-lg px-3 py-1">
              <Percent className="w-4 h-4 mr-1" />
              {discountPercentage}% OFF
            </Badge>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            ¡{productName} en Promoción Especial!
          </h3>
          
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
            <span className="text-2xl font-bold text-green-600">
              ${discountPrice.toLocaleString('es-CL')}
            </span>
            <span className="text-lg text-gray-500 line-through">
              ${originalPrice.toLocaleString('es-CL')}
            </span>
          </div>
          
          <p className="text-gray-600">
            Ahorra ${(originalPrice - discountPrice).toLocaleString('es-CL')} en tu compra
          </p>
          
          {/* Enlace para ver el producto - solo si hay productId */}
          {productId && (
            <div className="mt-3">
              <span className="text-blue-600 text-sm font-medium hover:underline cursor-pointer">
                👆 Haz clic para ver el producto
              </span>
            </div>
          )}
        </div>
        
        {/* Temporizador */}
        <div className="flex-shrink-0">
          <CountdownTimer 
            targetDate={endDate}
            title="¡Promoción termina en!"
            className="max-w-md"
          />
        </div>
      </div>
    </div>
  );

  // Si hay productId, hacer el banner clickeable
  if (productId) {
    return (
      <Link href={`/productos/${productId}`} className="block">
        <BannerContent />
      </Link>
    );
  }

  // Si no hay productId, mostrar el banner sin enlace
  return <BannerContent />;
}