# GreenMint Marketplace — Arquitetura do Sistema

## 1. Visão Geral da Arquitetura

O **GreenMint Marketplace** é uma Single Page Application (SPA) de alta fidelidade visual, construída para proporcionar a experiência de um marketplace moderno de NFTs interoperáveis na Web3. O design system foi extraído do Figma oficial (`#140D0A` fundo, `#F27A1A` laranja primário, `#241612` cards, `#B39463` dourado secundário) com viewport responsivo para Desktop (1440px) e Mobile (390px/414px).

### 1.1 Stack Tecnológico
- **Core:** React 18, TypeScript (strict mode), Vite 6.
- **Roteamento:** TanStack Router (`@tanstack/react-router`) com persistência de filtros, busca e ordenação em parâmetros de URL (`?search=&category=&sort=&page=`).
- **Data Fetching & Cache:** TanStack Query v5 (`@tanstack/react-query`) com invalidação cirúrgica, re-fetch em reconnect e reconciliação automática.
- **Camada HTTP:** Axios com interceptors para injeção automática de Bearer Token JWT e simulação de latência de rede.
- **Comunicação em Tempo Real:** Socket.IO Client (`socket.io-client`) com mock de websocket sincronizado via `BroadcastChannel` para suporte a múltiplas abas concorrentes.
- **Mocks & Interceptação:** MSW (Mock Service Worker 2.0) integrado ao navegador com Service Worker ativo (`mockServiceWorker.js`).
- **Estilização & UI:** Tailwind CSS, Radix UI Primitives, Lucide Icons e suporte completo a navegação por teclado e leitor de tela (WCAG AA).
- **Testes & Qualidade:** Playwright E2E (Desktop Chromium 1440x900 e Mobile Chromium 390x844 Pixel 7), script automatizado de auditoria Lighthouse (3 iterações com cálculo de mediana).

---

## 2. Gerenciamento de Estado & Fluxo de Dados

A arquitetura adota separação estrita entre **Server State** e **Client/Session State**:

```
┌─────────────────────────────────────────────────────────────┐
│                      Camada de Apresentação                 │
│    (Catalog, NFT Details, Cart, Checkout, Profile, Wallets) │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
    ┌────────────────────┐          ┌────────────────────┐
    │   Contextos React  │          │   TanStack Query   │
    │  (Auth, Cart, Dev) │          │  (Server Cache)    │
    └──────────┬─────────┘          └──────────┬─────────┘
               │                               │
               ▼                               ▼
    ┌────────────────────┐          ┌────────────────────┐
    │  LocalStorage Sync │          │  Axios Interceptor │
    └────────────────────┘          └──────────┬─────────┘
                                               │
                                               ▼
                                    ┌────────────────────┐
                                    │  MSW Interceptor   │
                                    │ (Service Worker)   │
                                    └──────────┬─────────┘
                                               │
                                               ▼
                                    ┌────────────────────┐
                                    │    In-Memory DB    │
                                    │ (__jungle_mock_db) │
                                    └────────────────────┘
```

1. **Server State (TanStack Query):**
   - Chaves isoladas por entidade (`['nfts', filters]`, `['nft', id]`, `['favorites', userId]`, `['wallets']`).
   - `staleTime: 1000 * 60 * 2` (2 minutos) para listagens, prevenindo requisições redundantes.
   - Atualizações otimistas com rollback automático em caso de falha de mutação (ex: botão de favoritos).

2. **Client State (Context API):**
   - **AuthContext:** Gerencia o ciclo de vida do usuário autenticado, recuperação de sessão via token JWT no `localStorage`, emissão de eventos de logout global (`auth:expired`) e limpeza de cache.
   - **CartContext:** Carrinho unificado que calcula subtotal, desconto de cupom percentual (`JUNGLE10` e `GREEN20`) e taxa de rede gas em strings de precisão decimal ETH.
   - **DevContext:** Painel flutuante de simulação de cenários (latência 0/500/2000ms, erros HTTP forçados 400/401/404/500, recusa no checkout, oscilação de preço e reset total do banco).

---

## 3. Mock Service Worker (MSW) & In-Memory Database

Para manter a aplicação 100% funcional sem depender de um backend externo real, implementamos uma camada de mocks completa com MSW 2.0:

### 3.1 Contratos REST Implementados
- `GET /api/nfts`: Listagem paginada com suporte a filtros (`category`), ordenação (`price-asc`, `price-desc`, `editions-asc`, `editions-desc`) e busca textual case-insensitive.
- `GET /api/nfts/:id`: Detalhe completo de atributos, raridade e criador verificado. Retorna 404 estruturado para IDs inexistentes.
- `POST /api/auth/login`: Autenticação por email e senha com retorno de Bearer Token.
- `POST /api/auth/register`: Cadastro de novo colecionador com validação Zod e conflito (409) para emails duplicados.
- `GET /api/auth/me`: Validação do token e recuperação da sessão.
- `GET /api/favorites` & `POST /api/favorites/:id`: Gerenciamento de favoritos persistente por usuário autenticado.
- `GET /api/cart`, `POST /api/cart`, `DELETE /api/cart/:id`: Gestão de itens no carrinho com validação estrita contra estoque disponível.
- `POST /api/quote`: Cálculo determinístico de cotação com precisão decimal em ETH e aplicação de cupons promocionais.
- `GET /api/wallets` & `POST /api/wallets`: Gestão de carteiras Web3 (primária e secundária) com validação de formato Ethereum (`0x` + 40 hex).
- `POST /api/orders`: Submissão de checkout com suporte a cabeçalho `Idempotency-Key`.
- `GET /api/orders/:id`: Recibo imutável contendo hash da transação (`0x...`), timestamp, endereço da carteira e link para o explorador de blocos Etherscan.
- `POST /api/dev/reset`: Reset total do banco em memória e restauração das fixtures originais.

