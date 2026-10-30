import React from 'react';
import { Order } from '@/types';
import { apiClient } from '@/lib/axios';
import { formatEth } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Copy,
} from 'lucide-react';

interface OrderConfirmationPageProps {
  id: string;
  onNavigate: (path: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  id,
  onNavigate,
}) => {
  const { data: order, isLoading, isError } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await apiClient.get<Order>(`/orders/${id}`);
      return res.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-4">
        <p className="text-sm text-text-muted">Carregando recibo do pedido...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-text-primary">Pedido Não Encontrado</h2>
        <p className="text-xs text-text-secondary">Não foi possível recuperar as informações deste recibo.</p>
        <Button variant="primary" onClick={() => onNavigate('/')}>
          Voltar ao Início
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 text-left space-y-8" data-testid="order-receipt">
      {/* Header Result */}
      <div className="rounded-2xl border border-status-success/30 bg-surface-card p-8 text-center space-y-4 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-success/20 text-status-success">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-status-success">
            Transação Concluída com Sucesso
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
            Pedido #{order.id}
          </h1>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            Os NFTs foram transferidos com sucesso para o endereço da sua carteira na rede {order.network}.
          </p>
        </div>
      </div>

      {/* Transaction & Receipt Details */}
      <div className="rounded-xl border border-border bg-surface-card p-6 space-y-6">
        <h2 className="text-sm font-bold text-text-primary border-b border-border pb-3">
          Detalhes da Liquidação
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-text-muted block mb-1">Hash da Transação (TX)</span>
            {order.txHash ? (
              <a
                href={order.explorerUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="font-mono font-semibold text-primary hover:underline flex items-center gap-1 truncate"
                data-testid="order-tx-hash"
              >
                <span>{order.txHash.substring(0, 18)}...{order.txHash.substring(50)}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ) : (
              <span className="text-text-secondary font-mono">Pendente</span>
            )}
          </div>

          <div>
            <span className="text-text-muted block mb-1">Endereço de Destino</span>
            <span className="font-mono font-semibold text-text-primary truncate block">
              {order.walletAddress}
            </span>
          </div>

          <div>
            <span className="text-text-muted block mb-1">Data e Hora</span>
            <span className="text-text-secondary">
              {new Date(order.createdAt).toLocaleString('pt-BR')}
            </span>
          </div>

          <div>
            <span className="text-text-muted block mb-1">Chave de Idempotência</span>
            <span className="font-mono text-text-secondary text-[11px] truncate block">
              {order.idempotencyKey}
            </span>
          </div>
        </div>

        {/* Itemized List Snapshot */}
        <div className="border-t border-border pt-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Itens Comprados (Snapshot Imutável)
          </h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border/80 bg-surface-raised p-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-text-primary">{item.title}</h4>
                    <p className="text-[11px] text-text-muted">
                      {item.quantity} unidade(s) x {formatEth(item.pricePerUnitEth)}
                    </p>
                  </div>
                </div>

                <span className="font-extrabold text-primary">
                  {formatEth(item.subtotalEth)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="border-t border-border pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal</span>
            <span>{formatEth(order.subtotalEth)}</span>
          </div>
          {parseFloat(order.discountEth) > 0 && (
            <div className="flex justify-between text-status-success">
              <span>Desconto</span>
              <span>-{formatEth(order.discountEth)}</span>
            </div>
          )}
          <div className="flex justify-between text-text-secondary">
            <span>Taxa de Rede</span>
            <span>{formatEth(order.networkFeeEth)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-baseline font-bold">
            <span className="text-sm text-text-primary">Total Liquidado</span>
            <span className="text-xl text-primary" data-testid="order-confirmed-total">
              {formatEth(order.totalEth)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={() => onNavigate('/')}
          className="gap-2"
        >
          <span>Voltar ao Marketplace</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
