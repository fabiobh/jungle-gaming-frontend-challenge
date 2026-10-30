import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/axios';
import { profileSchema, changePasswordSchema } from '@/types';
import { User, KeyRound, CheckCircle2 } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();

  // Profile data
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Sync state when user is loaded / rehydrated
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatarUrl || '');
      setBio(user.bio || '');
    }
  }, [user]);

  // Password data
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordGeneralError, setPasswordGeneralError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-text-primary">Acesso Restrito</h2>
        <p className="text-xs text-text-secondary">Faça login para gerenciar seu perfil de colecionador.</p>
        <Button variant="primary" onClick={() => onNavigate('/login')}>
          Entrar
        </Button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileSuccess(false);

    const validation = profileSchema.safeParse({ name, bio, avatarUrl });
    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errMap[err.path[0].toString()] = err.message;
      });
      setProfileErrors(errMap);
      return;
    }

    setProfileLoading(true);
    try {
      await apiClient.put('/profile', { name, bio, avatarUrl });
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Falha ao atualizar perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordGeneralError(null);
    setPasswordSuccess(false);

    const validation = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });

    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errMap[err.path[0].toString()] = err.message;
      });
      setPasswordErrors(errMap);
      return;
    }

    setPasswordLoading(true);
    try {
      await apiClient.post('/profile/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordGeneralError(err.response?.data?.message || 'Senha atual incorreta');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 text-left space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
          Perfil do Colecionador
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Edite suas informações públicas de colecionador e credenciais de segurança.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Profile Details Form */}
        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-text-primary">
              Dados Pessoais & Avatar
            </h2>
          </div>

          {profileSuccess && (
            <div className="rounded-lg bg-status-success/10 border border-status-success/30 p-3 text-xs text-status-success flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Perfil atualizado com sucesso!</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={avatarUrl || user.avatarUrl}
                alt="Avatar"
                className="h-16 w-16 rounded-full object-cover border-2 border-primary"
              />
              <div className="flex-1">
                <Input
                  label="URL do Avatar"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  error={profileErrors.avatarUrl}
                />
              </div>
            </div>

            <Input
              label="Nome de Exibição"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={profileErrors.name}
              required
              data-testid="profile-name-input"
            />

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Bio / Apresentação
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                placeholder="Conte sobre sua coleção de NFTs..."
              />
              {profileErrors.bio && (
                <p className="text-xs text-status-error mt-1">{profileErrors.bio}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={profileLoading}
              className="w-full text-xs"
              data-testid="save-profile-button"
            >
              Salvar Alterações
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="rounded-xl border border-border bg-surface-card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <KeyRound className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-text-primary">
              Alterar Senha
            </h2>
          </div>

          {passwordSuccess && (
            <div className="rounded-lg bg-status-success/10 border border-status-success/30 p-3 text-xs text-status-success flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Senha alterada com sucesso!</span>
            </div>
          )}

          {passwordGeneralError && (
            <div className="rounded-lg bg-status-error/10 border border-status-error/30 p-3 text-xs text-status-error">
              {passwordGeneralError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Senha Atual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={passwordErrors.currentPassword}
              placeholder="••••••••"
              required
              data-testid="current-password-input"
            />

            <Input
              label="Nova Senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordErrors.newPassword}
              placeholder="Mínimo 6 caracteres"
              required
              data-testid="new-password-input"
            />

            <Input
              label="Confirmar Nova Senha"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              error={passwordErrors.confirmNewPassword}
              placeholder="Repita a nova senha"
              required
              data-testid="confirm-new-password-input"
            />

            <Button
              type="submit"
              variant="secondary"
              isLoading={passwordLoading}
              className="w-full text-xs"
              data-testid="change-password-button"
            >
              Atualizar Senha
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
