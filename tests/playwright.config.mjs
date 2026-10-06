// Browser test configuration. Serves the built dist/ folder the way Cloudflare
// Pages does and runs every spec across real browser engines and screen sizes.
// Run from tests/:  npx playwright test            (all browsers)
//                   npx playwright test --project=mobile-webkit   (one)
import { defineConfig, devices } from '@playwright/test';

const PORT = 4329;
const chromiumPath = process.env.CHROMIUM_PATH; // only for machines with a preinstalled Chromium

export default defineConfig({
  testDir: './browser',
  outputDir: './test-results',
  timeout: 60_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // a flaky test is a bug to fix, not to retry
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
  },
  webServer: process.env.BASE_URL ? undefined : {
    command: `node serve.mjs ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
    timeout: 20_000,
  },
  projects: [
    // Desktop
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    // Phones and tablet (older adults skew iPhone and iPad)
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
    { name: 'small-phone-webkit', use: { ...devices['iPhone SE'] } },
    { name: 'tablet-webkit', use: { ...devices['iPad (gen 7)'] } },
  ],
});
