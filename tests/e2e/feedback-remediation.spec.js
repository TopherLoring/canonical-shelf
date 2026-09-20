import {test,expect} from '@playwright/test';

async function answerCurrentChallenge(page){
  const contract=await page.evaluate(async()=>{
    const data=await fetch('/data/catalog.json').then(response=>response.json());
    const form=document.querySelector('.challenge'),id=form?.dataset.activity,index=Number(form?.dataset.index||0);
    const lesson=id?.startsWith('lesson:')?data.lessons.find(item=>item.id===id.slice(7)):null;
    return lesson?.challenges?.[index]||null;
  });
  expect(contract).toBeTruthy();
  await page.evaluate(challenge=>{
    const form=document.querySelector('.challenge'),shape=form.dataset.shape;
    if(['sequence','match','fields'].includes(shape))challenge.answer.forEach((answer,index)=>{const input=form.querySelector(`[name="p${index}"][value="${answer}"]`)||form.querySelector(`[name="p${index}"]`);if(input){input.value=String(answer);input.checked=true}});
    else if(shape==='evidence-select')challenge.answer.forEach(answer=>{const input=form.querySelector(`[name="pick"][value="${answer}"]`);if(input)input.checked=true});
    else if(shape==='scenario')challenge.stages.forEach((stage,index)=>{const input=form.querySelector(`[name="s${index}"][value="${stage.correct}"]`);if(input)input.checked=true});
    else if(shape==='lanes')challenge.answer.forEach((answer,index)=>{const expected=Array.isArray(answer)?answer[1]:answer;const input=form.querySelector(`[name="p${index}"][value="${expected}"]`);if(input)input.checked=true});
    else if(shape==='single-choice'){const input=form.querySelector(`[name="choice"][value="${challenge.answer}"]`);if(input)input.checked=true}
  },contract);
  await page.locator('.challenge').getByRole('button',{name:'Check response'}).click();
}

test('unit journey is open and distinguishes learning states without access gates',async({page})=>{
  await page.goto('/course?unit=c1.christianity');
  await expect(page.getByText(/open navigation/i)).toBeVisible();
  const activities=page.locator('.activity-step');
  await expect(activities).not.toHaveCount(0);
  await expect(activities.locator('h3 a')).toHaveCount(await activities.count());
  await expect(page.getByText(/Available · start anytime|Recommended next/).first()).toBeVisible();
  await expect(page.locator('[disabled] h3 a, [aria-disabled="true"] h3 a')).toHaveCount(0);
});

test('lesson prepares the learner before Scripture and combines explanatory scenes',async({page})=>{
  await page.goto('/course?unit=c1.christianity&lesson=begin');
  const roles=await page.locator('.scene-rail a small').allTextContents();
  expect(roles.indexOf('Prepare')).toBeGreaterThan(-1);
  expect(roles.indexOf('Read')).toBeGreaterThan(roles.indexOf('Prepare'));
  await page.locator('.scene-rail a').filter({hasText:'Prepare'}).click();
  await expect(page.getByRole('heading',{name:/Before you read/i})).toBeVisible();
  await page.locator('.scene-rail a').filter({hasText:'Read'}).click();
  await expect(page.getByRole('heading',{name:/Read the passage/i})).toBeVisible();
  await expect(page.locator('.study-scripture')).toBeVisible();
});

test('correct selections receive the sole positive indicator',async({page})=>{
  await page.goto('/course?unit=c1.christianity&lesson=begin');
  await page.locator('.scene-rail a').filter({hasText:'Practice'}).first().click();
  await answerCurrentChallenge(page);
  await expect(page.locator('.response-is-correct').first()).toBeVisible();
  await expect(page.getByText('Correct',{exact:true}).first()).toBeVisible();
  await expect(page.locator('.response-is-incorrect,.is-wrong,[data-response-status="wrong"]')).toHaveCount(0);
});

test('Study Focus reserves Feedback and Journal controls and fits a phone viewport',async({page})=>{
  await page.setViewportSize({width:375,height:667});
  await page.goto('/course?unit=c1.christianity&lesson=begin');
  await expect(page.locator('body > #feedback-open')).toBeHidden();
  await expect(page.locator('body > #personal-study-open')).toBeHidden();
  await expect(page.locator('.study-focus__chrome').getByRole('button',{name:'Feedback',exact:true})).toBeVisible();
  await expect(page.locator('.study-focus__chrome').getByRole('button',{name:'Journal',exact:true})).toBeVisible();
  const bounds=await page.locator('.study-folio').boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x+bounds.width).toBeLessThanOrEqual(375);
  expect(bounds.y+bounds.height).toBeLessThanOrEqual(667);
});
