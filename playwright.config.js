import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  timeout:30000,
  expect:{timeout:7000},
  fullyParallel:false,
  // One retry on CI absorbs runner hiccups (dropped local connections); a test that fails twice still fails the build.
  retries:process.env.CI?1:0,
  reporter:'line',
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure'},
  webServer:{command:'bun run serve',url:'http://127.0.0.1:4173',reuseExistingServer:true,timeout:30000},
  projects:[
    {name:'chromium',use:{...devices['Desktop Chrome']}}
  ]
});
