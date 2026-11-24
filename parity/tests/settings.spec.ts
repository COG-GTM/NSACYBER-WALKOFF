import { expect, test } from '@playwright/test';
import { gotoApp, login, shot } from './helpers';

test.beforeEach(async ({ page }) => login(page));

test('globals: list, filter and add-global validation', async ({ page }) => {
  await gotoApp(page, 'settings/globals');
  await expect(page.locator('#playbookBreadcrumbs')).toContainText('Global Variables');
  for (const col of ['Name', 'ID', 'Value', 'Description', 'Actions']) {
    await expect(page.locator('datatable-header').getByText(col, { exact: true })).toBeVisible();
  }
  await expect(page.getByPlaceholder('Filter Globals...')).toBeEditable();
  await shot(page, test.info(), 'globals');

  await page.getByRole('button', { name: /Add Global/ }).click();
  const modal = page.locator('ngb-modal-window');
  await expect(modal.locator('.modal-title')).toHaveText('Add Global Variable');
  for (const field of ['Name', 'Value', 'Description (optional)']) {
    await expect(modal.locator('label', { hasText: field }).first()).toBeVisible();
  }
  await expect(modal.locator('input[name=name]')).toBeEditable();
  await shot(page, test.info(), 'global-modal');
  await modal.getByRole('button', { name: 'Close' }).click();
  await expect(modal).toBeHidden();
});

test('scheduler: list and add-to-schedule form', async ({ page }) => {
  await gotoApp(page, 'settings/scheduler');
  await expect(page.locator('#main')).toContainText('Scheduler');
  await expect(page.locator('#main')).toContainText(/Scheduler\s*(stopped|running|paused)/i);
  for (const col of ['Name', 'Workflow(s)', 'Status', 'Type', 'Rule', 'Actions']) {
    await expect(page.locator('datatable-header').getByText(col, { exact: true })).toBeVisible();
  }
  await shot(page, test.info(), 'scheduler');

  await page.getByRole('button', { name: /Add To Schedule/ }).click();
  const modal = page.locator('ngb-modal-window');
  await expect(modal.locator('.modal-title')).toHaveText(/Schedule/);
  const trigger = modal.locator('select[name=type]');
  await expect(trigger.locator('option')).toHaveText(['', 'date', 'interval', 'cron']);
  await trigger.selectOption('interval');
  await expect(modal.getByText('Occur every...')).toBeVisible();
  await expect(modal.getByText('Start Datetime')).toBeVisible();
  await shot(page, test.info(), 'scheduler-modal');
  await modal.locator('.modal-footer .btn-secondary').click();
  await expect(modal).toBeHidden();
});
