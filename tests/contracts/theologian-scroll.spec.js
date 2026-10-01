import {test,expect} from '@playwright/test';

// A new Theologian reply must open at its first line, not at the bottom of the chat,
// and rating/flagging must not move the reader.
const longAnswer=Array.from({length:14},(_,i)=>`Paragraph ${i+1}. ${'The passage is read in its setting before it is applied. '.repeat(4)}`).join('\n\n');

test('Theologian reply opens at its first line and stays put when rated',async({page})=>{
  await page.route('**/api/theologian',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mode:'cloud',model:'test',answer:longAnswer,evidence:[],guardrails:[],validation:{status:'passed'}})}));
  await page.setViewportSize({width:390,height:760});
  await page.goto('/home');
  await page.locator('#guide-open').click();
  const stream=page.locator('#guide [data-theologian-messages]');
  for(const question of ['First question about Genesis?','Second question about Exodus?']){
    await page.locator('#guide-q').fill(question);
    await page.locator('#guide-q').press('Enter');
    await expect(page.locator('#guide .chat-message--assistant:not(.chat-message--thinking)')).toHaveCount(question.startsWith('First')?1:2,{timeout:15000});
  }
  const offset=async()=>page.evaluate(()=>{
    const stream=document.querySelector('#guide [data-theologian-messages]');
    const replies=stream.querySelectorAll('.chat-message--assistant:not(.chat-message--thinking)');
    return Math.round(replies[replies.length-1].getBoundingClientRect().top-stream.getBoundingClientRect().top);
  });
  await page.waitForLoadState('networkidle');
  await expect.poll(offset).toBeLessThanOrEqual(2);
  await expect.poll(offset).toBeGreaterThanOrEqual(-2);
  const atBottom=await stream.evaluate(el=>el.scrollTop+el.clientHeight>=el.scrollHeight-2);
  expect(atBottom,'reply should not be scrolled to the bottom').toBeFalsy();
  const rate=page.locator('#guide .chat-message--assistant').last().locator('[data-theologian-rate="up"]');
  await expect(async()=>{await rate.scrollIntoViewIfNeeded({timeout:1000})}).toPass({timeout:5000});
  const before=await stream.evaluate(el=>el.scrollTop);
  await rate.click();
  await expect(rate).toHaveAttribute('aria-pressed','true');
  expect(Math.abs(await stream.evaluate(el=>el.scrollTop)-before)).toBeLessThanOrEqual(2);
});
