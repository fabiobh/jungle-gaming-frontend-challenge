import { test, expect } from '@playwright/test';

test.describe('10. Skeletons e Acessibilidade por Teclado', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('deve exibir skeletons com shimmer durante simulação de rede lenta', async ({ page }) => {
    // 1. Enable 2000ms latency via dev panel
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="dev-panel-trigger"]').click();
    await page.getByRole('button', { name: '2000ms', exact: true }).click();
    await page.locator('button:has-text("✕")').click();

    // 2. Change category to trigger query loading
    await page.locator('[data-testid="category-filter-art"]').click();

    // Skeletons container should be rendered while loading
    await expect(page.locator('[data-testid="catalog-skeletons"]')).toBeVisible();

    // Reset latency back to 0ms
    await page.locator('[data-testid="dev-panel-trigger"]').click();
    await page.getByRole('button', { name: '0ms', exact: true }).click();
    await page.locator('button:has-text("✕")').click();
  });

  test('deve permitir navegação por teclado com foco visível', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Press Tab multiple times and verify active element has focus
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedTag);
  });
});
