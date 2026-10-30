import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-surface-card/60 pt-16 pb-12 mt-20 text-xs text-text-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-white">
                G
              </div>
              <span className="text-lg font-bold text-text-primary">
                Green<span className="text-primary">Mint</span>
              </span>
            </div>
            <p className="leading-relaxed text-text-secondary">
              O marketplace líder em NFTs exclusivos, coleções digitais raras e ativos interoperáveis para o ecossistema Web3.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wider">
              Marketplace
            </h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-primary transition-colors">Todos os NFTs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Arte Digital</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Colecionáveis</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Gaming & Metaverso</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wider">
              Minha Conta
            </h4>
            <ul className="space-y-2">
              <li><a href="/profile" className="hover:text-primary transition-colors">Perfil</a></li>
              <li><a href="/wallets" className="hover:text-primary transition-colors">Carteiras Conectadas</a></li>
              <li><a href="/cart" className="hover:text-primary transition-colors">Carrinho</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Histórico de Pedidos</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Receba Novidades
            </h4>
            <p className="text-text-secondary">
              Cadastre seu e-mail para receber drops exclusivos e atualizações de coleções.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-hover"
              >
                Assinar
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-border/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GreenMint Inc. Todos os direitos reservados. Desafio Frontend Jungle Gaming.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text-primary">Termos de Uso</a>
            <a href="#" className="hover:text-text-primary">Privacidade</a>
            <a href="#" className="hover:text-text-primary">Contrato de Mocks MSW</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
