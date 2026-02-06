import { test, expect } from '@playwright/test';

test.describe('Quiz Application E2E', () => {
  test('user can start quiz and answer question', async ({ page }) => {
    await page.goto('/');

    // Начать игру
    await page.click('text=Начать игру');

    // Дождаться загрузки вопроса
    await expect(page.locator('h2')).toBeVisible();

    // Проверить наличие прогресс-бара
    await expect(page.locator('text=/Вопрос \\d+ из \\d+/')).toBeVisible();

    // Если это multiple-select - выбрать вариант
    const firstOption = page.locator('button').filter({ hasText: /^A/ }).first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await expect(firstOption).toContainText('✓');
    }
  });

  test('essay question shows textarea and character counter', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Начать игру');

    const textarea = page.locator('textarea');
    if (await textarea.count() > 0) {
      await textarea.fill('A'.repeat(100));
      await expect(page.locator('text=/Символов: 100/')).toBeVisible();
    }
  });
});