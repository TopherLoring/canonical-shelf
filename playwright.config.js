import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  timeout:30000,
  expect:{timeout:7000},
  // Every test gets its own browser context (fresh storage), so tests run in parallel. Each page loads a 3 MB app and a 4 MB
  // corpus, so many browsers at once starve each other and time out (the same suite passed at 2 workers and failed at 6).
  // Two is the steady default everywhere; PW_WORKERS=6 goes faster on a machine that is otherwise idle.
  fullyParallel:true,
  workers:Number(process.env.PW_WORKERS)||2,
  // One retry on CI absorbs runner hiccups (dropped local connections); a test that fails twice still fails the build.
  // Locally there is no retry, so a failure is a real failure. Run with CI=1 to see which tests only pass on a retry
  // (the summary lists them as "flaky").
  retries:process.env.CI?1:0,
  reporter:'line',
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure'},
  webServer:{command:'bun run serve',url:'http://127.0.0.1:4173',reuseExistingServer:true,timeout:30000},
  projects:[
    {name:'chromium',use:{...devices['Desktop Chrome']}}
  ]
});
