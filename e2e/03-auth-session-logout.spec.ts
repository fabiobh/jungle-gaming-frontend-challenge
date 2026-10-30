import { test, expect } from '@playwright/test';

test.describe('3. Autenticação, Sessão, Cadastro e Logout', () => {
  test('deve realizar login com sucesso e persistir sessão após refresh', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="login-email-input"]').fill('collector@jungle.io');
    await page.locator('[data-testid="login-password-input"]').fill('password123');
    await page.locator('[data-testid="login-submit-button"]').click();

    // After login, redirected to home and user profile button is visible
    await expect(page.locator('[data-testid="user-profile-menu-button"]')).toBeVisible();

    // Reload page: session must persist
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="user-profile-menu-button"]')).toBeVisible();

    // Logout
    await page.locator('[data-testid="user-profile-menu-button"]').click();
    await page.locator('text=Desconectar').click();

    // Should return to unauthenticated state
    await expect(page.locator('button:has-text("Entrar")')).toBeVisible();
  });

  test('deve criar nova conta e tratar validação de senha divergente', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="register-name-input"]').fill('Novo Colecionador');
    await page.locator('[data-testid="register-email-input"]').fill('novousuario@jungle.io');
    await page.locator('[data-testid="register-password-input"]').fill('senha123');
    await page.locator('[data-testid="register-confirm-password-input"]').fill('senhaDivergente');

    await page.locator('[data-testid="register-submit-button"]').click();

    // Must show validation error
    await expect(page.locator('text=As senhas não coincidem')).toBeVisible();
  });
});
