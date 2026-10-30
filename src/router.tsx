import React, { useState, useContext } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useNavigate,
  useRouterState,
  useParams,
} from '@tanstack/react-router';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PriceAlertBanner } from '@/components/layout/PriceAlertBanner';
import { DevScenarioPanel } from '@/components/dev/DevScenarioPanel';
import { HomePage } from '@/pages/HomePage';
import { NftDetailPage } from '@/pages/NftDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { WalletsPage } from '@/pages/WalletsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Context to share header search across routes
const SearchContext = React.createContext<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}>({
  searchTerm: '',
  setSearchTerm: () => {},
});

export const useSearch = () => useContext(SearchContext);

// Root Layout Component
function RootLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [searchTerm, setSearchTerm] = useState('');

  const handleNavigate = (path: string) => {
    navigate({ to: path as any });
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (currentPath !== '/') {
      navigate({ to: '/' });
    }
  };

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-primary selection:text-white">
        <Header
          searchValue={searchTerm}
          onSearchChange={handleSearchChange}
          onNavigate={handleNavigate}
          currentPath={currentPath}
        />
        <PriceAlertBanner />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <DevScenarioPanel />
      </div>
    </SearchContext.Provider>
  );
}

// Root Route
const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => {
    const navigate = useNavigate();
    return <NotFoundPage onNavigate={(path) => navigate({ to: path as any })} />;
  },
});

// Index Route (Home)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    const navigate = useNavigate();
    const { searchTerm } = useSearch();
    return <HomePage onNavigate={(p) => navigate({ to: p as any })} searchTerm={searchTerm} />;
  },
});

// NFT Detail Route
const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nft/$id',
  component: () => {
    const { id } = useParams({ from: '/nft/$id' });
    const navigate = useNavigate();
    return <NftDetailPage id={id} onNavigate={(p) => navigate({ to: p as any })} />;
  },
});

// Cart Route
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: () => {
    const navigate = useNavigate();
    return <CartPage onNavigate={(p) => navigate({ to: p as any })} />;
  },
});

// Checkout Route
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: () => {
    const navigate = useNavigate();
    return <CheckoutPage onNavigate={(p) => navigate({ to: p as any })} />;
  },
});

// Order Confirmation Route
const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order/$id',
  component: () => {
    const { id } = useParams({ from: '/order/$id' });
    const navigate = useNavigate();
    return <OrderConfirmationPage id={id} onNavigate={(p) => navigate({ to: p as any })} />;
  },
});

// Login Route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => {
    const navigate = useNavigate();
    return <LoginPage onNavigate={(p) => navigate({ to: p as any })} />;
  },
});

// Register Route
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => {
    const navigate = useNavigate();
    return <RegisterPage onNavigate={(p) => navigate({ to: p as any })} />;
  },
});

// Profile Route
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => {
    const navigate = useNavigate();
    return <ProfilePage onNavigate={(p) => navigate({ to: p as any })} />;
  },
});

// Wallets Route
const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallets',
  component: () => {
    const navigate = useNavigate();
    return <WalletsPage onNavigate={(p) => navigate({ to: p as any })} />;
  },
});

// Create Route Tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  nftDetailRoute,
  cartRoute,
  checkoutRoute,
  orderConfirmationRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  walletsRoute,
]);

// Export Router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
