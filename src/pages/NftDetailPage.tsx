import React, { useState } from 'react';
import { Nft } from '@/types';
import { apiClient } from '@/lib/axios';
import { formatEth, formatFiat } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
  Share2,
  Clock,
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';

interface NftDetailPageProps {
  id: string;
  onNavigate: (path: string) => void;
}

export const NftDetailPage: React.FC<NftDetailPageProps> = ({ id, onNavigate }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  // Fetch NFT Details
  const {
    data: nft,
    isLoading,
    isError,
  } = useQuery<Nft>({
    queryKey: ['nft', id],
    queryFn: async () => {
      const res = await apiClient.get<Nft>(`/nfts/${id}`);
      return res.data;
    },
    retry: false,
  });

  // Fetch Favorites
  const { data: favorites = [] } = useQuery<string[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiClient.get<string[]>('/favorites');
      return res.data;
    },
    enabled: Boolean(user),
  });

  // Favorite Mutation with Optimistic Update
  const favoriteMutation = useMutation({
    mutationFn: async (nftId: string) => {
      const res = await apiClient.post<{ isFavorited: boolean }>(`/favorites/${nftId}`);
      return res.data;
    },
    onMutate: async (nftId: string) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData<string[]>(['favorites']) || [];
      const updated = previous.includes(nftId)
        ? previous.filter((item) => item !== nftId)
        : [...previous, nftId];
      queryClient.setQueryData(['favorites'], updated);
      return { previous };
    },
    onError: (_err, _nftId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['favorites'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isFavorited = favorites.includes(id);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCart = async () => {
    if (!nft) return;
    await addToCart(nft, quantity);
    onNavigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" data-testid="nft-detail-skeleton">
        <Skeleton className="h-6 w-32 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <Skeleton className="aspect-square w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <Skeleton className="h-10 w-3/4 rounded" />
            <Skeleton className="h-6 w-1/2 rounded" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Not Found or Error
  if (isError || !nft) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-6" data-testid="nft-not-found">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-error/10 text-status-error">
          <Info className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-text-primary">
          NFT Não Encontrado
        </h2>
        <p className="text-sm text-text-secondary">
          A obra solicitada não existe ou foi removida pelo criador. Verifique o link ou explore outras peças no catálogo.
        </p>
        <Button variant="primary" onClick={() => onNavigate('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 text-left">
      {/* Breadcrumb / Back Button */}
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar ao Catálogo</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Artwork Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-surface-card shadow-2xl">
            <img
              src={nft.imageUrl}
              alt={nft.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => {
                  if (!user) {
                    alert('Faça login para favoritar!');
                    return;
                  }
                  favoriteMutation.mutate(nft.id);
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                  isFavorited
                    ? 'bg-status-error text-white shadow-lg'
                    : 'bg-background/80 text-text-muted hover:text-status-error border border-border'
                }`}
                aria-label="Favoritar obra"
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-md text-text-muted hover:text-text-primary border border-border"
                aria-label="Compartilhar link"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {copied && (
            <p className="text-xs text-status-success text-center">
              Link copiado para a área de transferência!
            </p>
          )}

          {/* Attributes Grid */}
          <div className="rounded-xl border border-border bg-surface-card p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Propriedades e Raridade
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {nft.attributes.map((attr, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border/80 bg-surface-raised p-2.5 text-center"
                >
                  <p className="text-[10px] uppercase font-bold text-text-muted">
                    {attr.trait_type}
                  </p>
                  <p className="text-xs font-bold text-text-primary mt-0.5 truncate">
                    {attr.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Information, Quantity & Buy Action */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              {nft.collection}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              {nft.title}
            </h1>
          </div>

          {/* Creator Badge */}
          <div className="flex items-center gap-3 py-3 border-y border-border">
            <img
              src={nft.creator.avatarUrl}
              alt={nft.creator.name}
              className="h-10 w-10 rounded-full object-cover border border-border"
            />
            <div>
              <p className="text-[11px] text-text-muted">Criador Autenticado</p>
              <p className="text-sm font-bold text-text-primary flex items-center gap-1">
                {nft.creator.name}
                {nft.creator.verified && (
                  <ShieldCheck className="h-4 w-4 text-primary" />
                )}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Descrição da Obra
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {nft.description}
            </p>
          </div>

          {/* Price Box */}
          <div className="rounded-xl border border-border bg-surface-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-text-muted">Preço Atual</span>
                <p className="text-3xl font-extrabold text-primary">
                  {formatEth(nft.priceEth)}
                </p>
                <span className="text-xs text-text-muted">
                  Estimativa fiduciária: {formatFiat(nft.priceEth)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-text-muted">Disponibilidade</span>
                <p className="text-sm font-bold text-text-primary">
                  {nft.availableEditions > 0 ? (
                    <span className="text-status-success">
                      {nft.availableEditions} de {nft.totalEditions} restantes
                    </span>
                  ) : (
                    <span className="text-status-error">Esgotado</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quantity Picker (if available) */}
            {nft.availableEditions > 0 && (
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary">
                  Quantidade:
                </span>
                <div className="flex items-center rounded-lg border border-border bg-surface-raised">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-8 w-8 text-sm font-bold text-text-secondary hover:text-text-primary disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-text-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(nft.availableEditions, quantity + 1))}
                    disabled={quantity >= nft.availableEditions}
                    className="h-8 w-8 text-sm font-bold text-text-secondary hover:text-text-primary disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Buy / Add to Cart Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                disabled={nft.availableEditions <= 0}
                onClick={handleAddToCart}
                className="flex-1 gap-2 text-sm shadow-lg shadow-primary/20"
                data-testid="buy-now-button"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Comprar Agora</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
