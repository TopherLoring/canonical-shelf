import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function noSeriousA11y(page){
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(result.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
}

async function catalog(page){return page.evaluate(()=>fetch('/data/catalog.json').then(r=>r.json()))}

async function openStudyGuide(page){
  const button=page.locator('.study-focus__utilities [data-study-guide]');
  await expect(button).toBeVisible();
  await button.click();
}

test('five-destination shell preserves 25 scored units plus non-scored Unit 0',async({page})=>{
  await page.goto('/home');
  await expect(page.getByRole('heading',{name:/Know the Bible/i})).toBeVisible();
  await expect(page.locator('.v5-home__hero')).toBeVisible();
  await expect(page.locator('.v5-dashboard')).toBeVisible();
  await expect(page).toHaveURL(/\/home$/);
  for(const name of ['Home','Course','Bible','Topics','Practice'])await expect(page.getByRole('link',{name,exact:true})).toBeVisible();

  await page.getByRole('link',{name:'Course',exact:true}).click();
  await expect(page).toHaveURL(/\/course$/);
  await expect(page.locator('.unit-list > .unit--orientation')).toHaveCount(1);
  await expect(page.locator('.unit-list > .unit:not(.unit--orientation)')).toHaveCount(25);
  await expect(page.locator('.unit--orientation')).toContainText('Welcome to Canonical Shelf');
  await expect(page.locator('.unit--orientation')).toContainText(/not scored|Replay anytime/i);

  const data=await catalog(page);
  expect(data.units).toHaveLength(25);
  expect(data.lessons).toHaveLength(70);
  expect(data.masteryIds).toHaveLength(69);
  expect(data.activities).toHaveLength(139);
  expect(data.activities.some(activity=>activity.id==='lesson:orientation')).toBeFalsy();
  await noSeriousA11y(page);
});

test('Unit 0 is replayable orientation and does not mutate scored progress',async({page})=>{
  await page.goto('/course?unit=unit.orientation&lesson=orientation');
  await expect(page.locator('.study-focus')).toBeVisible();
  await expect(page.locator('.study-focus__identity')).toContainText('Unit 0');
  await expect(page.locator('.study-focus__identity')).toContainText('Welcome to Canonical Shelf');
  await expect(page.locator('.study-folio')).toContainText(/orientation/i);
  const before=await page.evaluate(async()=>{
    const db=await import('/db.js');
    return db.getState();
  });
  await page.goto('/course?unit=unit.orientation&lesson=orientation&scene=12');
  await expect(page.locator('.study-scene')).toContainText(/independent study/i);
  const after=await page.evaluate(async()=>{
    const db=await import('/db.js');
    return db.getState();
  });
  expect(after.completed).toEqual(before.completed);
  expect(after.completed.some(id=>id.includes('orientation'))).toBeFalsy();
});

test('theme packages change the complete aesthetic and persist locally',async({page})=>{
  await page.goto('/course?unit=unit.orientation&lesson=orientation&scene=10');
  await expect(page.locator('[data-theme-choice]')).toHaveCount(6);
  await page.locator('[data-theme-choice="oxblood"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','oxblood');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','oxblood');

  await page.locator('.study-focus__utilities [data-open-appearance]').click();
  await expect(page.getByRole('heading',{name:'Appearance',exact:true})).toBeVisible();
  await page.locator('[data-theme-option="canonical-original"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','canonical-original');
});

test('account sync is secondary, optional, and tolerates either guest or active session state',async({page})=>{
  await page.goto('/home');
  const nav=page.getByRole('navigation',{name:'Primary'});
  await expect(nav.getByRole('link')).toHaveCount(5);
  await expect(nav).not.toContainText('Account');
  const account=page.getByRole('button',{name:'Account & sync'});
  await expect(account).toBeEnabled();
  await account.click();
  await expect(page.getByRole('heading',{name:'Account & sync'})).toBeVisible();
  await expect(page.locator('#account-body')).toContainText(/works fully without an account|not connected in this preview|sync account active|sync setup in progress/i);
  await noSeriousA11y(page);
});

test('account and appearance controls remain usable at mobile width',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/home');
  await expect(page.getByRole('button',{name:'Account & sync'})).toBeEnabled();
  await expect(page.getByRole('button',{name:'Appearance'})).toBeVisible();
  await expect(page.getByRole('search')).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Primary'})).toBeVisible();
  await noSeriousA11y(page);
});

