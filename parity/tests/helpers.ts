import { expect, Locator, Page, TestInfo } from '@playwright/test';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export const username = () => required('WALKOFF_USERNAME');
export const password = () => required('WALKOFF_PASSWORD');

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Set ${name} (credentials of an existing WALKOFF admin user)`);
  return v;
}

export const stamp = (prefix: string) => `${prefix}-${Date.now()}-${randomBytes(2).toString('hex')}`;
export const randomPassword = () => `${randomBytes(12).toString('base64').replace(/[^A-Za-z0-9]/g, '')}Aa1!`;

export async function login(page: Page) {
  await page.goto('login');
  await page.locator('#username').fill(username());
  await page.locator('#password').fill(password());
  await page.locator('#login').click();
  await expect(page).toHaveURL(/\/walkoff\/workflows$/);
  await expect(page.locator('#walkoffNav')).toContainText('Workflows');
}

export async function gotoApp(page: Page, route: string) {
  await page.goto(route);
  await expect(page.locator('#walkoffNav')).toBeVisible();
}

export const toast = (page: Page) => page.locator('#toast-container');

export async function confirmBootbox(page: Page) {
  const dialog = page.locator('.bootbox.modal');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /OK|Confirm/i }).click();
  await expect(dialog).toBeHidden();
}

export async function promptBootbox(page: Page, value: string) {
  const dialog = page.locator('.bootbox.modal');
  await expect(dialog).toBeVisible();
  await dialog.locator('input').fill(value);
  await dialog.getByRole('button', { name: /OK|Confirm/i }).click();
  await expect(dialog).toBeHidden();
}

export async function dismissToasts(page: Page) {
  const toasts = page.locator('#toast-container .toast');
  while (await toasts.count()) {
    await toasts.first().click().catch(() => undefined);
    await page.waitForTimeout(400);
  }
}

export const rows = (page: Page) => page.locator('datatable-body-row');

export async function shot(page: Page, testInfo: TestInfo, name: string) {
  const dir = path.join(__dirname, '..', 'screenshots', testInfo.project.name);
  fs.mkdirSync(dir, { recursive: true });
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: path.join(dir, `${name}.png`),
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
    mask: [toast(page)],
  });
}

export async function apiDeleteUser(page: Page, name: string) {
  const auth = await page.request.post('api/auth/login', { data: { username: username(), password: password() } });
  const headers = { Authorization: `Bearer ${(await auth.json()).access_token}` };
  for (let p = 1; p < 20; p++) {
    const users = await (await page.request.get(`api/users/?page=${p}`, { headers })).json();
    if (!users.length) break;
    const u = users.find(x => x.username === name);
    if (u) {
      expect((await page.request.delete(`api/users/${u.id_}`, { headers })).ok()).toBeTruthy();
      return;
    }
  }
  throw new Error(`user ${name} not found`);
}

/** HTML5 drag and drop via synthetic DragEvents sharing one DataTransfer (mouse-driven dragTo does not
 * start a native drag for these elements in headless Chromium). */
export async function html5Drag(page: Page, source: Locator, target: Locator) {
  const dt = await page.evaluateHandle(() => new DataTransfer());
  const box = await target.boundingBox();
  const at = { clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 };
  await source.dispatchEvent('dragstart', { dataTransfer: dt });
  await target.dispatchEvent('dragenter', { dataTransfer: dt, ...at });
  await target.dispatchEvent('dragover', { dataTransfer: dt, ...at });
  await target.dispatchEvent('drop', { dataTransfer: dt, ...at });
  await source.dispatchEvent('dragend', { dataTransfer: dt });
}

/** List filters debounce input by 500 ms and then re-render every card; wait for that to happen. */
export async function settleFilter(page: Page) {
  await page.waitForTimeout(800);
}
