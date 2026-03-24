import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Trading PRO');
    await expect(page.locator('button', { hasText: 'Login' })).toBeVisible();
  });

  test('should fail login with wrong credentials', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill('wronguser');
    await page.getByPlaceholder('Password').fill('wrongpass');
    await page.locator('button', { hasText: 'Login' }).click();

    // Check for error message
    // Note: The specific error message might vary, but it should be visible
    await expect(page.locator('.auth-message.error')).toBeVisible();
  });

  test('should toggle to register and back', async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: "Don't have an account? Register" }).click();
    await expect(page.locator('button', { hasText: 'Register' })).toBeVisible();
    await expect(page.locator('p')).toContainText('Create your professional account');

    await page.locator('button', { hasText: 'Already have an account? Login' }).click();
    await expect(page.locator('button', { hasText: 'Login' })).toBeVisible();
  });

  test('should register a new user successfully', async ({ page }) => {
    const username = `testuser_${Date.now()}`;
    await page.goto('/');
    await page.locator('button', { hasText: "Don't have an account? Register" }).click();
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill('testpass123');
    await page.locator('button', { hasText: 'Register' }).click();

    // After registration, it should switch back to login mode with success message
    await expect(page.locator('.auth-message.success')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Login' })).toBeVisible();

    // Now login with the same user
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill('testpass123');
    await page.locator('button', { hasText: 'Login' }).click();

    // Should be redirected to dashboard
    await expect(page.locator('.dashboard')).toBeVisible();
  });
});
