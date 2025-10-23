import { test, expect } from '@playwright/test';

test('E2E 테스트 동작 확인', async ({ page }) => {
  await page.goto('http://localhost:6006/?path=/story/hyperglobe--getting-started');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/HyperGlobe/);
});

test('지구본 랜더링 테스트', async ({ page }) => {
  await page.goto('http://localhost:6006/?path=/story/hyperglobe--getting-started');

  const canvas = page
    .locator('#storybook-preview-iframe')
    .contentFrame()
    .locator('#hyperglobe-canvas[data-is-rendered="true"]');

  await expect(canvas).toBeVisible();
  expect(await canvas.screenshot()).toMatchSnapshot('hyperglobe.png');
});
