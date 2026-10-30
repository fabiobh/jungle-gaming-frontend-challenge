import { test, expect } from '@playwright/test';

test.describe('6. Fluxo Completo de Compra e Recibo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('deve executar o fluxo do catálogo até a confirmação e recibo do pedido', async ({ page }) => {
    // 1. Login first and wait for authentication to complete
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="login-email-input"]').fill('collector@jungle.io');
    await page.locator('[data-testid="login-password-input"]').fill('password123');
    await page.locator('[data-testid="login-submit-button"]').click();
    await expect(page.locator('[data-testid="user-profile-menu-button"]')).toBeVisible();

    // 2. Add NFT to cart
    await page.goto('/nft/nft-1');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="buy-now-button"]').click();

    // 3. From cart, proceed to checkout
    await expect(page).toHaveURL('/cart');
    await page.locator('[data-testid="proceed-to-checkout"]').click();

    // 4. On checkout page, select wallet and confirm
    await expect(page).toHaveURL('/checkout');
    await expect(page.locator('h1')).toContainText('Pagamento & Liquidação');

    // Ensure wallet option is loaded and selected
    const walletOption = page.locator('[data-testid^="wallet-select-"]').first();
    await expect(walletOption).toBeVisible();
    await walletOption.click();

    await page.locator('[data-testid="confirm-payment-button"]').click();

    // 5. Arrive at Order Receipt page
    await expect(page.locator('[data-testid="order-receipt"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Transação Concluída com Sucesso')).toBeVisible();
    await expect(page.locator('[data-testid="order-tx-hash"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-confirmed-total"]')).toBeVisible();
  });
});
