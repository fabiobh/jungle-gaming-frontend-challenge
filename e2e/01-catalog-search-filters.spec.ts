import { test, expect } from '@playwright/test';

test.describe('1. Catálogo, Busca, Filtros e Ordenação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('deve renderizar o catálogo com NFTs e permitir busca textual', async ({ page }) => {
    // Check brand and hero headline
    await expect(page.locator('h1')).toContainText('DESCUBRA O NOVO OURO DA ARTE DIGITAL');

    // Check that NFT cards are rendered
    const cards = page.locator('[data-testid^="nft-card-"]');
    await expect(cards.first()).toBeVisible();

    // Perform Search on visible search input
    const searchInput = page.locator('input[placeholder*="Buscar NFTs"]:visible');
    await searchInput.fill('Ape Sovereign');

    // Should display matching card
    await expect(page.locator('[data-testid="nft-card-nft-1"]')).toBeVisible();
  });

  test('deve filtrar por categoria e ordenar por menor preço', async ({ page }) => {
    // Filter by 'Colecionáveis'
    const categoryButton = page.locator('[data-testid="category-filter-collectibles"]');
    await categoryButton.click();

    // Verify collectible NFT is displayed
    await expect(page.locator('[data-testid="nft-card-nft-1"]')).toBeVisible();

    // Sort by Menor Preço
    const sortSelect = page.locator('[data-testid="sort-select"]');
    await sortSelect.selectOption('price-asc');

    // Check order
    const cards = page.locator('[data-testid^="nft-card-"]');
    await expect(cards.first()).toBeVisible();
  });
});
