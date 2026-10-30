import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('11. Evidências Visuais E2E e Interações no Navegador', () => {
  test.setTimeout(90000);

  const getEvidenceDir = (projectName: string) => {
    const isMobile = projectName.includes('Mobile');
    const folder = isMobile ? 'test-evidence/mobile' : 'test-evidence/desktop';
    const absPath = path.resolve(process.cwd(), folder);
    if (!fs.existsSync(absPath)) {
      fs.mkdirSync(absPath, { recursive: true });
    }
    return folder;
  };

  test('deve executar o fluxo completo de ponta a ponta e registrar capturas visuais', async ({ page }, testInfo) => {
    const folder = getEvidenceDir(testInfo.project.name);

    // 1. Catálogo / Home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('DESCUBRA O NOVO OURO DA ARTE DIGITAL');
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${folder}/01-catalogo-home.png`, fullPage: true });

    // 2. Busca e Filtros
    const categoryButton = page.locator('[data-testid="category-filter-collectibles"]');
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
    }
    const sortSelect = page.locator('[data-testid="sort-select"]');
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption('price-asc');
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${folder}/02-catalogo-busca-filtro.png`, fullPage: true });

    // 3. Autenticação / Login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${folder}/03-login-form.png`, fullPage: true });

    const carlosButton = page.locator('button:has-text("Carlos")');
    if (await carlosButton.isVisible()) {
      await carlosButton.click();
    } else {
      await page.locator('[data-testid="login-email-input"]').fill('collector@jungle.io');
      await page.locator('[data-testid="login-password-input"]').fill('password123');
    }
    await page.locator('[data-testid="login-submit-button"]').click();
    await expect(page.locator('[data-testid="user-profile-menu-button"]')).toBeVisible();

    // 4. Detalhes do NFT
    await page.goto('/nft/nft-1');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Ape Sovereign #4092');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${folder}/04-nft-detalhes.png`, fullPage: true });

    // 5. Adicionar ao Carrinho e Aplicar Cupom
    await page.locator('[data-testid="buy-now-button"]').click();
    await expect(page).toHaveURL('/cart');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="cart-item-nft-1"]')).toBeVisible();

    const couponInput = page.locator('input[placeholder*="Ex: JUNGLE10"]');
    await couponInput.fill('GREEN20');
    await page.locator('[data-testid="apply-coupon-button"]').click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${folder}/05-carrinho-com-cupom.png`, fullPage: true });

    // 6. Checkout / Pagamento
    await page.locator('[data-testid="proceed-to-checkout"]').click();
    await expect(page).toHaveURL('/checkout');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Pagamento & Liquidação');

    const walletOption = page.locator('[data-testid^="wallet-select-"]').first();
    await expect(walletOption).toBeVisible();
    await walletOption.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${folder}/06-checkout-pagamento.png`, fullPage: true });

    // 7. Confirmação do Pedido e Recibo
    await page.locator('[data-testid="confirm-payment-button"]').click();
    await expect(page.locator('[data-testid="order-receipt"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Transação Concluída com Sucesso')).toBeVisible();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${folder}/07-confirmacao-pedido-recibo.png`, fullPage: true });

    // 8. Perfil do Colecionador
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="profile-name-input"]')).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${folder}/08-perfil-colecionador.png`, fullPage: true });

    // 9. Gerenciamento de Carteiras
    await page.goto('/wallets');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Carteiras');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${folder}/09-carteiras-gerenciamento.png`, fullPage: true });
  });
});
