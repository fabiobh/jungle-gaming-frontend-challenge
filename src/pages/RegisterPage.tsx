import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerSchema } from '@/types';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const validation = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

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
      await register(name, email, password);
      onNavigate('/');
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || 'Falha ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-left space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
          Criar sua Conta
        </h1>
        <p className="text-xs text-text-muted">
          Cadastre-se na GreenMint para explorar, colecionar e negociar NFTs exclusivos.
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
            label="Nome Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Seu nome"
            required
            data-testid="register-name-input"
          />

          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="seu@email.com"
            required
            data-testid="register-email-input"
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="Mínimo de 6 caracteres"
            required
            data-testid="register-password-input"
          />

          <Input
            label="Confirmar Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            placeholder="Repita sua senha"
            required
            data-testid="register-confirm-password-input"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-sm mt-2"
            data-testid="register-submit-button"
          >
            Cadastrar Conta
          </Button>
        </form>

        <div className="border-t border-border pt-4 text-center">
          <p className="text-xs text-text-muted">
            Já possui cadastro?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="font-bold text-primary hover:underline"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
