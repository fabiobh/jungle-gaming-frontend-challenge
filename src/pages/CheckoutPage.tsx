import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatEth } from '@/lib/utils';
import { apiClient } from '@/lib/axios';
import { Wallet, Order } from '@/types';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet as WalletIcon,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { items, quote, couponCode, refreshQuote } = useCart();

  const [selectedNetwork, setSelectedNetwork] = useState<string>('Ethereum');
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string>('');
  const [collectorName, setCollectorName] = useState(user?.name || '');
  const [collectorEmail, setCollectorEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Idempotency Key per checkout attempt
  const [idempotencyKey, setIdempotencyKey] = useState(
    () => `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );

  // Fetch User Wallets
  const { data: wallets = [] } = useQuery<Wallet[]>({
    queryKey: ['wallets'],
    queryFn: async () => {
      const res = await apiClient.get<Wallet[]>('/wallets');
      return res.data;
    },
    enabled: Boolean(user),
  });

  // Default to primary wallet
  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletAddress) {
      const primary = wallets.find((w) => w.isPrimary) || wallets[0];
      setSelectedWalletAddress(primary.address);
      setSelectedNetwork(primary.network);
    }
  }, [wallets, selectedWalletAddress]);

  // Require Auth
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-text-primary">
          Autenticação Necessária
        </h2>
        <p className="text-xs text-text-secondary">
          Faça login ou crie sua conta para prosseguir com o pagamento seguro e associar o NFT à sua carteira.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="secondary" onClick={() => onNavigate('/login')}>
            Fazer Login
          </Button>
          <Button variant="primary" onClick={() => onNavigate('/register')}>
            Criar Conta
          </Button>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-text-primary">Carrinho Vazio</h2>
        <p className="text-xs text-text-secondary">Adicione itens ao carrinho antes do checkout.</p>
        <Button variant="primary" onClick={() => onNavigate('/')}>
          Ir ao Catálogo
        </Button>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    if (!selectedWalletAddress) {
      setErrorMessage('Selecione ou insira uma carteira válida.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Re-validate quote
      await refreshQuote();

      // 2. Submit order with Idempotency-Key
      const res = await apiClient.post<Order>(
        '/orders',
        {
          items: items.map((i) => ({ nftId: i.nftId, quantity: i.quantity })),
          walletAddress: selectedWalletAddress,
          network: selectedNetwork,
          couponCode: couponCode || undefined,
        },
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
        }
      );

      const order = res.data;
      if (order.status === 'confirmed') {
        onNavigate(`/order/${order.id}`);
      } else {
        setErrorMessage(order.errorMessage || 'O pagamento foi recusado pela rede simulada.');
        setIdempotencyKey(`idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Falha ao processar pagamento. Verifique as condições.'
      );
      setIdempotencyKey(`idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 text-left space-y-8">
      <button
        onClick={() => onNavigate('/cart')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar ao Carrinho</span>
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
          Pagamento & Liquidação
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Selecione a carteira de destino e confirme os dados para cunhagem e transferência dos NFTs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Wallets */}
        <div className="lg:col-span-7 space-y-6">
          {/* Collector Details */}
          <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-text-primary border-b border-border pb-3">
              1. Dados do Colecionador
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome Completo"
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                placeholder="Seu nome"
                required
              />
              <Input
                label="E-mail de Notificação"
                type="email"
                value={collectorEmail}
                onChange={(e) => setCollectorEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          {/* Wallet Selection */}
          <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-text-primary border-b border-border pb-3 flex items-center justify-between">
              <span>2. Carteira e Rede Blockchain</span>
              <span className="text-[11px] font-normal text-text-muted">Simulado</span>
            </h2>

            {wallets.length > 0 ? (
              <div className="space-y-2.5">
                {wallets.map((w) => {
                  const isSelected = selectedWalletAddress === w.address;
                  return (
                    <div
                      key={w.id}
                      onClick={() => {
                        setSelectedWalletAddress(w.address);
                        setSelectedNetwork(w.network);
                      }}
                      className={`flex items-center justify-between rounded-lg border p-3.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-surface-raised hover:border-border-soft'
                      }`}
                      data-testid={`wallet-select-${w.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <WalletIcon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                        <div>
                          <p className="font-mono text-xs font-bold text-text-primary">
                            {w.address.substring(0, 10)}...{w.address.substring(34)}
                          </p>
                          <p className="text-[11px] text-text-secondary">
                            Rede: {w.network} • Saldo: {w.balanceEth} ETH
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary">
                  Nenhuma carteira cadastrada. Insira o endereço abaixo:
                </p>
                <Input
                  label="Endereço da Carteira (0x...)"
                  placeholder="0x71C260F0C053A3508C5Fa73d5733f114674681A4"
                  value={selectedWalletAddress}
                  onChange={(e) => setSelectedWalletAddress(e.target.value)}
                />
              </div>
            )}

            {/* Network Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Rede de Liquidação
              </label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="Ethereum">Ethereum Mainnet</option>
                <option value="Polygon">Polygon (Matic)</option>
                <option value="Arbitrum">Arbitrum One</option>
                <option value="Optimism">Optimism</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Submit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-border bg-surface-card p-6 space-y-6">
            <h2 className="text-sm font-bold text-text-primary border-b border-border pb-3">
              Revisão Final
            </h2>

            {/* Items summary */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={item.nft.imageUrl}
                      alt={item.nft.title}
                      className="h-8 w-8 rounded object-cover"
                    />
                    <span className="text-text-primary truncate font-medium">
                      {item.quantity}x {item.nft.title}
                    </span>
                  </div>
                  <span className="font-semibold text-text-secondary shrink-0">
                    {formatEth(parseFloat(item.nft.priceEth) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-border pt-4 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{quote ? formatEth(quote.subtotalEth) : '...'}</span>
              </div>
              {quote && parseFloat(quote.discountEth) > 0 && (
                <div className="flex justify-between text-status-success">
                  <span>Desconto Aplicado</span>
                  <span>-{formatEth(quote.discountEth)}</span>
                </div>
              )}
              <div className="flex justify-between text-text-secondary">
                <span>Taxa de Rede</span>
                <span>{quote ? formatEth(quote.networkFeeEth) : '0.0050 ETH'}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-baseline font-bold">
                <span className="text-sm text-text-primary">Total a Pagar</span>
                <span className="text-lg text-primary" data-testid="checkout-total-eth">
                  {quote ? formatEth(quote.totalEth) : '...'}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-lg bg-status-error/10 border border-status-error/30 p-3 text-xs text-status-error flex items-start gap-2" role="alert">
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              onClick={handleConfirmOrder}
              className="w-full text-sm shadow-lg shadow-primary/20"
              data-testid="confirm-payment-button"
            >
              <span>Confirmar e Pagar Agora</span>
            </Button>

            <p className="text-[10px] text-text-muted text-center leading-relaxed">
              Ao clicar em Confirmar, a chave de idempotência é transmitida para evitar cobranças duplicadas em caso de reconexão.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
