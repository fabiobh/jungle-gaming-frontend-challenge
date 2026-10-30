import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginSchema } from '@/types';
import { Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errMap[err.path[0].toString()] = err.message;
      });
      setErrors(errMap);
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      onNavigate('/');
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || 'Falha ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-left space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
          Acessar sua Conta
        </h1>
        <p className="text-xs text-text-muted">
          Entre na GreenMint para gerenciar seus NFTs, favoritos e histórico de compras.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface-card p-6 sm:p-8 space-y-6 shadow-2xl">
        {generalError && (
          <div className="rounded-lg bg-status-error/10 border border-status-error/30 p-3 text-xs text-status-error" role="alert">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="seu@email.com"
            required
            data-testid="login-email-input"
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="••••••••"
            required
            data-testid="login-password-input"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-sm mt-2"
            data-testid="login-submit-button"
          >
            Entrar
          </Button>
        </form>

        {/* Demo Credentials Quick Pick */}
        <div className="border-t border-border pt-4 space-y-2">
          <p className="text-[11px] font-semibold text-text-muted text-center">
            Credenciais Fictícias de Teste (1-Clique):
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFillDemo('collector@jungle.io')}
              className="rounded-lg border border-border bg-surface-raised p-2 text-left hover:border-primary transition-colors"
            >
              <p className="font-bold text-text-primary truncate">Carlos</p>
              <p className="text-[10px] text-text-muted truncate">collector@jungle.io</p>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('alice@web3.io')}
              className="rounded-lg border border-border bg-surface-raised p-2 text-left hover:border-primary transition-colors"
            >
              <p className="font-bold text-text-primary truncate">Alice</p>
              <p className="text-[10px] text-text-muted truncate">alice@web3.io</p>
            </button>
          </div>
        </div>

        <div className="border-t border-border pt-4 text-center">
          <p className="text-xs text-text-muted">
            Ainda não tem conta?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="font-bold text-primary hover:underline"
            >
              Cadastre-se grátis
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
