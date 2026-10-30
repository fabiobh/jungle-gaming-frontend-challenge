import { test, expect } from '@playwright/test';

test.describe('4. Favoritos e Atualização Otimista com Rollback', () => {
  test('deve favoritar de forma otimista e persistir para usuário autenticado', async ({ page }) => {
    page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.text()));

    // 1. Start clean
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');

    // 2. Login
    await page.locator('[data-testid="login-email-input"]').fill('collector@jungle.io');
    await page.locator('[data-testid="login-password-input"]').fill('password123');
    await page.locator('[data-testid="login-submit-button"]').click();
    await expect(page.locator('[data-testid="user-profile-menu-button"]')).toBeVisible();

    // 3. Click favorite on nft-2
    const favBtn = page.locator('[data-testid="fav-button-nft-2"]');
    await expect(favBtn).toBeVisible();

    // Optimistic toggle
    const favPromise = page.waitForResponse((res) => res.url().includes('/api/favorites/nft-2') && res.status() === 200);
    await favBtn.click();
    await expect(favBtn).toHaveClass(/bg-status-error/);
    await favPromise;

    // Refresh page: token stays in localStorage!
    await page.reload();
    await expect(page.locator('[data-testid="user-profile-menu-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="fav-button-nft-2"]')).toHaveClass(/bg-status-error/);
  });

  test('deve reverter atualização otimista (rollback) se a requisição falhar', async ({ page }) => {
    // 1. Start clean and authenticated
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('__jungle_auth_token__', 'token_user-1');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Configure mock scenario to force HTTP 500 error
    await page.evaluate(() => {
      (window as any).__jungle_scenario__?.update({ forceHttpError: 500 });
    });

    const favBtn = page.locator('[data-testid="fav-button-nft-3"]');
    await expect(favBtn).toBeVisible();
    await expect(favBtn).not.toHaveClass(/bg-status-error/);

    // 3. Click favorite -> wait for 500 failure -> rolls back to un-favorited state
    const failPromise = page.waitForResponse(
      (res) => res.url().includes('/api/favorites/nft-3') && res.status() === 500
    );
    await favBtn.click();
    await failPromise;
    await expect(favBtn).not.toHaveClass(/bg-status-error/);

    // 4. Reset scenario
    await page.evaluate(() => {
      (window as any).__jungle_scenario__?.reset();
    });
  });
});