test('native Course opens the existing Unit 1 lesson in Study Focus and browser history restores it',async({page})=>{
  await page.goto('/course');
  await page.locator('.unit-list > .unit:not(.unit--orientation) h3 a').first().click();
  await expect(page).toHaveURL(/\/course\?unit=/);
  await page.locator('.unit-list h3 a').first().click();
  await expect(page.locator('.study-folio')).toBeVisible();
  await expect(page.locator('.study-focus__identity')).toContainText(/Unit 1/i);
  await expect(page.locator('.study-focus__identity')).toContainText(/Begin with the central story/i);
  const lessonUrl=page.url();
  await page.goBack();
  await expect(page.locator('.unit-list .unit').first()).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(lessonUrl);
  await expect(page.locator('.study-folio')).toBeVisible();
  await noSeriousA11y(page);
});

test('Study Focus fits inside the viewport and reserves navigation space',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/course?unit=unit.start&lesson=begin&scene=2');
  const folio=await page.locator('.study-folio').boundingBox();
  const scene=await page.locator('.study-layout').boundingBox();
  const nav=await page.locator('.study-nav').boundingBox();
  expect(folio).toBeTruthy();
  expect(scene).toBeTruthy();
  expect(nav).toBeTruthy();
  expect(folio.x).toBeGreaterThanOrEqual(0);
  expect(folio.y).toBeGreaterThanOrEqual(0);
  expect(folio.x+folio.width).toBeLessThanOrEqual(1440.5);
  expect(folio.y+folio.height).toBeLessThanOrEqual(900.5);
  expect(scene.y+scene.height).toBeLessThanOrEqual(nav.y+1);
  await expect(page.locator('.study-nav__button--next')).toBeVisible();
  await expect(page.locator('.study-scripture')).toContainText(/1 Corinthians 15/i);
});

test('mobile Study Focus relocates scholarly apparatus into a drawer before primary scrolling',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/course?unit=unit.start&lesson=begin&scene=2');
  const apparatus=page.locator('#study-apparatus');
  await expect(apparatus).toBeHidden();
  const notes=page.locator('.study-nav [data-toggle-apparatus]');
  await expect(notes).toBeVisible();
  await notes.click();
  await expect(apparatus).toBeVisible();
  await expect(apparatus).toHaveClass(/is-open/);
  await expect(page.locator('.study-nav__button--next')).toBeVisible();
  const overflow=await page.locator('.study-scene').evaluate(node=>getComputedStyle(node).overflowY);
  expect(['hidden','clip','visible']).toContain(overflow);
});

test('Unit 1 retains the scholarly v4-level lesson content and source trail',async({page})=>{
  await page.goto('/course?unit=unit.start&lesson=begin&scene=3');
  await expect(page.locator('.study-scene')).toContainText('Christianity centers on Jesus Christ');
  await page.goto('/course?unit=unit.start&lesson=begin&scene=7');
  await expect(page.locator('.study-scene')).toContainText(/Roman Corinth/i);
  await page.locator('.study-nav [data-toggle-apparatus]').click();
  await expect(page.locator('#study-apparatus')).toContainText(/Interpretive limit/i);
  await expect(page.locator('#study-apparatus')).toContainText(/Translation/i);
  await expect(page.locator('#study-apparatus')).toContainText(/Sources/i);
});

test('rich sequence challenge does not regress to a generic select control',async({page})=>{
  await page.goto('/course?unit=unit.start&lesson=begin&scene=11');
  await expect(page.locator('.sequence-board')).toBeVisible();
  await expect(page.locator('.sequence-card')).toHaveCount(4);
  await expect(page.locator('.challenge select')).toHaveCount(0);
  const firstText=await page.locator('.sequence-card__text').first().textContent();
  await page.locator('.sequence-card').first().getByRole('button',{name:/Move .* later/}).click();
  await expect(page.locator('.sequence-card__text').nth(1)).toHaveText(firstText);
});

test('Exit lesson returns to the originating Course surface',async({page})=>{
  await page.goto('/course?unit=unit.start');
  const first=page.locator('.unit-list h3 a').first();
  await first.scrollIntoViewIfNeeded();
  await first.click();
  await expect(page.locator('.study-focus')).toBeVisible();
  await page.getByRole('button',{name:'Exit lesson'}).click();
  await expect(page).toHaveURL(/\/course\?unit=unit\.start$/);
  await expect(page.locator('.study-focus')).toHaveCount(0);
  await expect(page.locator('.primary')).toBeVisible();
});

