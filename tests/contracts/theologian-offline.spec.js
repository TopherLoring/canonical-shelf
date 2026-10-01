import {test,expect} from '@playwright/test';

// When the Theologian service is unreachable, the offline answer must say so and must not present a verse that
// only shares a word with the question (the Genesis 49:25 answer to "what can you help me understand").
test('offline Theologian answers page-help questions about the page and says the service is unreachable',async({page})=>{
  await page.route('**/api/theologian',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'unavailable',fallback:true})}));
  await page.goto('/home');
  await page.locator('#guide-open').click();
  await page.locator('#guide-q').fill('What can you help me understand on this page?');
  await page.locator('#guide-q').press('Enter');
  const reply=page.locator('#guide .chat-message--assistant:not(.chat-message--thinking)').last();
  await expect(reply).toContainText("isn't reachable right now",{timeout:15000});
  await expect(reply).toContainText('This is the Shelf');
  await expect(reply).not.toContainText('Genesis 49');
});
