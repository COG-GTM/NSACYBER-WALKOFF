import { defineConfig, devices } from '@playwright/test';

// Both projects run the same specs. The WALKOFF API serves the compiled client, so each app is
// reached through its own API instance (baseline checkout on :4000, upgraded checkout on :4200),
// both talking to the same MongoDB/Redis. Specs use timestamped data and clean up after themselves,
// and run serially so the two projects never race on shared lists.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['json', { outputFile: 'results.json' }]],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1400, height: 900 },
    trace: 'off', // traces would capture the admin password and tokens
  },
  projects: [
    { name: 'baseline', use: { baseURL: process.env.BASELINE_URL || 'http://localhost:4000/walkoff/' } },
    { name: 'upgraded', use: { baseURL: process.env.UPGRADED_URL || 'http://localhost:4200/walkoff/' } },
  ],
});
