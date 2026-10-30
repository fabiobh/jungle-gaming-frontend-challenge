import { Nft, User, Wallet, Order } from '@/types';

const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    email: 'collector@jungle.io',
    name: 'Carlos Colecionador',
    avatarUrl: '/assets/nfts/nft-1.png',
    bio: 'Colecionador de NFTs raros e entusiasta Web3.',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'user-2',
    email: 'alice@web3.io',
    name: 'Alice Nakamoto',
    avatarUrl: '/assets/nfts/nft-2.png',
    bio: 'Curadora digital e exploradora do metaverso.',
    createdAt: '2026-02-20T14:30:00Z',
  },
];

const INITIAL_WALLETS: Wallet[] = [
  {
    id: 'wallet-1',
    userId: 'user-1',
    address: '0x71C260F0C053A3508C5Fa73d5733f114674681A4',
    network: 'Ethereum',
    isPrimary: true,
    isSecondary: false,
    balanceEth: '12.4500',
  },
  {
    id: 'wallet-2',
    userId: 'user-1',
    address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
    network: 'Polygon',
    isPrimary: false,
    isSecondary: true,
    balanceEth: '4.8200',
  },
  {
    id: 'wallet-3',
    userId: 'user-2',
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
    network: 'Ethereum',
    isPrimary: true,
    isSecondary: false,
    balanceEth: '8.2100',
  },
];

const INITIAL_NFTS: Nft[] = [
  {
    id: 'nft-1',
    title: 'Ape Sovereign #4092',
    collection: 'Bored Ape Yacht Legacy',
    creator: {
      name: 'Yuga Labs',
      avatarUrl: '/assets/nfts/nft-1.png',
      verified: true,
    },
    priceEth: '2.4500',
    fiatUsd: 6492.5,
    imageUrl: '/assets/nfts/nft-1.png',
    category: 'collectibles',
    availableEditions: 3,
    totalEditions: 10,
    description:
      'Uma criatura enigmática com trajes imperiais e óculos escuros retro. Item central da coleção GreenMint Jungle.',
    attributes: [
      { trait_type: 'Fundo', value: 'Dark Ember' },
      { trait_type: 'Traje', value: 'Military Imperial' },
      { trait_type: 'Olhos', value: 'Shades' },
      { trait_type: 'Raridade', value: 'Lendário (Top 1%)' },
    ],
    version: 1,
  },
  {
    id: 'nft-2',
    title: 'Cyber Gorilla #102',
    collection: 'GreenMint Origins',
    creator: {
      name: 'CryptoArtisan',
      avatarUrl: '/assets/nfts/nft-2.png',
      verified: true,
    },
    priceEth: '1.2000',
    fiatUsd: 3180.0,
    imageUrl: '/assets/nfts/nft-2.png',
    category: 'art',
    availableEditions: 5,
    totalEditions: 15,
    description:
      'Fusão entre arte contemporânea de rua e estética cyberpunk em tons quentes.',
    attributes: [
      { trait_type: 'Fundo', value: 'Sepia Noir' },
      { trait_type: 'Acessório', value: 'Gold Earring' },
      { trait_type: 'Expressão', value: 'Stoic' },
      { trait_type: 'Raridade', value: 'Épico' },
    ],
    version: 1,
  },
  {
    id: 'nft-3',
    title: 'Chimp General #77',
    collection: 'Jungle Warriors',
    creator: {
      name: 'MetaJungle Studios',
      avatarUrl: '/assets/nfts/nft-3.png',
      verified: true,
    },
    priceEth: '0.8500',
    fiatUsd: 2252.5,
    imageUrl: '/assets/nfts/nft-3.png',
    category: 'gaming',
    availableEditions: 8,
    totalEditions: 20,
    description:
      'Avatar de combate oficial com buffs exclusivos nos ecossistemas parceiros Jungle Gaming.',
    attributes: [
      { trait_type: 'Classe', value: 'General' },
      { trait_type: 'Armadura', value: 'Titanium Cloth' },
      { trait_type: 'Poder', value: '98/100' },
      { trait_type: 'Raridade', value: 'Raro' },
    ],
    version: 1,
  },
  {
    id: 'nft-4',
    title: 'Neon Nomad #34',
    collection: 'GreenMint Origins',
    creator: {
      name: 'CryptoArtisan',
      avatarUrl: '/assets/nfts/nft-4.png',
      verified: true,
    },
    priceEth: '0.4500',
    fiatUsd: 1192.5,
    imageUrl: '/assets/nfts/nft-4.png',
    category: 'art',
    availableEditions: 12,
    totalEditions: 50,
    description:
      'Explorador intergaláctico cruzando dimensões digitais da blockchain.',
    attributes: [
      { trait_type: 'Fundo', value: 'Amber Sunset' },
      { trait_type: 'Capacete', value: 'Space Visor' },
      { trait_type: 'Raridade', value: 'Incomum' },
    ],
    version: 1,
  },
  {
    id: 'nft-5',
    title: 'Solar Sentinel #891',
    collection: 'Bored Ape Yacht Legacy',
    creator: {
      name: 'Yuga Labs',
      avatarUrl: '/assets/nfts/nft-5.png',
      verified: true,
    },
    priceEth: '3.1500',
    fiatUsd: 8347.5,
    imageUrl: '/assets/nfts/nft-5.png',
    category: 'collectibles',
    availableEditions: 2,
    totalEditions: 5,
    description:
      'O guardião da estrela matriz, imbuído com energia pura de fusão criptográfica.',
    attributes: [
      { trait_type: 'Aura', value: 'Solar Flare' },
      { trait_type: 'Coroa', value: 'Obsidian Crown' },
      { trait_type: 'Raridade', value: 'Mítico (0.1%)' },
    ],
    version: 1,
  },
  {
    id: 'nft-6',
    title: 'Acoustic Ape #19',
    collection: 'SoundWaves Club',
    creator: {
      name: 'SoundArt',
      avatarUrl: '/assets/nfts/nft-6.png',
      verified: false,
    },
    priceEth: '0.3200',
    fiatUsd: 848.0,
    imageUrl: '/assets/nfts/nft-6.png',
    category: 'music',
    availableEditions: 15,
    totalEditions: 100,
    description:
      'Contém áudio masterizado exclusivo desbloqueável apenas pelo detentor do token.',
    attributes: [
      { trait_type: 'Bitrate', value: '24-bit Lossless' },
      { trait_type: 'Gênero', value: 'Synthwave' },
      { trait_type: 'Raridade', value: 'Comum' },
    ],
    version: 1,
  },
];

