import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

// https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  testDir: './src',
  timeout: 5000 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: 'html',
  use: {
    actionTimeout: 0, // Maximum time each action such as `click()` can take. Defaults to 0 (no limit).
    trace: 'on-first-retry', // https://playwright.dev/docs/trace-viewer
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        // headless: false,
        ...devices['Desktop Chrome'],
      },
    },
  ],

  outputDir: 'results/',
}

export default config
