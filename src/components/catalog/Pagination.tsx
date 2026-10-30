import React from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-8 mt-4 border-t border-border">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="gap-1 text-xs"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Anterior</span>
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors ${
              currentPage === page
                ? 'bg-primary text-white shadow'
                : 'bg-surface-card border border-border text-text-secondary hover:bg-surface-raised hover:text-text-primary'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="gap-1 text-xs"
        aria-label="Próxima página"
      >
        <span>Próxima</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
