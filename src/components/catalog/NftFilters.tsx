import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

interface NftFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: string;
  onSelectSort: (sort: string) => void;
  totalResults: number;
}

export const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'collectibles', label: 'Colecionáveis' },
  { id: 'art', label: 'Arte Digital' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'music', label: 'Música' },
];

export const NftFilters: React.FC<NftFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSelectSort,
  totalResults,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border/80 mb-6">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-card border border-border text-text-secondary hover:bg-surface-raised hover:text-text-primary'
              }`}
              data-testid={`category-filter-${cat.id}`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Sort & Counter */}
      <div className="flex items-center justify-between sm:justify-end gap-3">
        <span className="text-xs text-text-muted">
          <strong className="text-text-primary">{totalResults}</strong> obras encontradas
        </span>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSelectSort(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-surface-card py-2 pl-3 pr-8 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none cursor-pointer"
            aria-label="Ordenar catálogo"
            data-testid="sort-select"
          >
            <option value="featured">Destaques</option>
            <option value="price-asc">Menor Preço (ETH)</option>
            <option value="price-desc">Maior Preço (ETH)</option>
            <option value="editions">Maior Disponibilidade</option>
          </select>
          <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
        </div>
      </div>
    </div>
  );
};
