import { test, expect } from '@playwright/test';

test.describe('Dashboard Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    // For a real app, we would use a setup script or save auth state
    await page.goto('/');
    const username = `user_${Date.now()}`;
    await page.locator('button', { hasText: "Don't have an account? Register" }).click();
    await expect(page.locator('button', { hasText: 'Register' })).toBeVisible();
    await expect(page.locator('p')).toContainText('Create your professional account');
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill('testpass123');
    await page.locator('button', { hasText: 'Register' }).click();
    
    // Wait for success message/switch to login (extended timeout for flakiness)
    await expect(page.locator('.auth-message.success')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button', { hasText: 'Login' })).toBeVisible();

    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill('testpass123');
    await page.locator('button', { hasText: 'Login' }).click();

    // Verify we are on the dashboard
    await expect(page.locator('.dashboard')).toBeVisible();
  });

  test('should show initial ticker data', async ({ page }) => {
    // Check if at least one ticker is visible in the list
    await expect(page.locator('.ticker-name').first()).toBeVisible();
    // Check if the chart is rendered
    await expect(page.locator('.recharts-responsive-container')).toBeVisible();
  });

  test('should update chart when a new ticker is picked', async ({ page }) => {
    // Find the ticker list or dropdown
    // Note: Assuming there's a list or select for tickers
    const tickerList = page.locator('.ticker-list');
    await expect(tickerList).toBeVisible();

    const secondTicker = tickerList.locator('li').nth(1);
    const tickerName = await secondTicker.locator('.ticker-name').textContent();
    await secondTicker.click();

    // Verify the dashboard updates to the new ticker
    // The active ticker in the list should now be the one we clicked
    await expect(tickerList.locator('li.active .ticker-name')).toContainText(tickerName?.trim() || '');

    // The chart should still be visible and updated
    await expect(page.locator('.recharts-responsive-container')).toBeVisible();
  });

  test('should show real-time price updates', async ({ page }) => {
    // Get initial price of the active ticker
    const priceLocator = page.locator('.ticker-list li.active .ticker-price');
    const initialPriceText = await priceLocator.textContent();

    // Wait for the price to change (due to WebSocket updates)
    await expect(async () => {
      const newPriceText = await priceLocator.textContent();
      expect(newPriceText).not.toBe(initialPriceText);
    }).toPass({ timeout: 10000 });
  });
});
