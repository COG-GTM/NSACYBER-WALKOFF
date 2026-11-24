import { expect, test } from '@playwright/test';
import { apiDeleteUser, confirmBootbox, dismissToasts, gotoApp, login, randomPassword, shot, stamp, username } from './helpers';

test.beforeEach(async ({ page }) => { await login(page); await gotoApp(page, 'settings/users'); });

const userRows = page => page.locator('#userSettings datatable-body-row');
const row = (page, text: string) => userRows(page).filter({ hasText: text });

test('users list shows the seeded users and filters', async ({ page }) => {
  await expect(row(page, username()).first()).toBeVisible();
  await expect(row(page, 'super_admin').first()).toBeVisible();
  await expect(page.locator('#userSettings datatable-footer')).toContainText(/\d+ total/);
  await shot(page, test.info(), 'users');
  await page.getByPlaceholder('Filter Users...').fill('super_adm');
  await expect(userRows(page)).toHaveCount(1);
  await expect(userRows(page).first()).toContainText('super_admin');
});

test('roles tab lists roles with their permissions', async ({ page }) => {
  await page.getByRole('tab', { name: 'Role Settings' }).or(page.getByText('Role Settings')).first().click();
  const roles = page.locator('#roleSettings');
  await expect(roles.getByRole('button', { name: /Add Role/ })).toBeVisible();
  await expect(roles.locator('datatable-body-row').filter({ hasText: 'super_admin' })).toBeVisible();
  await expect(roles.locator('datatable-body-row').filter({ hasText: 'workflows:' }).first()).toBeVisible();
  await shot(page, test.info(), 'roles');
});

test('add user with validation, edit and delete', async ({ page }) => {
  const name = stamp('parity-user');
  const pw = randomPassword();

  await page.getByRole('button', { name: /Add User/ }).click();
  const modal = page.locator('ngb-modal-window');
  await expect(modal.locator('.modal-title')).toHaveText('Add New User');
  const submit = modal.locator('.modal-footer .btn-primary');
  await expect(submit).toBeDisabled();

  await modal.locator('input[name=username]').fill(name);
  await modal.locator('input[name=username]').fill('');
  await modal.locator('input[name=newPassword]').click();
  await expect(modal.getByText('Username is required.')).toBeVisible();
  await modal.locator('input[name=username]').fill(name);

  await modal.locator('.select2-selection').click();
  await page.locator('.select2-search__field').fill('admin');
  await page.locator('.select2-results__option', { hasText: /^admin$/ }).click();

  await modal.locator('input[name=newPassword]').fill(pw);
  await modal.locator('input[name=confirmNewPassword]').fill(`${pw}x`);
  await modal.locator('input[name=newPassword]').click();
  await expect(modal.getByText('Passwords do not match.')).toBeVisible();
  await shot(page, test.info(), 'user-modal');
  await modal.locator('input[name=confirmNewPassword]').fill(pw);
  await modal.locator('input[name=newPassword]').click();
  await expect(modal.getByText('Passwords do not match.')).toBeHidden();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(modal).toBeHidden();
  await expect(row(page, name)).toContainText('admin');
  await expect(row(page, name)).toContainText('Yes');

  // Edit opens prefilled
  await row(page, name).locator('button.btn-primary').click();
  await expect(modal.locator('.modal-title')).toHaveText(`Edit User: ${name}`);
  await expect(modal.locator('input[name=username]')).toHaveValue(name);
  await expect(modal.locator('label[for=is_active]')).toHaveText('Active');
  await modal.getByRole('button', { name: 'Undo Changes and Close' }).click();
  await expect(modal).toBeHidden();

  // Delete. Known baseline bug kept: the client reads `user.id` but the API returns `id_`, so
  // Delete sends DELETE /users/undefined (404) and the row stays. Assert that, then clean up via the API.
  await dismissToasts(page);
  await row(page, name).locator('button.btn-danger').click();
  await expect(page.locator('.bootbox.modal')).toContainText(`Are you sure you want to delete ${name}?`);
  await confirmBootbox(page);
  await page.waitForTimeout(1000);
  await expect(row(page, name)).toHaveCount(1);
  await apiDeleteUser(page, name);
  await page.reload();
  await expect(row(page, name)).toHaveCount(0);
});
