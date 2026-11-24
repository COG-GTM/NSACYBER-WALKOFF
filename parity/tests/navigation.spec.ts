import { expect, test } from '@playwright/test';
import { gotoApp, login } from './helpers';

test.beforeEach(async ({ page }) => login(page));

test('root redirects to /workflows', async ({ page }) => {
  await page.goto('');
  await expect(page).toHaveURL(/\/walkoff\/workflows$/);
});

test('settings dropdown lists Users, Globals, Scheduler, Portainer and routes to each', async ({ page }) => {
  const nav = page.locator('#walkoffNav');
  const settings = nav.locator('.nav-item.dropdown', { hasText: 'Settings' });
  for (const [label, url, heading] of [
    ['Users', /settings\/users$/, 'User Settings'],
    ['Globals', /settings\/globals$/, 'Global Variables'],
    ['Scheduler', /settings\/scheduler$/, 'Add To Schedule'],
  ] as const) {
    await settings.locator('.dropdown-toggle').click();
    await expect(settings.getByText('Portainer.io')).toBeVisible();
    await settings.getByText(label, { exact: true }).click();
    await expect(page).toHaveURL(url);
    await expect(page.locator('#main')).toContainText(heading);
  }
});

test('reports dropdown offers "Create New Report..."', async ({ page }) => {
  const reports = page.locator('#walkoffNav .nav-item.dropdown', { hasText: 'Reports' });
  await reports.locator('.dropdown-toggle').click();
  await reports.getByText('Create New Report...').click();
  await expect(page).toHaveURL(/report\/new$/);
  await expect(page.getByRole('heading', { name: /New Report/ })).toBeVisible();
});

test('nav links route to Workflows, Execution and Applications', async ({ page }) => {
  const nav = page.locator('#walkoffNav');
  await nav.getByText('Execution', { exact: true }).click();
  await expect(page).toHaveURL(/\/execution$/);
  await nav.getByText('Applications', { exact: true }).click();
  await expect(page).toHaveURL(/\/apps$/);
  await nav.getByText('Workflows', { exact: true }).click();
  await expect(page).toHaveURL(/\/workflows$/);
  await gotoApp(page, 'apps');
  await expect(page.locator('#main')).toContainText('Manage Applications');
});
