import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { formatEth } from '@/lib/utils';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, Tag, ShieldCheck } from 'lucide-react';

interface CartPageProps {
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
    couponCode,
    setCouponCode,
    quote,
    quoteError,
    refreshQuote,
    applyCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState(couponCode);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponLoading(true);
    await applyCoupon(inputCoupon.trim());
    setCouponLoading(false);
  };

  const handleRemoveCoupon = async () => {
    setInputCoupon('');
    await applyCoupon('');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center" data-testid="cart-loading">
        <p className="text-sm text-text-muted">Carregando seu carrinho...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-6" data-testid="empty-cart-state">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface-card border border-border text-text-muted">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-text-primary">
            Seu Carrinho está Vazio
          </h2>
          <p className="text-xs text-text-secondary">
            Você ainda não adicionou nenhum NFT à sua coleção. Explore o catálogo para encontrar itens exclusivos!
          </p>
        </div>
        <Button variant="primary" onClick={() => onNavigate('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Explorar Catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
            Carrinho de NFTs
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Revise os itens selecionados antes de avançar para o pagamento seguro.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-status-error hover:underline"
        >
          Limpar Carrinho
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items List */}
        <div className="lg:col-span-7 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-4 transition-colors hover:border-border-soft"
              data-testid={`cart-item-${item.nftId}`}
            >
              <img
                src={item.nft.imageUrl}
                alt={item.nft.title}
                className="h-20 w-20 rounded-lg object-cover bg-surface-raised shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold text-secondary truncate">
                  {item.nft.collection}
                </p>
                <h3 className="text-sm font-bold text-text-primary truncate">
                  {item.nft.title}
                </h3>
                <p className="text-xs font-semibold text-primary mt-1">
                  {formatEth(item.nft.priceEth)} cada
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center rounded-lg border border-border bg-surface-raised">
                <button
                  onClick={() => updateQuantity(item.nftId, item.quantity - 1)}
                  className="h-7 w-7 text-xs font-bold text-text-secondary hover:text-text-primary"
                  aria-label="Diminuir quantidade"
                >
                  -
                </button>
                <span className="w-7 text-center text-xs font-bold text-text-primary">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.nftId, item.quantity + 1)}
                  disabled={item.quantity >= item.nft.availableEditions}
                  className="h-7 w-7 text-xs font-bold text-text-secondary hover:text-text-primary disabled:opacity-30"
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.nftId)}
                className="p-2 text-text-muted hover:text-status-error transition-colors"
                aria-label={`Remover ${item.nft.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Right Column: Quote Summary & Checkout CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-border bg-surface-card p-6 space-y-6">
            <h2 className="text-base font-bold text-text-primary border-b border-border pb-3">
              Resumo do Pedido
            </h2>

            {/* Coupon Code Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                Cupom de Desconto
              </label>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: JUNGLE10, GREEN20"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                  className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs uppercase text-text-primary placeholder:normal-case focus:border-primary focus:outline-none"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="secondary"
                  isLoading={couponLoading}
                  className="text-xs px-3"
                  data-testid="apply-coupon-button"
                >
                  Aplicar
                </Button>
              </form>

              {quote?.couponApplied && (
                <div className="flex items-center justify-between rounded-lg bg-status-success/10 border border-status-success/30 px-3 py-1.5 text-xs text-status-success">
                  <span>
                    Cupom <strong>{quote.couponApplied.code}</strong> aplicado ({quote.couponApplied.discountPercent}% OFF)
                  </span>
                  <button
                    onClick={handleRemoveCoupon}
                    className="font-bold hover:underline"
                  >
                    Remover
                  </button>
                </div>
              )}

              {quoteError && (
                <p className="text-xs text-status-error font-medium" role="alert">
                  {quoteError}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 border-t border-border pt-4 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span className="font-semibold text-text-primary">
                  {quote ? formatEth(quote.subtotalEth) : 'Calculando...'}
                </span>
              </div>

              {quote && parseFloat(quote.discountEth) > 0 && (
                <div className="flex justify-between text-status-success">
                  <span>Desconto ({quote.couponApplied?.discountPercent}%)</span>
                  <span className="font-semibold">
                    -{formatEth(quote.discountEth)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-text-secondary">
                <span>Taxa de Rede Estimada (Gas)</span>
                <span className="font-semibold text-text-primary">
                  {quote ? formatEth(quote.networkFeeEth) : '0.0050 ETH'}
                </span>
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-text-primary">Total Estimado</span>
                  <p className="text-[10px] text-text-muted">Valores em ETH com precisão decimal</p>
                </div>
                <span className="text-xl font-extrabold text-primary" data-testid="cart-total-eth">
                  {quote ? formatEth(quote.totalEth) : '...'}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('/checkout')}
              className="w-full gap-2 text-sm shadow-lg shadow-primary/20"
              data-testid="proceed-to-checkout"
            >
              <span>Avançar para o Pagamento</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Transação segura e contratos verificados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
