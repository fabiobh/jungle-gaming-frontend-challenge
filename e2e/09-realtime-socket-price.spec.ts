import { test, expect } from '@playwright/test';

test.describe('9. Tempo Real com Socket.IO e Invalidação de Preço', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('deve alertar o usuário quando o preço de um item do carrinho for alterado via socket', async ({ page }) => {
    // 1. Add nft-1 to cart
    await page.goto('/nft/nft-1');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="buy-now-button"]').click();

    await expect(page).toHaveURL('/cart');

    // 2. Open Dev Panel and trigger socket event `nft.updated`
    await page.locator('[data-testid="dev-panel-trigger"]').click();
    await page.locator('button:has-text("nft.updated")').click();
    await page.locator('button:has-text("✕")').click();

    // 3. Price change banner alert must be visible on the page
    const alertBanner = page.locator('role=alert');
    await expect(alertBanner).toBeVisible();
    await expect(alertBanner).toContainText('Atenção: O NFT "Ape Sovereign #4092" foi atualizado em tempo real!');
  });
});
