import React, { useState, useEffect } from 'react';
import { HeroBanner } from '@/components/catalog/HeroBanner';
import { NftFilters } from '@/components/catalog/NftFilters';
import { NftCard } from '@/components/catalog/NftCard';
import { Pagination } from '@/components/catalog/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { Nft } from '@/types';
import { apiClient } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { PackageOpen } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  searchTerm: string;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, searchTerm }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [page, setPage] = useState(1);

  // Sync with search term: reset page to 1 on search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
  };

  // Query NFTs
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['nfts', { search: searchTerm, category, sortBy, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        category: category === 'all' ? '' : category,
        sortBy,
        page: String(page),
        limit: '6',
      });
      const res = await apiClient.get<{
        items: Nft[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/nfts?${params.toString()}`);
      return res.data;
    },
  });

  // Query user's favorites
  const { data: favorites = [] } = useQuery<string[]>({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiClient.get<string[]>('/favorites');
      return res.data;
    },
    enabled: Boolean(user),
  });

  return (
    <div className="space-y-12">
      {/* Hero Spotlight */}
      <HeroBanner
        onExploreClick={() => {
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onViewFeatured={() => onNavigate('/nft/nft-1')}
      />

      {/* Main Catalog Section */}
      <section id="catalog-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
            Explorar Coleção Exclusiva
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Filtre por categorias, explore obras raras e descubra tendências em tempo real.
          </p>
        </div>

        {/* Filters & Sorting */}
        <NftFilters
          selectedCategory={category}
          onSelectCategory={handleCategoryChange}
          sortBy={sortBy}
          onSelectSort={handleSortChange}
          totalResults={data?.total || 0}
        />

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="catalog-skeletons">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-surface-card p-4 space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <div className="pt-3 border-t border-border flex justify-between">
                  <Skeleton className="h-6 w-1/3 rounded" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-xl border border-status-error/30 bg-surface-card p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-status-error">
              Ocorreu uma falha ao carregar as obras do catálogo.
            </p>
            <button
              onClick={() => refetch()}
              className="rounded-lg bg-surface-raised px-4 py-2 text-xs font-semibold text-text-primary hover:bg-surface-dark border border-border"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Empty Results */}
        {!isLoading && !isError && data?.items.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface-card p-12 text-center space-y-4">
            <PackageOpen className="mx-auto h-12 w-12 text-text-muted" />
            <h3 className="text-lg font-bold text-text-primary">
              Nenhuma obra encontrada
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Não encontramos nenhum NFT para os termos ou filtros selecionados. Tente buscar por outros termos.
            </p>
          </div>
        )}

        {/* NFT Cards Grid */}
        {!isLoading && !isError && (data?.items.length ?? 0) > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items.map((nft) => (
              <NftCard
                key={nft.id}
                nft={nft}
                isFavorited={favorites.includes(nft.id)}
                onSelect={(id) => onNavigate(`/nft/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && data && (
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </section>
    </div>
  );
};
