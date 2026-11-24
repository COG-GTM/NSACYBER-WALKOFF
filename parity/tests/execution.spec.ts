import { expect, test } from '@playwright/test';
import { gotoApp, login, shot } from './helpers';

test('execution page lists workflow runs with filter and paging footer', async ({ page }) => {
  await login(page);
  await gotoApp(page, 'execution');
  await expect(page.locator('#playbookBreadcrumbs')).toContainText('Execution');
  for (const col of ['Workflow', 'Started By', 'Started At', 'Completed At', 'Status', 'Current Action', 'Actions']) {
    await expect(page.locator('datatable-header').getByText(col, { exact: true })).toBeVisible();
  }
  await expect(page.getByPlaceholder('Filter Results...')).toBeEditable();
  await expect(page.locator('datatable-footer')).toContainText(/\d+ total/);
  await expect(page.getByText('Select a Workflow')).toBeVisible();
  await shot(page, test.info(), 'execution');
});

test('applications page', async ({ page }) => {
  await login(page);
  await gotoApp(page, 'apps');
  await expect(page.locator('#playbookBreadcrumbs')).toContainText('Manage Applications');
  await shot(page, test.info(), 'apps');
});
