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

// Re-rendering the chat (rating a reply, background refreshes) must not wipe what the learner is typing.
test('a half-typed Theologian message survives a re-render of the chat',async({page})=>{
  await page.route('**/api/theologian',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mode:'cloud',model:'test',answer:'A short answer.',evidence:[],guardrails:[],validation:{status:'passed'}})}));
  await page.goto('/home');
  await page.locator('#guide-open').click();
  await page.locator('#guide-q').fill('First question?');
  await page.locator('#guide-q').press('Enter');
  await expect(page.locator('#guide .chat-message--assistant:not(.chat-message--thinking)')).toHaveCount(1,{timeout:15000});
  await expect(page.locator('#guide-q')).toHaveValue('');
  await page.locator('#guide-q').fill('A follow-up I am still writing');
  await page.locator('#guide .chat-message--assistant').last().locator('[data-theologian-rate="up"]').click();
  await expect(page.locator('#guide-q')).toHaveValue('A follow-up I am still writing');
});


test('offline acknowledgments stay brief and do not repeat the outage announcement',async({page})=>{
  await page.route('**/api/theologian',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({fallback:true})}));
  await page.goto('/home');
  await page.locator('#guide-open').click();
  await page.locator('#guide-q').fill('What can you help me understand on this page?');
  await page.locator('#guide-q').press('Enter');
  const replies=page.locator('#guide .chat-message--assistant:not(.chat-message--thinking)');
  await expect(replies).toHaveCount(1);
  await page.locator('#guide-q').fill('Thanks!');
  await page.locator('#guide-q').press('Enter');
  await expect(replies).toHaveCount(2);
  const answer=replies.last().locator('.chat-message__bubble');
  await expect(answer).not.toContainText('reachable');
  expect((await answer.innerText()).length).toBeLessThan(100);
});
