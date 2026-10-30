import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from '@/lib/query-client';
import { router } from '@/router';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { DevProvider } from '@/context/DevContext';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <DevProvider>
            <RouterProvider router={router} />
          </DevProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
