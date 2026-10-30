import { test, expect } from '@playwright/test';

test.describe('8. Perfil do Colecionador e Carteiras', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="login-email-input"]').fill('collector@jungle.io');
    await page.locator('[data-testid="login-password-input"]').fill('password123');
    await page.locator('[data-testid="login-submit-button"]').click();
    await expect(page.locator('[data-testid="user-profile-menu-button"]')).toBeVisible();
  });

  test('deve atualizar o nome de exibição no perfil com persistência', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('[data-testid="profile-name-input"]');
    await nameInput.fill('Carlos Colecionador VIP');
    await page.locator('[data-testid="save-profile-button"]').click();

    await expect(page.locator('text=Perfil atualizado com sucesso!')).toBeVisible();

    // Verify after reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(nameInput).toHaveValue('Carlos Colecionador VIP');
  });

  test('deve cadastrar uma nova carteira com validação de formato Ethereum', async ({ page }) => {
    await page.goto('/wallets');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="add-wallet-trigger"]').click();

    // Invalid address
    const addressInput = page.locator('[data-testid="new-wallet-address-input"]');
    await addressInput.fill('endereco-invalido');
    await page.locator('[data-testid="save-wallet-button"]').click();

    await expect(page.locator('text=Endereço Ethereum inválido')).toBeVisible();

    // Valid address
    await addressInput.fill('0x1234567890123456789012345678901234567890');
    await page.locator('[data-testid="save-wallet-button"]').click();

    await expect(page.locator('text=0x1234567890123456789012345678901234567890')).toBeVisible();
  });
});
