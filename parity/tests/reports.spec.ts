import { expect, test } from '@playwright/test';
import { confirmBootbox, dismissToasts, gotoApp, html5Drag, login, shot, stamp, toast } from './helpers';

test('create report with validation, view, edit and delete', async ({ page }) => {
  const name = stamp('parity-report');
  await login(page);
  await gotoApp(page, 'report/new');
  await expect(page.getByRole('heading', { name: /New Report/ })).toBeVisible();
  for (const w of ['Text Widget', 'Table Widget', 'Bar Graph', 'Line Graph', 'Pie Graph', 'Kibana Embed']) {
    await expect(page.locator('.actionPanel', { hasText: w })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Please enter a name for the report.')).toBeVisible();
  await shot(page, test.info(), 'report-new');

  await page.getByPlaceholder('Report Name').fill(name);
  await page.locator('.actionPanel', { hasText: 'Text Widget' }).dblclick();
  const widgetModal = page.locator('ngb-modal-window');
  await expect(widgetModal.locator('.modal-title')).toHaveText('Configure Text Widget');
  await widgetModal.getByRole('button', { name: 'Save' }).click();
  await expect(widgetModal).toBeHidden();
  await expect(page.locator('gridster-item')).toHaveCount(1);

  // drag and drop a widget onto the grid
  await html5Drag(page, page.locator('.actionPanel', { hasText: 'Bar Graph' }), page.locator('gridster'));
  await expect(widgetModal.locator('.modal-title')).toHaveText('Configure Bar Graph');
  await widgetModal.getByRole('button', { name: 'Save' }).click();
  await expect(widgetModal).toBeHidden();
  await expect(page.locator('gridster-item')).toHaveCount(2);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(toast(page)).toContainText(`"${name}" Saved`);
  await expect(page).toHaveURL(/\/report\/[0-9a-f-]+$/);
  await expect(page.locator('h1')).toContainText(name);
  await expect(page.getByRole('button', { name: 'Save as PDF' })).toBeVisible();
  await expect(page.locator('gridster-item')).toHaveCount(2);

  const reports = page.locator('#walkoffNav .nav-item.dropdown', { hasText: 'Reports' });
  await reports.locator('.dropdown-toggle').click();
  await expect(reports.getByText(name)).toBeVisible();
  await reports.locator('.dropdown-toggle').click();
  await dismissToasts(page);
  await shot(page, test.info(), 'report-view');

  await page.getByRole('link', { name: 'Edit' }).click();
  await expect(page).toHaveURL(/\/report\/[0-9a-f-]+\/edit$/);
  await expect(page.getByRole('heading', { name: /Edit Report/ })).toBeVisible();
  await expect(page.getByPlaceholder('Report Name')).toHaveValue(name);

  await page.locator('h1 .btn-danger').click();
  await confirmBootbox(page);
  await expect(page).toHaveURL(/\/report\/new$/);
  await reports.locator('.dropdown-toggle').click();
  await expect(reports.getByText(name)).toHaveCount(0);
});
