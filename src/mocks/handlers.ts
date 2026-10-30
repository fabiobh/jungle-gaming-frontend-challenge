import { http, HttpResponse } from 'msw';
import { mockDb, VALID_COUPONS } from './db';
import { scenarioManager } from './scenarios';
import { Order, OrderItem } from '@/types';

function getUserFromToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const [prefix, userId] = token.split('_');
  if (prefix !== 'token' || !userId) return null;
  return mockDb.findUserById(userId);
}

function checkForceError() {
  const scenario = scenarioManager.getConfig();
  if (scenario.forceHttpError) {
    return HttpResponse.json(
      { message: `Simulated error ${scenario.forceHttpError}` },
      { status: scenario.forceHttpError }
    );
  }
  return null;
}

export const handlers = [
  http.post('/api/dev/reset', () => {
    mockDb.reset();
    scenarioManager.reset();
    return HttpResponse.json({ success: true, message: 'Reset executado com sucesso' });
  }),

  // ----------------------------------------------------
  // AUTH & SESSION
  // ----------------------------------------------------
  http.post('/api/auth/register', async ({ request }) => {
    const errorResponse = checkForceError();
    if (errorResponse) return errorResponse;

    const body = (await request.json()) as any;
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return HttpResponse.json(
        { message: 'Campos obrigatórios ausentes' },
        { status: 400 }
      );
    }

    if (mockDb.findUserByEmail(email)) {
      return HttpResponse.json(
        { message: 'Já existe uma conta com este e-mail' },
        { status: 409 }
      );
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      avatarUrl: '/assets/nfts/nft-1.png',
      createdAt: new Date().toISOString(),
    };

    mockDb.addUser(newUser, password);
    const token = `token_${newUser.id}`;

    return HttpResponse.json({
      user: newUser,
      token,
    });
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const errorResponse = checkForceError();
    if (errorResponse) return errorResponse;

    const body = (await request.json()) as any;
    const { email, password } = body;

    const user = mockDb.findUserByEmail(email);
    if (!user || !mockDb.checkPassword(email, password)) {
      return HttpResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const token = `token_${user.id}`;
    return HttpResponse.json({
      user,
      token,
    });
  }),

  http.get('/api/auth/me', ({ request }) => {
    const scenario = scenarioManager.getConfig();
    if (scenario.simulateSessionExpired) {
      return HttpResponse.json({ message: 'Sessão expirada' }, { status: 401 });
    }

    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    return HttpResponse.json({ user });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // ----------------------------------------------------
  // NFTS (Catalog & Detail)
  // ----------------------------------------------------
  http.get('/api/nfts', ({ request }) => {
    const errorResponse = checkForceError();
    if (errorResponse) return errorResponse;

    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const category = url.searchParams.get('category') || '';
    const minPrice = parseFloat(url.searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(url.searchParams.get('maxPrice') || '999999');
    const sortBy = url.searchParams.get('sortBy') || 'featured';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '8', 10);

    let items = mockDb.getNfts().filter((nft) => {
      const matchesSearch =
        !search ||
        nft.title.toLowerCase().includes(search) ||
        nft.collection.toLowerCase().includes(search) ||
        nft.creator.name.toLowerCase().includes(search);

      const matchesCategory =
        !category || category === 'all' || nft.category === category;

      const price = parseFloat(nft.priceEth);
      const matchesPrice = price >= minPrice && price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      items.sort((a, b) => parseFloat(a.priceEth) - parseFloat(b.priceEth));
    } else if (sortBy === 'price-desc') {
      items.sort((a, b) => parseFloat(b.priceEth) - parseFloat(a.priceEth));
    } else if (sortBy === 'editions') {
      items.sort((a, b) => b.availableEditions - a.availableEditions);
    }

    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedItems = items.slice((page - 1) * limit, page * limit);

    return HttpResponse.json({
      items: paginatedItems,
      total,
      page,
      totalPages,
    });
  }),

  http.get('/api/nfts/:id', ({ params }) => {
    const errorResponse = checkForceError();
    if (errorResponse) return errorResponse;

    const nft = mockDb.findNftById(params.id as string);
    if (!nft) {
      return HttpResponse.json(
        { message: 'NFT não encontrado' },
        { status: 404 }
      );
    }
    return HttpResponse.json(nft);
  }),

  // ----------------------------------------------------
  // FAVORITES
  // ----------------------------------------------------
  http.get('/api/favorites', ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    const favorites = mockDb.getFavorites(user.id);
    return HttpResponse.json(favorites);
  }),

  http.post('/api/favorites/:id', ({ params, request }) => {
    const errorResponse = checkForceError();
    if (errorResponse) return errorResponse;

    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const nftId = params.id as string;
    const isFavorited = mockDb.toggleFavorite(user.id, nftId);
    return HttpResponse.json({ isFavorited });
  }),

  // ----------------------------------------------------
  // CART
  // ----------------------------------------------------
  http.get('/api/cart', ({ request }) => {
    const user = getUserFromToken(request);
    const sessionKey = user ? user.id : 'guest';
    const items = mockDb.getCart(sessionKey);

    const populated = items
      .map((item) => {
        const nft = mockDb.findNftById(item.nftId);
        if (!nft) return null;
        return {
          id: `cart-${item.nftId}`,
          nftId: item.nftId,
          nft,
          quantity: item.quantity,
          addedAt: new Date().toISOString(),
        };
      })
      .filter(Boolean);

    return HttpResponse.json(populated);
  }),

  http.post('/api/cart', async ({ request }) => {
    const user = getUserFromToken(request);
    const sessionKey = user ? user.id : 'guest';

    const body = (await request.json()) as { nftId: string; quantity: number };
    const nft = mockDb.findNftById(body.nftId);
    if (!nft) {
      return HttpResponse.json({ message: 'NFT inexistente' }, { status: 404 });
    }

    if (body.quantity > nft.availableEditions) {
      return HttpResponse.json(
        { message: `Limite de estoque: apenas ${nft.availableEditions} disponíveis.` },
        { status: 400 }
      );
    }

    let items = mockDb.getCart(sessionKey);
    const existing = items.find((i) => i.nftId === body.nftId);
    if (existing) {
      existing.quantity = body.quantity;
    } else {
      items.push({ nftId: body.nftId, quantity: body.quantity });
    }

    mockDb.setCart(sessionKey, items);
    return HttpResponse.json({ success: true, cart: items });
  }),

  http.delete('/api/cart/:nftId', ({ params, request }) => {
    const user = getUserFromToken(request);
    const sessionKey = user ? user.id : 'guest';

    let items = mockDb.getCart(sessionKey);
    items = items.filter((i) => i.nftId !== params.nftId);
    mockDb.setCart(sessionKey, items);
    return HttpResponse.json({ success: true });
  }),

  http.delete('/api/cart', ({ request }) => {
    const user = getUserFromToken(request);
    const sessionKey = user ? user.id : 'guest';
    mockDb.clearCart(sessionKey);
    return HttpResponse.json({ success: true });
  }),

  // ----------------------------------------------------
  // QUOTE (Cotação de Valores em ETH)
  // ----------------------------------------------------
  http.post('/api/quote', async ({ request }) => {
    const body = (await request.json()) as {
      items: Array<{ nftId: string; quantity: number }>;
      couponCode?: string;
    };

    let subtotal = 0;
    const priceChanges: Array<{ nftId: string; oldPriceEth: string; newPriceEth: string }> = [];

    for (const item of body.items) {
      const nft = mockDb.findNftById(item.nftId);
      if (nft) {
        subtotal += parseFloat(nft.priceEth) * item.quantity;
      }
    }

    let discountPercent = 0;
    let couponApplied = undefined;

    if (body.couponCode) {
      const upper = body.couponCode.toUpperCase().trim();
      const found = VALID_COUPONS[upper];
      if (!found) {
        return HttpResponse.json(
          { message: 'Cupom de desconto inválido' },
          { status: 400 }
        );
      }
      if (new Date(found.expiresAt) < new Date()) {
        return HttpResponse.json(
          { message: 'Cupom de desconto expirado' },
          { status: 400 }
        );
      }
      discountPercent = found.discountPercent;
      couponApplied = { code: upper, discountPercent };
    }

    const discountEth = (subtotal * (discountPercent / 100)).toFixed(4);
    const networkFeeEth = '0.0050';
    const totalEth = Math.max(0, subtotal - parseFloat(discountEth) + parseFloat(networkFeeEth)).toFixed(4);

    return HttpResponse.json({
      subtotalEth: subtotal.toFixed(4),
      discountEth,
      networkFeeEth,
      totalEth,
      couponApplied,
      validUntil: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
      priceChanges,
    });
  }),

  // ----------------------------------------------------
  // ORDERS & IDEMPOTENCY
  // ----------------------------------------------------
  http.post('/api/orders', async ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Autenticação necessária para finalizar o pedido' }, { status: 401 });
    }

    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (!idempotencyKey) {
      return HttpResponse.json({ message: 'Cabeçalho Idempotency-Key é obrigatório' }, { status: 400 });
    }

    const body = (await request.json()) as {
      items: Array<{ nftId: string; quantity: number }>;
      walletAddress: string;
      network: string;
      couponCode?: string;
    };

    const existingOrder = mockDb.findOrderByKey(idempotencyKey);
    if (existingOrder) {
      // Validate complete payload for idempotency key reuse: exact wallet, network and items match
      const isSameItems =
        existingOrder.items.length === body.items.length &&
        body.items.every((item) => {
          const match = existingOrder.items.find((i) => i.nftId === item.nftId);
          return match && match.quantity === item.quantity;
        });

      if (
        existingOrder.walletAddress.toLowerCase() === body.walletAddress.toLowerCase() &&
        existingOrder.network.toLowerCase() === body.network.toLowerCase() &&
        isSameItems
      ) {
        // Idempotent recovery
        return HttpResponse.json(existingOrder);
      } else {
        // Key reuse with different payload -> 409 Conflict
        return HttpResponse.json(
          { message: 'Chave de idempotência reutilizada com payload divergente' },
          { status: 409 }
        );
      }
    }

    const scenario = scenarioManager.getConfig();

    // Check availability and stock
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of body.items) {
      const nft = mockDb.findNftById(item.nftId);
      if (!nft || nft.availableEditions < item.quantity) {
        return HttpResponse.json(
          { message: `Edição esgotada para o NFT: ${nft?.title || item.nftId}` },
          { status: 409 }
        );
      }
      const itemSubtotal = (parseFloat(nft.priceEth) * item.quantity).toFixed(4);
      subtotal += parseFloat(itemSubtotal);
      orderItems.push({
        nftId: nft.id,
        title: nft.title,
        imageUrl: nft.imageUrl,
        quantity: item.quantity,
        pricePerUnitEth: nft.priceEth,
        subtotalEth: itemSubtotal,
      });
    }

    let discountPercent = 0;
    if (body.couponCode && VALID_COUPONS[body.couponCode.toUpperCase()]) {
      discountPercent = VALID_COUPONS[body.couponCode.toUpperCase()].discountPercent;
    }

    const discountEth = (subtotal * (discountPercent / 100)).toFixed(4);
    const networkFeeEth = '0.0050';
    const totalEth = Math.max(0, subtotal - parseFloat(discountEth) + parseFloat(networkFeeEth)).toFixed(4);

    const isRejected = scenario.simulatePaymentFailure;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      idempotencyKey,
      userId: user.id,
      status: isRejected ? 'rejected' : 'confirmed',
      items: orderItems,
      subtotalEth: subtotal.toFixed(4),
      discountEth,
      networkFeeEth,
      totalEth,
      walletAddress: body.walletAddress,
      network: body.network,
      txHash: isRejected ? undefined : `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      explorerUrl: isRejected ? undefined : 'https://etherscan.io/tx/simulated',
      createdAt: new Date().toISOString(),
      confirmedAt: isRejected ? undefined : new Date().toISOString(),
      errorMessage: isRejected ? 'Transação recusada pela rede ou carteira do usuário' : undefined,
    };

    mockDb.addOrder(newOrder);

    // If confirmed, decrement NFT available editions and clean cart
    if (newOrder.status === 'confirmed') {
      for (const item of body.items) {
        const nft = mockDb.findNftById(item.nftId);
        if (nft) {
          mockDb.updateNft(nft.id, {
            availableEditions: Math.max(0, nft.availableEditions - item.quantity),
          });
        }
      }
      mockDb.clearCart(user.id);
    }

    return HttpResponse.json(newOrder, { status: 201 });
  }),

  http.get('/api/orders/:id', ({ params, request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const order = mockDb.findOrderById(params.id as string);
    if (!order || order.userId !== user.id) {
      return HttpResponse.json({ message: 'Pedido não encontrado' }, { status: 404 });
    }

    return HttpResponse.json(order);
  }),

  http.get('/api/orders', ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    const orders = mockDb.getOrdersByUserId(user.id);
    return HttpResponse.json(orders);
  }),

  // ----------------------------------------------------
  // PROFILE & PASSWORDS
  // ----------------------------------------------------
  http.get('/api/profile', ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    return HttpResponse.json(user);
  }),

  http.put('/api/profile', async ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    const body = (await request.json()) as any;
    const updated = mockDb.updateUser(user.id, {
      name: body.name || user.name,
      avatarUrl: body.avatarUrl || user.avatarUrl,
      bio: body.bio !== undefined ? body.bio : user.bio,
    });
    return HttpResponse.json(updated);
  }),

  http.post('/api/profile/change-password', async ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    const body = (await request.json()) as any;
    const { currentPassword, newPassword } = body;

    if (!mockDb.checkPassword(user.email, currentPassword)) {
      return HttpResponse.json(
        { message: 'Senha atual incorreta' },
        { status: 400 }
      );
    }

    mockDb.setPassword(user.email, newPassword);
    return HttpResponse.json({ success: true, message: 'Senha alterada com sucesso' });
  }),

  // ----------------------------------------------------
  // WALLETS
  // ----------------------------------------------------
  http.get('/api/wallets', ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    const wallets = mockDb.getWalletsByUserId(user.id);
    return HttpResponse.json(wallets);
  }),

  http.post('/api/wallets', async ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    const body = (await request.json()) as any;
    const newWallet = {
      id: `wallet-${Date.now()}`,
      userId: user.id,
      address: body.address,
      network: body.network || 'Ethereum',
      isPrimary: Boolean(body.isPrimary),
      isSecondary: Boolean(body.isSecondary),
      balanceEth: (Math.random() * 5 + 1).toFixed(4),
    };
    mockDb.addWallet(newWallet as any);
    return HttpResponse.json(newWallet, { status: 201 });
  }),

  http.put('/api/wallets/:id', async ({ params, request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    // Verify wallet ownership before applying updates
    const userWallets = mockDb.getWalletsByUserId(user.id);
    const ownsWallet = userWallets.some((w) => w.id === params.id);
    if (!ownsWallet) {
      return HttpResponse.json({ message: 'Carteira não encontrada ou não pertence ao usuário autenticado' }, { status: 404 });
    }

    const body = (await request.json()) as any;
    const updated = mockDb.updateWallet(params.id as string, body);
    if (!updated) {
      return HttpResponse.json({ message: 'Carteira não encontrada' }, { status: 404 });
    }
    return HttpResponse.json(updated);
  }),
];
