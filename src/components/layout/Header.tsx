import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Search, ShoppingBag, Menu, X, User as UserIcon, Wallet, LogOut } from 'lucide-react';

interface HeaderProps {
  onSearchChange?: (term: string) => void;
  searchValue?: string;
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  searchValue = '',
  onNavigate,
  currentPath,
}) => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const totalCartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent shadow-md">
              <span className="font-extrabold text-white text-xl">G</span>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-text-primary">
                Green<span className="text-primary">Mint</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-secondary font-semibold">
                Marketplace
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
            <button
              onClick={() => onNavigate('/')}
              className={`transition-colors hover:text-text-primary ${
                currentPath === '/' ? 'text-primary font-bold' : ''
              }`}
            >
              Explorar
            </button>
            <button
              onClick={() => onNavigate('/#collections')}
              className="transition-colors hover:text-text-primary"
            >
              Coleções
            </button>
            <button
              onClick={() => onNavigate('/#activity')}
              className="transition-colors hover:text-text-primary"
            >
              Atividade
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar NFTs, coleções ou criadores..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded-full border border-border bg-surface-card py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <button
            onClick={() => onNavigate('/cart')}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-card text-text-primary transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Carrinho de compras"
            data-testid="cart-button"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Auth State */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 rounded-full border border-border bg-surface-card p-1 pr-3 transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Menu do usuário"
                data-testid="user-profile-menu-button"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-border"
                />
                <span className="hidden sm:inline text-xs font-semibold text-text-primary max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-surface-card p-1.5 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="border-b border-border p-2 mb-1">
                    <p className="text-xs font-bold text-text-primary truncate">{user.name}</p>
                    <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('/profile');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    Meu Perfil
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('/wallets');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    Minhas Carteiras
                  </button>
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        onNavigate('/');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-status-error hover:bg-status-error/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Desconectar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('/login')}
                className="text-xs px-2 sm:px-3"
              >
                Entrar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('/register')}
                className="hidden sm:inline-flex text-xs px-3"
              >
                Cadastrar
              </Button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary focus:outline-none"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Row */}
      <div className="lg:hidden px-4 pb-3">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar NFTs, coleções ou criadores..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full rounded-full border border-border bg-surface-card py-2 pl-10 pr-4 text-xs text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-4 animate-in slide-in-from-top-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar NFTs..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-card py-2 pl-9 pr-3 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/');
              }}
              className="block w-full text-left rounded-lg px-3 py-2 text-sm font-semibold text-text-primary hover:bg-surface-card"
            >
              Explorar Catálogo
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/cart');
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-text-primary hover:bg-surface-card"
            >
              <span>Carrinho</span>
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                {totalCartCount}
              </span>
            </button>
          </div>

          {!user && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/login');
                }}
              >
                Entrar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/register');
                }}
              >
                Cadastrar
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
