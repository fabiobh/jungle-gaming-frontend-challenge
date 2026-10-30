import { test, expect } from '@playwright/test';

test.describe('2. Detalhes do NFT e Tratamento de 404', () => {
  test('deve acessar diretamente a página de detalhes de um NFT existente', async ({ page }) => {
    await page.goto('/nft/nft-1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Ape Sovereign #4092');
    await expect(page.locator('text=2.4500 ETH')).toBeVisible();
    await expect(page.locator('text=Propriedades e Raridade')).toBeVisible();
    await expect(page.locator('[data-testid="buy-now-button"]')).toBeVisible();
  });

  test('deve exibir mensagem amigável de erro 404 para NFT inexistente', async ({ page }) => {
    await page.goto('/nft/nft-inexistente-999');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="nft-not-found"]')).toBeVisible();
    await expect(page.locator('text=NFT Não Encontrado')).toBeVisible();
  });
});
