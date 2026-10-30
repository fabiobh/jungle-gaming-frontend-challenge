import React from 'react';
import { Button } from '@/components/ui/Button';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onViewFeatured: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onViewFeatured,
}) => {
  return (
    <section className="relative overflow-hidden py-12 md:py-20 border-b border-border/40">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 -z-10 h-80 w-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>O Maior Marketplace Web3 da América Latina</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.15]">
              DESCUBRA O NOVO OURO DA{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ARTE DIGITAL
              </span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-text-secondary leading-relaxed">
              Compre, venda e colecione NFTs exclusivos com garantia de autenticidade,
              taxas mínimas de rede e liquidez garantida.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={onExploreClick}
                className="gap-2 shadow-lg shadow-primary/20"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={onViewFeatured}
              >
                Ver Obra em Destaque
              </Button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/80">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                  240K+
                </p>
                <p className="text-xs text-text-muted font-medium">NFTs Criados</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                  150K+
                </p>
                <p className="text-xs text-text-muted font-medium">Colecionadores</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                  1.2K+
                </p>
                <p className="text-xs text-text-muted font-medium">Artistas Verificados</p>
              </div>
            </div>
          </div>

          {/* Right Column: Featured NFT Card Spotlight */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-4 shadow-2xl transition-all hover:border-border-soft">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-raised mb-4 group">
                <img
                  src="/assets/nfts/nft-1.png"
                  alt="Ape Sovereign #4092"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 rounded-full bg-background/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-secondary border border-secondary/30">
                  ★ Obra em Destaque
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-text-primary text-lg">
                      Ape Sovereign #4092
                    </p>
                    <p className="text-xs text-text-muted">Bored Ape Yacht Legacy</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-text-muted">Preço Atual</p>
                    <p className="text-base font-extrabold text-primary">2.4500 ETH</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/nfts/nft-1.png"
                      alt="Creator"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-text-secondary flex items-center gap-1">
                      Yuga Labs <ShieldCheck className="h-3 w-3 text-primary inline" />
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={onViewFeatured}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
