import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  network: 'Ethereum' | 'Polygon' | 'Arbitrum' | 'Optimism';
  isPrimary: boolean;
  isSecondary: boolean;
  balanceEth: string;
}

export interface NftEdition {
  id: string;
  number: number;
  total: number;
  isAvailable: boolean;
}

export interface Nft {
  id: string;
  title: string;
  collection: string;
  creator: {
    name: string;
    avatarUrl: string;
    verified: boolean;
  };
  priceEth: string;
  fiatUsd: number;
  imageUrl: string;
  category: 'art' | 'gaming' | 'collectibles' | 'photography' | 'music';
  availableEditions: number;
  totalEditions: number;
  description: string;
  attributes: Array<{ trait_type: string; value: string }>;
  version: number;
  isFavorited?: boolean;
}

export interface CartItem {
  id: string; // unique item id in cart
  nftId: string;
  nft: Nft;
  quantity: number;
  selectedEdition?: number;
  addedAt: string;
}

export interface QuoteRequest {
  items: Array<{ nftId: string; quantity: number }>;
  couponCode?: string;
}

export interface QuoteResponse {
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  couponApplied?: {
    code: string;
    discountPercent: number;
  };
  validUntil: string;
  priceChanges?: Array<{
    nftId: string;
    oldPriceEth: string;
    newPriceEth: string;
  }>;
}

export type OrderStatus = 'pending' | 'confirmed' | 'rejected';

export interface OrderItem {
  nftId: string;
  title: string;
  imageUrl: string;
  quantity: number;
  pricePerUnitEth: string;
  subtotalEth: string;
}

export interface Order {
  id: string;
  idempotencyKey: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  walletAddress: string;
  network: string;
  txHash?: string;
  explorerUrl?: string;
  createdAt: string;
  confirmedAt?: string;
  errorMessage?: string;
}

/* Socket.IO Event Payloads */
export interface NftUpdatedEvent {
  id: string;
  priceEth: string;
  availableEditions: number;
  version: number;
  timestamp: string;
}

export interface OrderUpdatedEvent {
  orderId: string;
  status: OrderStatus;
  txHash?: string;
  version: number;
  timestamp: string;
  errorMessage?: string;
}

/* Zod Schemas for Form Validation */
export const loginSchema = z.object({
  email: z.string().email('Insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Insira um e-mail válido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme a sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  bio: z.string().max(200, 'A bio não pode exceder 200 caracteres').optional(),
  avatarUrl: z.string().optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
    newPassword: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres'),
    confirmNewPassword: z.string().min(6, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmNewPassword'],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const walletSchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Endereço Ethereum inválido (0x...)'),
  network: z.enum(['Ethereum', 'Polygon', 'Arbitrum', 'Optimism']),
  isPrimary: z.boolean().default(false),
  isSecondary: z.boolean().default(false),
});
export type WalletInput = z.infer<typeof walletSchema>;