### 3.2 Persistência e Sincronização
O mock de banco (`MockDatabase`) armazena seu estado em `localStorage['__jungle_mock_db__']`. Qualquer alteração (compras, novas carteiras, favoritos, novos usuários) sobrevive ao refresh de página e navegação direta.

---

## 4. Comunicação em Tempo Real & Socket.IO

A aplicação implementa atualizações em tempo real com concorrência entre abas:

1. **BroadcastChannel:** A instância cliente do Socket conecta-se a um barramento de eventos compartilhado (`BroadcastChannel('jungle_gaming_socket_bus')`).
2. **Eventos Transmitidos:**
   - `nft.updated`: Disparado sempre que o preço em ETH ou estoque de uma obra é alterado.
   - `nft.price_shift`: Simulação disparada via Dev Scenario Panel.
3. **Reconciliação e Alertas:**
   - Se o NFT alterado estiver no carrinho do usuário, o sistema exibe imediatamente o banner de alerta `PriceAlertBanner`, sincroniza o novo valor e re-calcula o total da cotação.
   - TanStack Query invalida as chaves `['nfts']` e `['nft', id]` para atualizar instantaneamente os cards na tela sem recarregar a página.

---

## 5. Resiliência, Idempotência e Tratamento de Erros

- **Idempotência no Checkout:** Cada submissão de pedido gera uma chave UUID única enviada via `Idempotency-Key`. Se a rede oscilar ou a requisição for reenviada, o backend mock detecta a chave e retorna o mesmo pedido sem duplicar compras.
- **Recuperação de Falha:** Caso a simulação de pagamento falhe (ex: saldo insuficiente ou recusa de rede), a página de checkout exibe a mensagem de erro específica, preserva os itens e gera uma nova chave de idempotência para a tentativa seguinte.
- **Rollback Otimista:** Ações como favoritar um NFT atualizam a interface instantaneamente. Se a requisição HTTP falhar (ex: erro 500 injetado), o estado reverte automaticamente para o valor anterior sem inconsistência visual.

---

## 6. Acessibilidade (A11y) & Performance (Lighthouse)

- **Acessibilidade WCAG AA:**
  - Contraste de cores superior a 5.5:1 em todos os textos secundários e badges sobre o fundo `#140D0A`.
  - Hierarquia de cabeçalhos estrita (`h1` -> `h2` -> `h3`).
  - Navegação 100% funcional por teclado com anéis de foco visíveis (`focus-visible:ring-2 focus-visible:ring-primary`).
  - Atributos `aria-label`, `role="alert"`, `aria-live="polite"` e textos alternativos em todas as imagens de NFTs.
- **Shimmer Skeletons:**
  - Enquanto dados assíncronos são carregados, a interface exibe réplicas dos cards com animação shimmer sem causar Cumulative Layout Shift (CLS = 0).
- **Desempenho Lighthouse:**
  - Scores auditados: **Performance 100**, **Accessibility 98-100**, **Best Practices 100**, **SEO 92**.

---

## 7. Estrutura de Arquivos

```
├── e2e/                             # Suíte de Testes Playwright (10 arquivos, 32 testes)
│   ├── 01-catalog-search-filters.spec.ts
│   ├── 02-nft-details-and-404.spec.ts
│   ├── 03-auth-session-logout.spec.ts
│   ├── 04-favorites-optimistic.spec.ts
│   ├── 05-cart-and-coupon.spec.ts
│   ├── 06-checkout-and-receipt.spec.ts
│   ├── 07-idempotency-and-refusal.spec.ts
│   ├── 08-profile-and-wallets.spec.ts
│   ├── 09-realtime-socket-price.spec.ts
│   └── 10-skeletons-and-accessibility.spec.ts
├── public/
│   ├── assets/nfts/                 # Imagens oficiais extraídas do Figma
│   └── mockServiceWorker.js         # MSW Worker
├── scripts/
│   ├── extract-figma.mjs            # Extrator automatizado da API REST do Figma
│   └── lighthouse-audit.mjs         # Auditoria automatizada com 3 iterações e mediana
├── src/
│   ├── components/
│   │   ├── catalog/                 # NftCard, NftFilters, HeroBanner, Pagination
│   │   ├── dev/                     # DevScenarioPanel (simulador de rede/erros)
│   │   ├── layout/                  # Header, Footer, PriceAlertBanner
│   │   └── ui/                      # Button, Input, Badge, Skeleton
│   ├── context/                     # AuthContext, CartContext, DevContext
│   ├── lib/                         # axios, query-client, socket, utils
│   ├── mocks/                       # db.ts, handlers.ts, scenarios.ts, socket-server.ts
│   ├── pages/                       # HomePage, NftDetailPage, CartPage, CheckoutPage, etc.
│   ├── router.tsx                   # TanStack Router com rotas estritas
│   ├── types/                       # Schemas Zod e tipagens TypeScript
│   ├── App.tsx                      # Root com Providers
│   └── main.tsx                     # Bootstrap com inicialização do MSW
├── playwright.config.ts             # Configuração Desktop (1440px) e Mobile (390px)
├── tailwind.config.ts               # Paleta de cores exata do Figma
└── vite.config.ts                   # Configuração de build e preview
```
