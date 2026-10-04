import { expect } from '@playwright/test';

/**
 * Waits until the Single-document SPA has finished initializing and
 * has rendered route content into `<main id="main">`.
 * - #guide-open is initially disabled and enabled only after bootstrap.js finishes
 *   loading app.js and dispatching 'canonical-app-ready'.
 * - main > * ensures the route's view template has been mounted into the DOM.
 */
export async function waitForAppReady(page) {
  await expect(page.locator('#guide-open')).toBeEnabled({ timeout: 15000 });
  await expect(page.locator('main > *').first()).toBeVisible({ timeout: 15000 });
}
