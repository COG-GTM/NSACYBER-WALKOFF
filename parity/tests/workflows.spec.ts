import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { confirmBootbox, dismissToasts, gotoApp, login, promptBootbox, shot, stamp, toast } from './helpers';

test.beforeEach(async ({ page }) => login(page));

const card = (page, name: string) => page.locator('.workflow-card', { has: page.locator('.card-title', { hasText: name }) });

function workflowFile(name: string): string {
  const wf = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'workflow.json'), 'utf8'));
  wf.id_ = randomUUID();
  wf.name = name;
  delete wf.execution_id;
  const file = path.join(os.tmpdir(), `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(wf));
  return file;
}

async function deleteWorkflow(page, name: string) {
  const c = card(page, name);
  await c.locator('.workflow-menu-link').click();
  await c.getByRole('button', { name: 'Delete' }).click();
  await confirmBootbox(page);
  await expect(toast(page)).toContainText(`Deleted ${name}`);
  await expect(card(page, name)).toHaveCount(0);
}

test('workflows landing page', async ({ page }) => {
  await expect(page.locator('#playbookBreadcrumbs')).toContainText('Workflows');
  await expect(page.getByRole('link', { name: 'Create New' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Import Workflow' })).toBeEnabled();
  await shot(page, test.info(), 'workflows');
});

test('create workflow: name is required, then opens the editor which refuses to save without a start action', async ({ page }) => {
  const name = stamp('parity-new');
  await page.getByRole('link', { name: 'Create New' }).click();
  const modal = page.locator('ngb-modal-window');
  await expect(modal.locator('.modal-title')).toHaveText('Create Workflow');
  await modal.getByRole('button', { name: 'Continue' }).click();
  await expect(modal.getByText('Please enter a unique workflow name.')).toBeVisible();
  await expect(modal.getByText('By default everyone whose role has valid workflow permissions')).toBeVisible();
  await shot(page, test.info(), 'workflow-create-modal');

  await modal.getByPlaceholder('Workflow Name').fill(name);
  await modal.getByPlaceholder('Description (Optional)').fill('created by parity suite');
  await modal.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/workflows\/new$/);
  await expect(page.locator('#playbookBreadcrumbs.workflow-editor')).toContainText(name);
  await expect(page.locator('#playbookBreadcrumbs.workflow-editor')).toContainText('[New]');
  await page.locator('#save-button').click();
  await expect(toast(page)).toContainText('Workflow cannot be saved without a starting action.');
  await dismissToasts(page);
  await shot(page, test.info(), 'workflow-editor-new');
});

test('import, filter, edit settings, duplicate, open in editor and delete a workflow', async ({ page }) => {
  const name = stamp('parity-wf');
  const dup = `${name}-copy`;

  await page.getByRole('button', { name: 'Import Workflow' }).click();
  const modal = page.locator('ngb-modal-window');
  await expect(modal.locator('.modal-title')).toHaveText('Import Workflow');
  await modal.locator('input[type=file]').setInputFiles(workflowFile(name));
  await modal.getByRole('button', { name: 'Import' }).click();
  await expect(toast(page)).toContainText(`Imported ${name}`);
  await expect(card(page, name)).toBeVisible();

  const filter = page.getByPlaceholder('Filter Workflows...');
  await filter.fill(name);
  // fuzzy (Fuse.js) filter: the exact match ranks first
  await expect(page.locator('.workflow-card').first().locator('.card-title')).toHaveText(name);
  await expect(card(page, name).getByRole('button', { name: 'Execute Workflow' })).toBeEnabled();
  await dismissToasts(page);
  await shot(page, test.info(), 'workflows-filtered');

  // Edit settings
  await card(page, name).locator('.workflow-menu-link').click();
  await card(page, name).getByRole('button', { name: 'Edit Settings...' }).click();
  await expect(modal.locator('.modal-title')).toHaveText('Edit Workflow');
  await modal.getByPlaceholder('Description (Optional)').fill('edited by parity suite');
  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(toast(page)).toContainText(`Updated ${name}`);
  await expect(card(page, name)).toContainText('edited by parity suite');

  // Duplicate
  await card(page, name).locator('.workflow-menu-link').click();
  await card(page, name).getByRole('button', { name: 'Duplicate' }).click();
  await promptBootbox(page, dup);
  await expect(toast(page)).toContainText(`Duplicated ${dup}`);
  await filter.fill(dup);
  await expect(page.locator('.workflow-card').first().locator('.card-title')).toHaveText(dup);

  // Editor
  await card(page, dup).getByRole('button', { name: 'Workflow Editor' }).click();
  await expect(page).toHaveURL(/\/workflows\/[0-9a-f-]{36}$/);
  // The fixture references an app that is not installed, so the editor cannot render its graph
  // on either side; the URL is the user-visible contract here.
  await gotoApp(page, 'workflows');

  // Delete both
  await page.getByPlaceholder('Filter Workflows...').fill(name);
  await deleteWorkflow(page, dup);
  await deleteWorkflow(page, name);
});
