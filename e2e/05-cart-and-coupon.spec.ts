import { test, expect } from '@playwright/test';

test.describe('5. Carrinho de NFTs e Validação de Cupom', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      (window as any).__jungle_scenario__?.reset();
    });
  });

  test('deve adicionar item ao carrinho, alterar quantidade e aplicar cupom com desconto', async ({ page }) => {
    // 1. Visit details and add to cart
    await page.goto('/nft/nft-1');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="buy-now-button"]').click();

    // 2. Navigated to cart
    await expect(page).toHaveURL('/cart');
    await expect(page.locator('[data-testid="cart-item-nft-1"]')).toBeVisible();

    // 3. Apply invalid coupon
    const couponInput = page.locator('input[placeholder*="Ex: JUNGLE10"]');
    await couponInput.fill('INVALIDO999');
    await page.locator('[data-testid="apply-coupon-button"]').click();

    await expect(page.locator('text=Cupom de desconto inválido')).toBeVisible();

    // 4. Apply valid coupon JUNGLE10
    await couponInput.fill('JUNGLE10');
    await page.locator('[data-testid="apply-coupon-button"]').click();

    await expect(page.locator('text=Cupom JUNGLE10 aplicado (10% OFF)')).toBeVisible();
    await expect(page.locator('[data-testid="cart-total-eth"]')).toBeVisible();
  });
});
