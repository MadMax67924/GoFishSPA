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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Cotización de Precio</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Estimación basada en historial de precios
          </p>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Calculando estimación...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md mb-4">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {quote && !loading && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900">{quote.productName}</h4>
                <p className="text-sm text-gray-600 mt-1">{quote.message}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Precio Estimado</span>
                  <span className={`text-xs font-medium ${getConfidenceColor(quote.confidence)}`}>
                    {getConfidenceIcon(quote.confidence)} Confianza {quote.confidence}
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  ${quote.estimatedPrice.toLocaleString('es-CL')}
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Rango: ${quote.priceRange.min.toLocaleString('es-CL')} - ${quote.priceRange.max.toLocaleString('es-CL')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-gray-600">Último precio:</span>
                  <div className="font-semibold">${quote.lastPrice.toLocaleString('es-CL')}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-gray-600">Registros históricos:</span>
                  <div className="font-semibold">{quote.historicalPrices}</div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>Nota:</strong> Esta es una estimación basada en precios históricos. 
                  El precio final puede variar según disponibilidad y condiciones del mercado.
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    window.open(`https://wa.me/56912345678?text=Hola, me interesa cotizar ${quote.productName}`, '_blank');
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Contactar por WhatsApp
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}