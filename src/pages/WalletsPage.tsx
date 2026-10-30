import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Wallet, walletSchema } from '@/types';
import { apiClient } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet as WalletIcon, Plus, Check, Star, ShieldCheck } from 'lucide-react';

interface WalletsPageProps {
  onNavigate: (path: string) => void;
}

export const WalletsPage: React.FC<WalletsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState<'Ethereum' | 'Polygon' | 'Arbitrum' | 'Optimism'>('Ethereum');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSecondary, setIsSecondary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallets
  const { data: wallets = [], isLoading } = useQuery<Wallet[]>({
    queryKey: ['wallets'],
    queryFn: async () => {
      const res = await apiClient.get<Wallet[]>('/wallets');
      return res.data;
    },
    enabled: Boolean(user),
  });

  // Add wallet mutation
  const addMutation = useMutation({
    mutationFn: async (newWallet: any) => {
      const res = await apiClient.post('/wallets', newWallet);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      setIsAdding(false);
      setAddress('');
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Falha ao cadastrar carteira');
    },
  });

  // Set primary/secondary mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const res = await apiClient.put(`/wallets/${id}`, updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-text-primary">Acesso Restrito</h2>
        <p className="text-xs text-text-secondary">Faça login para gerenciar suas carteiras Web3.</p>
        <Button variant="primary" onClick={() => onNavigate('/login')}>
          Entrar
        </Button>
      </div>
    );
  }

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = walletSchema.safeParse({
      address,
      network,
      isPrimary,
      isSecondary,
    });

    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Endereço inválido');
      return;
    }

    addMutation.mutate({
      address,
      network,
      isPrimary,
      isSecondary,
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 text-left space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
            Carteiras Conectadas
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Gerencie os endereços vinculados à sua conta para compra, custódia e recebimento de NFTs.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="gap-1.5 self-start sm:self-auto"
          data-testid="add-wallet-trigger"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Carteira</span>
        </Button>
      </div>

      {/* Add Wallet Form Modal / Box */}
      {isAdding && (
        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-text-primary">
            Cadastrar Novo Endereço Web3
          </h3>

          {error && (
            <p className="text-xs text-status-error font-medium" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleAddWallet} className="space-y-4">
            <Input
              label="Endereço da Carteira (Hexadecimal 0x...)"
              placeholder="0x71C260F0C053A3508C5Fa73d5733f114674681A4"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              data-testid="new-wallet-address-input"
            />

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Rede Padrão
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as any)}
                className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="Ethereum">Ethereum</option>
                <option value="Polygon">Polygon</option>
                <option value="Arbitrum">Arbitrum</option>
                <option value="Optimism">Optimism</option>
              </select>
            </div>

            <div className="flex items-center gap-6 pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-text-secondary">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => {
                    setIsPrimary(e.target.checked);
                    if (e.target.checked) setIsSecondary(false);
                  }}
                  className="rounded border-border accent-primary"
                />
                Definir como Carteira Principal
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-text-secondary">
                <input
                  type="checkbox"
                  checked={isSecondary}
                  onChange={(e) => {
                    setIsSecondary(e.target.checked);
                    if (e.target.checked) setIsPrimary(false);
                  }}
                  className="rounded border-border accent-primary"
                />
                Definir como Carteira Secundária
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={addMutation.isPending}
                data-testid="save-wallet-button"
              >
                Cadastrar Carteira
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Wallets List */}
      <div className="space-y-4">
        {wallets.map((w) => (
          <div
            key={w.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-surface-card p-5"
            data-testid={`wallet-item-${w.id}`}
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-raised border border-border text-primary">
                <WalletIcon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs font-bold text-text-primary">
                    {w.address}
                  </p>
                  {w.isPrimary && (
                    <span className="rounded bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 text-[10px] font-bold">
                      Principal
                    </span>
                  )}
                  {w.isSecondary && (
                    <span className="rounded bg-secondary/20 text-secondary border border-secondary/30 px-2 py-0.5 text-[10px] font-bold">
                      Secundária
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-muted">
                  Rede: <span className="text-text-secondary font-medium">{w.network}</span> • Saldo Estimado:{' '}
                  <span className="text-text-primary font-bold">{w.balanceEth} ETH</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {!w.isPrimary && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateMutation.mutate({ id: w.id, updates: { isPrimary: true, isSecondary: false } })}
                  className="text-xs h-8"
                >
                  Tornar Principal
                </Button>
              )}
              {!w.isSecondary && !w.isPrimary && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateMutation.mutate({ id: w.id, updates: { isSecondary: true } })}
                  className="text-xs h-8"
                >
                  Tornar Secundária
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
