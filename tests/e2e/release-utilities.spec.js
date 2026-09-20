import {test,expect} from '@playwright/test';

test('Feedback is reachable from normal pages and Study Focus',async({page})=>{
  await page.goto('/home');
  const feedback=page.getByRole('button',{name:'Feedback',exact:true});
  await expect(feedback).toBeVisible();
  await feedback.click();
  await expect(page.getByRole('heading',{name:'Send feedback'})).toBeVisible();
  await page.getByRole('button',{name:'Close feedback'}).click();

  await page.goto('/course?unit=unit.start&lesson=begin');
  await expect(page.locator('.study-focus')).toBeVisible();
  await expect(feedback).toBeVisible();
  await feedback.click();
  await expect(page.getByRole('heading',{name:'Send feedback'})).toBeVisible();
});

test('Lesson notes and journal persist without changing scored progress',async({page})=>{
  await page.goto('/course?unit=unit.start&lesson=begin');
  const before=await page.evaluate(async()=>{const db=await import('/db.js');return db.getState()});
  const open=page.getByRole('button',{name:'Notes & journal',exact:true});
  await expect(open).toBeVisible();
  await open.click();
  await expect(page.getByRole('heading',{name:'Notes & journal'})).toBeVisible();
  await page.locator('#personal-note').fill('Observe the sequence in 1 Corinthians 15 and revisit the context note.');
  await page.waitForTimeout(900);
  await page.getByRole('tab',{name:'Journal'}).click();
  await page.locator('#personal-journal').fill('I want to distinguish the text from later doctrinal explanations.');
  await page.waitForTimeout(900);
  await page.getByRole('button',{name:'Close notes and journal'}).click();
  await open.click();
  await expect(page.locator('#personal-note')).toHaveValue(/Observe the sequence/);
  await page.getByRole('tab',{name:'Journal'}).click();
  await expect(page.locator('#personal-journal')).toHaveValue(/distinguish the text/);
  const after=await page.evaluate(async()=>{const db=await import('/db.js');return db.getState()});
  expect(after.completed).toEqual(before.completed);
  expect(after.attempts).toEqual(before.attempts);
  expect(after.mastery).toEqual(before.mastery);
});
