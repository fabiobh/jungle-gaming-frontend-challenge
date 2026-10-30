import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Nft, QuoteResponse, NftUpdatedEvent } from '@/types';
import { apiClient } from '@/lib/axios';
import { socketClient } from '@/lib/socket';

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  couponCode: string;
  setCouponCode: (code: string) => void;
  quote: QuoteResponse | null;
  quoteError: string | null;
  priceAlert: string | null;
  clearPriceAlert: () => void;
  addToCart: (nft: Nft, quantity?: number) => Promise<void>;
  updateQuantity: (nftId: string, quantity: number) => Promise<void>;
  removeFromCart: (nftId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshQuote: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [priceAlert, setPriceAlert] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      const res = await apiClient.get<CartItem[]>('/cart');
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateQuote = useCallback(async () => {
    if (items.length === 0) {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    try {
      setQuoteError(null);
      const res = await apiClient.post<QuoteResponse>('/quote', {
        items: items.map((i) => ({ nftId: i.nftId, quantity: i.quantity })),
        couponCode: couponCode || undefined,
      });
      setQuote(res.data);
    } catch (err: any) {
      setQuoteError(err.response?.data?.message || 'Erro ao calcular cotação');
      setQuote(null);
    }
  }, [items, couponCode]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    calculateQuote();
  }, [calculateQuote]);

  // Real-time listener for price and availability updates
  useEffect(() => {
    const unsubscribe = socketClient.on<NftUpdatedEvent>('nft.updated', (event) => {
      setItems((prev) => {
        const found = prev.find((item) => item.nftId === event.id);
        if (!found) return prev;

        const oldPrice = found.nft.priceEth;
        const priceChanged = oldPrice !== event.priceEth;
        const stockChanged = found.quantity > event.availableEditions;

        if (priceChanged || stockChanged) {
          let alertMsg = `Atenção: O NFT "${found.nft.title}" foi atualizado em tempo real! `;
          if (priceChanged) alertMsg += `Preço alterado de ${oldPrice} para ${event.priceEth} ETH. `;
          if (stockChanged) alertMsg += `Estoque reduzido para ${event.availableEditions} edições.`;
          setPriceAlert(alertMsg);
        }

        return prev.map((item) => {
          if (item.nftId !== event.id) return item;
          return {
            ...item,
            quantity: Math.min(item.quantity, Math.max(1, event.availableEditions)),
            nft: {
              ...item.nft,
              priceEth: event.priceEth,
              availableEditions: event.availableEditions,
              version: event.version,
            },
          };
        });
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addToCart = async (nft: Nft, quantity = 1) => {
    const existing = items.find((i) => i.nftId === nft.id);
    const newQty = existing ? existing.quantity + quantity : quantity;

    await apiClient.post('/cart', {
      nftId: nft.id,
      quantity: newQty,
    });
    await fetchCart();
  };

  const updateQuantity = async (nftId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(nftId);
      return;
    }
    await apiClient.post('/cart', { nftId, quantity });
    await fetchCart();
  };

  const removeFromCart = async (nftId: string) => {
    await apiClient.delete(`/cart/${nftId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await apiClient.delete('/cart');
    setItems([]);
    setQuote(null);
    setPriceAlert(null);
  };

  const applyCoupon = async (code: string) => {
    setCouponCode(code);
    if (items.length === 0) return;
    try {
      setQuoteError(null);
      const res = await apiClient.post<QuoteResponse>('/quote', {
        items: items.map((i) => ({ nftId: i.nftId, quantity: i.quantity })),
        couponCode: code || undefined,
      });
      setQuote(res.data);
    } catch (err: any) {
      setQuoteError(err.response?.data?.message || 'Erro ao calcular cotação');
      setQuote(null);
    }
  };

  const refreshQuote = async () => {
    await calculateQuote();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        couponCode,
        setCouponCode,
        quote,
        quoteError,
        priceAlert,
        clearPriceAlert: () => setPriceAlert(null),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshQuote,
        applyCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser utilizado dentro de CartProvider');
  return ctx;
}
