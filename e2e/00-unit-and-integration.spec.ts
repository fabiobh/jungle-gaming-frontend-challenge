import { test, expect } from '@playwright/test';
import { formatEth, formatFiat } from '../src/lib/utils';
import {
  loginSchema,
  registerSchema,
  profileSchema,
  changePasswordSchema,
  walletSchema,
} from '../src/types';
import { VALID_COUPONS, mockDb } from '../src/mocks/db';

test.describe('0. Testes Unitários e de Integração Lógica', () => {
  test.describe('Precisão Numérica de ETH e Moeda Fiat', () => {
    test('deve formatar valores ETH garantindo 4 casas decimais e string estável', () => {
      expect(formatEth('0.45')).toBe('0.4500 ETH');
      expect(formatEth('1')).toBe('1.0000 ETH');
      expect(formatEth('0.000123')).toBe('0.0001 ETH');
      expect(formatEth('0')).toBe('0.0000 ETH');
      expect(formatEth('invalid')).toBe('0.0000 ETH');
    });

    test('deve calcular conversão em USD com precisão monetária', () => {
      expect(formatFiat('1', 2650)).toBe('$2,650.00');
      expect(formatFiat('0.5', 2000)).toBe('$1,000.00');
      expect(formatFiat('invalid')).toBe('$0.00');
    });

    test('deve manter integridade de soma decimal de ETH sem ponto flutuante quebrado', () => {
      const a = '0.1';
      const b = '0.2';
      const sum = (parseFloat(a) + parseFloat(b)).toFixed(4);
      expect(sum).toBe('0.3000');
    });
  });

  test.describe('Validação de Schemas Zod (Formulários)', () => {
    test('loginSchema deve validar e-mail correto e senha com mínimo 6 chars', () => {
      expect(loginSchema.safeParse({ email: 'valid@jungle.io', password: 'password123' }).success).toBe(true);
      expect(loginSchema.safeParse({ email: 'invalid-email', password: 'password123' }).success).toBe(false);
      expect(loginSchema.safeParse({ email: 'valid@jungle.io', password: '123' }).success).toBe(false);
    });

    test('registerSchema deve validar confirmação de senha idêntica', () => {
      expect(registerSchema.safeParse({
        name: 'Carlos Dev',
        email: 'carlos@jungle.io',
        password: 'password123',
        confirmPassword: 'password123',
      }).success).toBe(true);

      const mismatched = registerSchema.safeParse({
        name: 'Carlos Dev',
        email: 'carlos@jungle.io',
        password: 'password123',
        confirmPassword: 'differentPassword',
      });
      expect(mismatched.success).toBe(false);
      if (!mismatched.success) {
        expect(mismatched.error.errors[0].message).toBe('As senhas não coincidem');
      }
    });

    test('profileSchema deve limitar bio a 200 caracteres', () => {
      expect(profileSchema.safeParse({ name: 'Carlos', bio: 'Colecionador Web3' }).success).toBe(true);
      const longBio = 'a'.repeat(201);
      expect(profileSchema.safeParse({ name: 'Carlos', bio: longBio }).success).toBe(false);
    });

    test('changePasswordSchema deve validar igualdade da nova senha', () => {
      expect(changePasswordSchema.safeParse({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmNewPassword: 'newpassword123',
      }).success).toBe(true);

      expect(changePasswordSchema.safeParse({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmNewPassword: 'wrongconfirm',
      }).success).toBe(false);
    });

    test('walletSchema deve validar endereço Ethereum hex 0x de 42 caracteres e rede suportada', () => {
      expect(walletSchema.safeParse({
        address: '0x71C841832047388794EaA087417537A5599E6D55',
        network: 'Ethereum',
        isPrimary: true,
        isSecondary: false,
      }).success).toBe(true);

      expect(walletSchema.safeParse({
        address: 'invalid-eth-address',
        network: 'Ethereum',
        isPrimary: false,
        isSecondary: false,
      }).success).toBe(false);
    });
  });

  test.describe('Regras de Negócio de Cupons e Mock Database', () => {
    test('deve possuir cupons ativos válidos e cupom expirado catalogado', () => {
      expect(VALID_COUPONS.JUNGLE10.discountPercent).toBe(10);
      expect(VALID_COUPONS.GREEN20.discountPercent).toBe(20);
      expect(new Date(VALID_COUPONS.EXPIRED50.expiresAt).getTime()).toBeLessThan(Date.now());
    });

    test('mockDb deve autenticar usuários válidos e rejeitar credenciais incorretas', () => {
      expect(mockDb.checkPassword('collector@jungle.io', 'password123')).toBe(true);
      expect(mockDb.checkPassword('collector@jungle.io', 'wrong-pass')).toBe(false);
      expect(mockDb.findUserByEmail('collector@jungle.io')).toBeDefined();
      expect(mockDb.findUserByEmail('inexistente@jungle.io')).toBeUndefined();
    });

    test('mockDb deve manter integridade de carteiras por usuário', () => {
      const wallets = mockDb.getWalletsByUserId('user-1');
      expect(wallets.length).toBeGreaterThan(0);
      const primaryWallet = wallets.find((w) => w.isPrimary);
      expect(primaryWallet).toBeDefined();
    });
  });
});
