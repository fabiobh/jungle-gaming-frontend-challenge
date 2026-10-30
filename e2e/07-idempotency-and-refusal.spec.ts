import { test, expect } from '@playwright/test';

test.describe('7. Falha de Pagamento e Idempotência', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('deve tratar recusa de pagamento e permitir recuperação sem duplicar pedido', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="login-email-input"]').fill('collector@jungle.io');
    await page.locator('[data-testid="login-password-input"]').fill('password123');
    await page.locator('[data-testid="login-submit-button"]').click();
    await expect(page.locator('[data-testid="user-profile-menu-button"]')).toBeVisible();

    // 2. Add NFT to cart
    await page.goto('/nft/nft-2');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="buy-now-button"]').click();

    await expect(page).toHaveURL('/cart');
    await page.locator('[data-testid="proceed-to-checkout"]').click();

    await expect(page).toHaveURL('/checkout');
    await expect(page.locator('h1')).toContainText('Pagamento & Liquidação');

    // Select wallet
    const walletOption = page.locator('[data-testid^="wallet-select-"]').first();
    await expect(walletOption).toBeVisible();
    await walletOption.click();

    // 3. Open dev panel and enable "Simular Recusa no Checkout"
    await page.locator('[data-testid="dev-panel-trigger"]').click();
    await page.locator('input[type="checkbox"]').first().check(); // simulate payment failure
    await page.locator('button:has-text("✕")').click();

    // 4. Try checkout -> should fail with message
    await page.locator('[data-testid="confirm-payment-button"]').click();
    await expect(page.locator('text=recusada pela rede')).toBeVisible();

    // 5. Disable failure and retry -> should succeed
    await page.locator('[data-testid="dev-panel-trigger"]').click();
    await page.locator('input[type="checkbox"]').first().uncheck();
    await page.locator('button:has-text("✕")').click();

    await page.locator('[data-testid="confirm-payment-button"]').click();
    await expect(page.locator('[data-testid="order-receipt"]')).toBeVisible({ timeout: 10000 });
  });
});
