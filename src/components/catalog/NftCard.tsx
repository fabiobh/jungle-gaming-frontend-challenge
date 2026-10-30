import React, { useState, useEffect } from 'react';
import { Nft } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatEth, formatFiat } from '@/lib/utils';
import { Heart, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface NftCardProps {
  nft: Nft;
  isFavorited?: boolean;
  onSelect: (id: string) => void;
}

export const NftCard: React.FC<NftCardProps> = ({
  nft,
  isFavorited = false,
  onSelect,
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();

  // Local optimistic state for instant UI response
  const [localFav, setLocalFav] = useState(isFavorited);

  useEffect(() => {
    setLocalFav(isFavorited);
  }, [isFavorited]);

  // Optimistic update for Favorites with rollback
  const favoriteMutation = useMutation({
    mutationFn: async (nftId: string) => {
      const res = await apiClient.post<{ isFavorited: boolean }>(`/favorites/${nftId}`);
      return res.data;
    },
    onMutate: async (nftId: string) => {
      const favKey = ['favorites', user?.id];
      await queryClient.cancelQueries({ queryKey: favKey });
      const previousFavorites = queryClient.getQueryData<string[]>(favKey) || [];

      // Optimistically update
      const isCurrentlyFav = previousFavorites.includes(nftId);
      const updated = isCurrentlyFav
        ? previousFavorites.filter((id) => id !== nftId)
        : [...previousFavorites, nftId];

      queryClient.setQueryData(favKey, updated);
      setLocalFav(!isCurrentlyFav);

      return { previousFavorites, wasFav: isCurrentlyFav, favKey };
    },
    onError: (_err, _nftId, context) => {
      // Rollback to previous state on failure
      if (context) {
        queryClient.setQueryData(context.favKey, context.previousFavorites);
        setLocalFav(context.wasFav);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Faça login para salvar seus NFTs favoritos!');
      return;
    }
    favoriteMutation.mutate(nft.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(nft, 1);
  };

  const activeFav = localFav;

  return (
    <div
      onClick={() => onSelect(nft.id)}
      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 cursor-pointer text-left"
      data-testid={`nft-card-${nft.id}`}
    >
      <div>
        {/* NFT Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface-raised mb-4">
          <img
            src={nft.imageUrl}
            alt={nft.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isPending}
            className={`absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all ${
              activeFav
                ? 'bg-status-error text-white'
                : 'bg-background/80 text-text-muted hover:text-status-error'
            }`}
            aria-label={activeFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            data-testid={`fav-button-${nft.id}`}
          >
            <Heart
              className={`h-4 w-4 ${activeFav ? 'fill-current' : ''}`}
            />
          </button>

          {/* Stock Tag */}
          <div className="absolute bottom-2.5 left-2.5 rounded-full bg-background/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-text-secondary border border-border">
            {nft.availableEditions > 0 ? (
              <span>{nft.availableEditions} de {nft.totalEditions} disp.</span>
            ) : (
              <span className="text-status-error">Esgotado</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="truncate">{nft.creator.name}</span>
            {nft.creator.verified && (
              <ShieldCheck className="h-3 w-3 text-primary shrink-0" />
            )}
          </div>
          <h3 className="font-bold text-base text-text-primary truncate group-hover:text-primary transition-colors">
            {nft.title}
          </h3>
          <p className="text-xs text-text-secondary truncate">{nft.collection}</p>
        </div>
      </div>

      {/* Footer / Price & Action */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
            Preço
          </p>
          <p className="text-sm font-extrabold text-primary">
            {formatEth(nft.priceEth)}
          </p>
          <p className="text-[10px] text-text-muted">
            ~{formatFiat(nft.priceEth)}
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleAddToCart}
          disabled={nft.availableEditions <= 0}
          className="gap-1.5 px-3 py-1.5 text-xs hover:border-primary"
          aria-label={`Comprar ${nft.title}`}
        >
          <ShoppingBag className="h-3.5 w-3.5 text-primary" />
          <span>Comprar</span>
        </Button>
      </div>
    </div>
  );
};
