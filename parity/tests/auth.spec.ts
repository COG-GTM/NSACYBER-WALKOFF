import { expect, test } from '@playwright/test';
import { login, randomPassword, shot, username } from './helpers';

test.describe('sign in / sign out', () => {
  test('unauthenticated visit redirects to the login page', async ({ page }) => {
    await page.goto('workflows');
    await expect(page).toHaveURL(/\/walkoff\/login$/);
    await expect(page.getByText('OFF Login')).toBeVisible();
    await shot(page, test.info(), 'login');
  });

  test('wrong password shows "Invalid Login" and stays on login', async ({ page }) => {
    await page.goto('login');
    await page.locator('#username').fill(username());
    await page.locator('#password').fill(randomPassword());
    await page.locator('#login').click();
    await expect(page.locator('#message')).toHaveText('Invalid Login');
    await expect(page).toHaveURL(/\/walkoff\/login$/);
    await shot(page, test.info(), 'login-invalid');
  });

  test('valid login lands on workflows with the full nav and user menu', async ({ page }) => {
    await login(page);
    const nav = page.locator('#walkoffNav');
    for (const item of ['Workflows', 'Execution', 'Applications', 'Reports', 'Settings', 'Documentation']) {
      await expect(nav.getByText(item, { exact: true })).toBeVisible();
    }
    await expect(nav.locator('.userName')).toHaveText(username());

    await nav.locator('#navbarUserDropdown').click();
    await expect(nav.getByText('User Profile')).toBeVisible();
    // Known baseline bug kept: clicking Sign Out does not leave the app (the /logout route never activates).
    await expect(nav.getByText('Sign Out')).toBeVisible();
    await shot(page, test.info(), 'user-menu');
  });
});
