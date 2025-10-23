import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:6006/?path=/story/hyperglobe--getting-started');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/HyperGlobe/);
});