export const VALID_COUPONS: Record<string, { discountPercent: number; expiresAt: string }> = {
  JUNGLE10: { discountPercent: 10, expiresAt: '2028-12-31T23:59:59Z' },
  GREEN20: { discountPercent: 20, expiresAt: '2028-12-31T23:59:59Z' },
  EXPIRED50: { discountPercent: 50, expiresAt: '2020-01-01T00:00:00Z' },
};

class MockDatabase {
  private users: User[] = JSON.parse(JSON.stringify(INITIAL_USERS));
  private wallets: Wallet[] = JSON.parse(JSON.stringify(INITIAL_WALLETS));
  private nfts: Nft[] = JSON.parse(JSON.stringify(INITIAL_NFTS));
  private favorites: Record<string, string[]> = { 'user-1': ['nft-1'] };
  private cartItems: Record<string, Array<{ nftId: string; quantity: number }>> = {};
  private orders: Order[] = [];
  private passwords: Record<string, string> = {
    'collector@jungle.io': 'password123',
    'alice@web3.io': 'password123',
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('__jungle_mock_db__');
        console.log('[MOCK DB] LOAD FROM STORAGE:', stored ? 'FOUND' : 'NOT FOUND');
        if (stored) {
          const data = JSON.parse(stored);
          if (data.users?.length) this.users = data.users;
          if (data.wallets?.length) this.wallets = data.wallets;
          if (data.nfts?.length) this.nfts = data.nfts;
          if (data.favorites) this.favorites = data.favorites;
          if (data.cartItems) this.cartItems = data.cartItems;
          if (data.orders) this.orders = data.orders;
          if (data.passwords) this.passwords = data.passwords;
          return;
        }
      }
    } catch (e) {
      console.error('[MOCK DB] LOAD ERROR:', e);
    }
  }

  public save() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          '__jungle_mock_db__',
          JSON.stringify({
            users: this.users,
            wallets: this.wallets,
            nfts: this.nfts,
            favorites: this.favorites,
            cartItems: this.cartItems,
            orders: this.orders,
            passwords: this.passwords,
          })
        );
        console.log('[MOCK DB] SAVED TO LOCALSTORAGE:', Object.keys(this.favorites));
      } else {
        console.warn('[MOCK DB] CANNOT SAVE: WINDOW/LOCALSTORAGE MISSING');
      }
    } catch (e) {
      console.error('[MOCK DB] SAVE ERROR:', e);
    }
  }

  public reset() {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.wallets = JSON.parse(JSON.stringify(INITIAL_WALLETS));
    this.nfts = JSON.parse(JSON.stringify(INITIAL_NFTS));
    this.favorites = { 'user-1': ['nft-1'] };
    this.cartItems = {};
    this.orders = [];
    this.passwords = {
      'collector@jungle.io': 'password123',
      'alice@web3.io': 'password123',
    };
    this.save();
  }

  // Users & Passwords
  public getUsers() { return this.users; }
  public findUserById(id: string) { return this.users.find((u) => u.id === id); }
  public findUserByEmail(email: string) { return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()); }
  public checkPassword(email: string, pass: string) { return this.passwords[email.toLowerCase()] === pass; }
  public setPassword(email: string, pass: string) { this.passwords[email.toLowerCase()] = pass; this.save(); }
  public addUser(user: User, pass: string) {
    this.users.push(user);
    this.passwords[user.email.toLowerCase()] = pass;
    this.save();
  }
  public updateUser(id: string, updates: Partial<User>) {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  // Wallets
  public getWalletsByUserId(userId: string) {
    return this.wallets.filter((w) => w.userId === userId);
  }
  public addWallet(wallet: Wallet) {
    if (wallet.isPrimary) {
      this.wallets.filter((w) => w.userId === wallet.userId).forEach((w) => (w.isPrimary = false));
    }
    if (wallet.isSecondary) {
      this.wallets.filter((w) => w.userId === wallet.userId).forEach((w) => (w.isSecondary = false));
    }
    this.wallets.push(wallet);
    this.save();
    return wallet;
  }
  public updateWallet(id: string, updates: Partial<Wallet>) {
    const w = this.wallets.find((item) => item.id === id);
    if (!w) return null;
    if (updates.isPrimary) {
      this.wallets.filter((item) => item.userId === w.userId).forEach((item) => (item.isPrimary = false));
    }
    if (updates.isSecondary) {
      this.wallets.filter((item) => item.userId === w.userId).forEach((item) => (item.isSecondary = false));
    }
    Object.assign(w, updates);
    this.save();
    return w;
  }

  // NFTs
  public getNfts() { return this.nfts; }
  public findNftById(id: string) { return this.nfts.find((n) => n.id === id); }
  public updateNft(id: string, updates: Partial<Nft>) {
    const nft = this.findNftById(id);
    if (!nft) return null;
    Object.assign(nft, updates, { version: (nft.version || 1) + 1 });
    this.save();
    return nft;
  }

  // Favorites
  public getFavorites(userId: string): string[] {
    return this.favorites[userId] || [];
  }
  public toggleFavorite(userId: string, nftId: string): boolean {
    const userFavs = this.favorites[userId] || [];
    const exists = userFavs.includes(nftId);
    if (exists) {
      this.favorites[userId] = userFavs.filter((id) => id !== nftId);
    } else {
      this.favorites[userId] = [...userFavs, nftId];
    }
    this.save();
    return !exists;
  }

  // Cart
  public getCart(sessionIdOrUserId: string) {
    return this.cartItems[sessionIdOrUserId] || [];
  }
  public setCart(sessionIdOrUserId: string, items: Array<{ nftId: string; quantity: number }>) {
    this.cartItems[sessionIdOrUserId] = items;
    this.save();
  }
  public clearCart(sessionIdOrUserId: string) {
    delete this.cartItems[sessionIdOrUserId];
    this.save();
  }

  // Orders & Idempotency
  public getOrdersByUserId(userId: string) {
    return this.orders.filter((o) => o.userId === userId);
  }
  public findOrderById(id: string) {
    return this.orders.find((o) => o.id === id);
  }
  public findOrderByKey(key: string) {
    return this.orders.find((o) => o.idempotencyKey === key);
  }
  public addOrder(order: Order) {
    this.orders.push(order);
    this.save();
    return order;
  }
  public updateOrder(id: string, updates: Partial<Order>) {
    const o = this.findOrderById(id);
    if (!o) return null;
    Object.assign(o, updates);
    this.save();
    return o;
  }
}

export const mockDb = new MockDatabase();
