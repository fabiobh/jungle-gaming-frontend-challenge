import React from 'react';
import { useCart } from '@/context/CartContext';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

export const PriceAlertBanner: React.FC = () => {
  const { priceAlert, clearPriceAlert, refreshQuote } = useCart();

  if (!priceAlert) return null;

  return (
    <div
      role="alert"
      className="bg-primary/95 text-white px-4 py-3 shadow-lg flex items-center justify-between text-xs sm:text-sm font-medium z-50 sticky top-20 animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
        <AlertCircle className="h-4 w-4 shrink-0 text-white" />
        <span className="flex-1">{priceAlert}</span>
        <button
          onClick={() => {
            refreshQuote();
            clearPriceAlert();
          }}
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 rounded px-2.5 py-1 text-xs font-bold transition-colors ml-2"
        >
          <RefreshCw className="h-3 w-3" />
          Atualizar Cotação
        </button>
      </div>
      <button
        onClick={clearPriceAlert}
        className="ml-4 text-white/80 hover:text-white focus:outline-none"
        aria-label="Fechar alerta"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
