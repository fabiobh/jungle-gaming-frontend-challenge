import React from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Compass } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center space-y-6" data-testid="not-found-page">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface-card border border-border text-primary">
        <Compass className="h-10 w-10 animate-spin-slow" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Erro 404
        </span>
        <h1 className="text-3xl font-extrabold text-text-primary">
          Página Não Encontrada
        </h1>
        <p className="text-xs text-text-secondary">
          A rota que você tentou acessar não existe ou foi movida. Verifique a URL ou retorne ao marketplace.
        </p>
      </div>
      <Button variant="primary" onClick={() => onNavigate('/')} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Início
      </Button>
    </div>
  );
};
