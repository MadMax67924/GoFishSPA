'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';

interface QuoteButtonProps {
  productId: number;
  productName: string;
}

interface QuoteData {
  productName: string;
  estimatedPrice: number;
  priceRange: { min: number; max: number };
  confidence: 'alta' | 'media' | 'baja';
  lastPrice: number;
  historicalPrices: number;
  message: string;
}

export default function QuoteButton({ productId, productName }: QuoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuote = async () => {
    setLoading(true);
    setError(null);
    setIsOpen(true);

    try {
      const response = await fetch(`/api/products/${productId}/quote`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener cotización');
      }

      setQuote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'alta': return 'text-green-600';
      case 'media': return 'text-yellow-600';
      case 'baja': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'alta': return '🟢';
      case 'media': return '🟡';
      case 'baja': return '🔴';
      default: return '⚪';
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={handleQuote}
        className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <Calculator className="w-4 h-4" />
        Solicitar Cotización
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center" onClick={() => setIsOpen(false)}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Cotización de Precio</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-blue-400 hover:text-blue-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Calculando cotización...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-red-600 font-medium">Error interno del servidor</div>
              <p className="text-red-500 text-sm mt-1">Intenta nuevamente en unos momentos</p>
            </div>
          ) : quote ? (
            <>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">{quote.productName}</h4>
                <p className="text-gray-600 text-sm">Estimación basada en historial de precios</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-sm text-blue-600 font-medium">Precio Estimado</div>
                    <div className="text-2xl font-bold text-blue-900">
                      ${quote.estimatedPrice.toLocaleString('es-CL')}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 ${getConfidenceColor(quote.confidence)}`}>
                    {getConfidenceIcon(quote.confidence)} Confianza {quote.confidence}
                  </div>
                </div>
                
                <div className="text-blue-700 text-sm mt-2">
                  Rango: ${quote.priceRange.min.toLocaleString('es-CL')} - ${quote.priceRange.max.toLocaleString('es-CL')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Último precio:</div>
                  <div className="font-medium">${quote.lastPrice.toLocaleString('es-CL')}</div>
                </div>
                <div>
                  <div className="text-gray-500">Registros históricos:</div>
                  <div className="font-medium">{quote.historicalPrices}</div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-yellow-800 text-sm">
                  <strong>Nota:</strong> Esta es una estimación basada en precios históricos. 
                  El precio final puede variar según disponibilidad y condiciones del mercado.
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="border-t p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}