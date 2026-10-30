# Relatório de Evidências de Testes — GreenMint NFT Marketplace

Este documento consolida a execução dos **testes unitários, de integração e ponta a ponta (E2E)** realizados com automação do navegador Google Chrome em modo visível (`--headed`), registrando as evidências visuais de fidelidade ao Figma, regras de negócio e estabilidade da aplicação.

---

## 1. Onde Estão as Provas do Teste?

Todas as capturas de tela em alta resolução geradas durante a execução real no Chrome estão organizadas nas seguintes pastas na raiz do projeto:

| Plataforma | Resolução / Viewport | Pasta das Evidências |
| :--- | :--- | :--- |
| **Desktop** | `1440 × 900` (Padrão Figma) | [`test-evidence/desktop/`](./test-evidence/desktop/) |
| **Mobile** | `390 × 844` (Pixel 7 / Mobile Padrão) | [`test-evidence/mobile/`](./test-evidence/mobile/) |

---

## 2. O Que Foi Executado nos Testes

### A. Testes Unitários e de Integração Lógica (`e2e/00-unit-and-integration.spec.ts`)
* **Precisão Numérica de ETH**: Validação de conversão e cálculo de frações de ETH (`formatEth`) garantindo que operem como strings decimais estáveis (sem dízimas ou inconsistências de ponto flutuante `0.1 + 0.2`).
* **Validação de Schemas Zod**:
  * `loginSchema`: Validação de padrão de e-mail e requisito mínimo de 6 caracteres na senha.
  * `registerSchema`: Checagem estrita de confirmação de senha idêntica (`confirmPassword`).
  * `profileSchema`: Limitação de tamanho de biografia para 200 caracteres.
  * `changePasswordSchema`: Validação de senha atual e confirmação da nova senha.
  * `walletSchema`: Validação de endereço hexadecimal Ethereum `0x` de 42 caracteres e rede suportada.
* **Regras de Negócio e Mock DB**:
  * Validação de cupons ativos (`JUNGLE10` - 10%, `GREEN20` - 20%) e cupom expirado (`EXPIRED50`).
  * Autenticação e integridade do banco mock em memória e persistência de carteiras por usuário.

### B. Testes E2E com Automação do Chrome (`e2e/11-visual-evidence.spec.ts`)
O navegador Google Chrome foi executado em modo `--headed`, simulando o comportamento de um usuário real através dos 9 fluxos principais:
1. **Catálogo & Home**: Carregamento de banners, destaques e grid de obras.
2. **Busca e Filtros**: Filtragem dinâmica por categoria (*Colecionáveis*) e ordenação por *Menor Preço*.
3. **Autenticação**: Acesso à tela de login e preenchimento com credenciais de teste em 1-clique.
4. **Detalhes do NFT**: Acesso direto à obra `Ape Sovereign #4092`, verificação de atributos e seletor de quantidade.
5. **Carrinho e Desconto**: Adição de item, aplicação do cupom `GREEN20` (20% OFF) e recálculo do resumo financeiro.
6. **Checkout & Seleção de Carteira**: Redirecionamento autenticado, escolha da carteira de destino e rede.
7. **Confirmação e Recibo Imutável**: Submissão do pedido com idempotência e geração do comprovante com TX hash.
8. **Perfil do Colecionador**: Exibição dos dados do usuário autenticado e formulário de senha.
9. **Gestão de Carteiras**: Exibição das carteiras cadastradas (Principal e Secundária).

---

## 3. Tabela de Provas e Capturas Visuais

| Etapa | Fluxo Testado | Evidência Desktop | Evidência Mobile | Status |
| :---: | :--- | :--- | :--- | :---: |
| **01** | Catálogo / Home Inicial | [`01-catalogo-home.png`](./test-evidence/desktop/01-catalogo-home.png) | [`01-catalogo-home.png`](./test-evidence/mobile/01-catalogo-home.png) | ✅ Aprovado |
| **02** | Filtro de Colecionáveis e Menor Preço | [`02-catalogo-busca-filtro.png`](./test-evidence/desktop/02-catalogo-busca-filtro.png) | [`02-catalogo-busca-filtro.png`](./test-evidence/mobile/02-catalogo-busca-filtro.png) | ✅ Aprovado |
| **03** | Formulário de Login (com 1-clique) | [`03-login-form.png`](./test-evidence/desktop/03-login-form.png) | [`03-login-form.png`](./test-evidence/mobile/03-login-form.png) | ✅ Aprovado |
| **04** | Detalhes do NFT com Propriedades | [`04-nft-detalhes.png`](./test-evidence/desktop/04-nft-detalhes.png) | [`04-nft-detalhes.png`](./test-evidence/mobile/04-nft-detalhes.png) | ✅ Aprovado |
| **05** | Carrinho com Cupom `GREEN20` (20% OFF) | [`05-carrinho-com-cupom.png`](./test-evidence/desktop/05-carrinho-com-cupom.png) | [`05-carrinho-com-cupom.png`](./test-evidence/mobile/05-carrinho-com-cupom.png) | ✅ Aprovado |
| **06** | Checkout com Seleção de Carteira | [`06-checkout-pagamento.png`](./test-evidence/desktop/06-checkout-pagamento.png) | [`06-checkout-pagamento.png`](./test-evidence/mobile/06-checkout-pagamento.png) | ✅ Aprovado |
| **07** | Recibo de Pedido com TX Hash e Snapshot | [`07-confirmacao-pedido-recibo.png`](./test-evidence/desktop/07-confirmacao-pedido-recibo.png) | [`07-confirmacao-pedido-recibo.png`](./test-evidence/mobile/07-confirmacao-pedido-recibo.png) | ✅ Aprovado |
| **08** | Perfil do Colecionador | [`08-perfil-colecionador.png`](./test-evidence/desktop/08-perfil-colecionador.png) | [`08-perfil-colecionador.png`](./test-evidence/mobile/08-perfil-colecionador.png) | ✅ Aprovado |
| **09** | Carteiras Conectadas (Principal / Secundária) | [`09-carteiras-gerenciamento.png`](./test-evidence/desktop/09-carteiras-gerenciamento.png) | [`09-carteiras-gerenciamento.png`](./test-evidence/mobile/09-carteiras-gerenciamento.png) | ✅ Aprovado |

---

## 4. Como Executar os Testes Novamente

Para rodar todos os testes abrindo o navegador do Chrome em modo visível:

```bash
# Executa a suíte visual completa abrindo a janela do navegador
npx playwright test e2e/00-unit-and-integration.spec.ts e2e/11-visual-evidence.spec.ts --headed

# Para rodar com delay visual desacelerado (para acompanhar cada clique)
npx playwright test e2e/11-visual-evidence.spec.ts --headed --project="Desktop Chromium"
```

Para rodar toda a suíte de 32+ testes E2E do projeto em modo headless:
```bash
npm run test:e2e
```