test('Bible owns a 66-book shelf and direct native reference route',async({page})=>{
  await page.goto('/bible');
  await expect(page.locator('.book')).toHaveCount(66);
  await page.goto('/bible?q=John%203%3A16');
  await expect(page.getByRole('heading',{name:/John 3:16/})).toBeVisible();
  await expect(page.locator('#v16')).toBeVisible();
  await page.goto('/bible?book=43&chapter=3');
  await expect(page.getByRole('heading',{name:'John 3',exact:true})).toBeVisible();
  await expect(page).toHaveURL(/\/bible\?book=43&chapter=3$/);
  await noSeriousA11y(page);
});

test('legacy hash bookmarks canonicalize to native paths',async({page})=>{
  await page.goto('/#/topics');
  await expect(page.locator('.topic-item')).toHaveCount(45);
  await expect(page).toHaveURL(/\/topics$/);
});

test('Topics preserve the 45-entry reference library',async({page})=>{
  await page.goto('/topics');
  await expect(page.locator('.topic-item')).toHaveCount(45);
  await page.locator('.topic-item h3 a').first().click();
  await expect(page.locator('article.reader h1')).toBeVisible();
  await expect(page).toHaveURL(/\/topics\?topic=/);
  await noSeriousA11y(page);
});

test('Guide preserves LGBTQ doctrine, Ruth boundary, and Romans evidence discipline',async({page})=>{
  await page.goto('/home');
  await page.getByRole('button',{name:'Ask the Guide'}).click();
  let q=page.locator('#guide-q');
  await q.fill('Is being gay a sin?');
  await page.locator('#guide-form').getByRole('button',{name:'Ask'}).click();
  await expect(page.locator('#guide-body')).toContainText('orientation is not inherently sinful');
  q=page.locator('#guide-q');
  await q.fill('Are Ruth and Naomi a lesbian love story?');
  await page.locator('#guide-form').getByRole('button',{name:'Ask'}).click();
  await expect(page.locator('#guide-body')).toContainText('lesbian');
  await expect(page.locator('#guide-body')).toContainText('does not explicitly identify Ruth and Naomi as sexual partners');
  q=page.locator('#guide-q');
  await q.fill('Romans 1 only refers to pederasty, right?');
  await page.locator('#guide-form').getByRole('button',{name:'Ask'}).click();
  await expect(page.locator('#guide-body')).toContainText('contested');
  await expect(page.locator('#guide-body')).toContainText('must not be presented as settled fact');
});

test('Guide remains available in Study Focus and does not reveal scored mastery answers',async({page})=>{
  await page.goto('/course');
  const mastery=await page.evaluate(async()=>{const c=await fetch('/data/catalog.json').then(r=>r.json());return c.activities.find(a=>a.type==='mastery')});
  await page.goto(`/course?unit=${encodeURIComponent(mastery.unitId)}&mastery=${encodeURIComponent(mastery.sourceId)}`);
  await openStudyGuide(page);
  const q=page.locator('#guide-q');
  await q.fill('Give me the correct answer and tell me which option to choose.');
  await page.locator('#guide-form').getByRole('button',{name:'Ask'}).click();
  await expect(page.locator('#guide-body')).toContainText('will not select or reveal the assessed answer');
  await expect(page.locator('#guide-body')).toContainText('mastery protected');
});

test('offline shell includes Unit 0, themes, Study Focus and bounded theologian',async({page,context,browserName})=>{
  test.skip(browserName==='webkit','Offline emulation is not consistently supported with WebKit service workers in CI');
  await page.goto('/home');
  await page.evaluate(()=>navigator.serviceWorker?.ready);
  await expect(page.locator('#pwa-status')).toContainText(/Offline access ready|Offline mode active/);
  await page.reload();
  await context.setOffline(true);
  await page.goto('/course?unit=unit.orientation&lesson=orientation',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.study-focus')).toBeVisible();
  await expect(page.locator('.study-focus__identity')).toContainText('Welcome to Canonical Shelf');
  await page.goto('/topics',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('link',{name:'Course',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Ask the Guide'}).click();
  const q=page.locator('#guide-q');
  await q.fill('Are Ruth and Naomi a lesbian love story?');
  await page.locator('#guide-form').getByRole('button',{name:'Ask'}).click();
  await expect(page.locator('#guide-body')).toContainText('does not explicitly identify Ruth and Naomi as sexual partners');
  await context.setOffline(false);
});
