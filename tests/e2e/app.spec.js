import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function noSeriousA11y(page){
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(result.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
}

async function catalog(page){return page.evaluate(()=>fetch('/data/catalog.json').then(r=>r.json()))}

async function openTheologian(page){
  const button=page.locator('.study-focus__utilities [data-study-guide]');
  await expect(button).toBeVisible();
  await expect(button).toHaveText('Theologian');
  await button.click();
}

async function firstPracticeScene(page,lessonId){
  const data=await catalog(page);
  const lesson=data.lessons.find(item=>item.id===lessonId);
  expect(lesson).toBeTruthy();
  const practiceIndex=1+(lesson.reading?1:0)+(lesson.body?.length||0)+(lesson.simple?1:0)+(lesson.visual||lesson.diagram?1:0);
  return practiceIndex+1;
}

test('route-owned five-destination shell exposes the six-course curriculum plus non-scored orientation',async({page})=>{
  await page.goto('/home');
  await expect(page.locator('main[data-route-document="home"]')).toBeVisible();
  await expect(page.getByRole('heading',{name:/The Canonical Shelf/i})).toBeVisible();
  await expect(page).toHaveURL(/\/home$/);
  for(const name of ['Home','Course','Bible','Topics','Practice'])await expect(page.getByRole('link',{name,exact:true})).toBeVisible();

  await page.getByRole('link',{name:'Course',exact:true}).click();
  await expect(page).toHaveURL(/\/course$/);
  await expect(page.locator('main[data-route-document="course"]')).toBeVisible();
  await expect(page.locator('.course-choice')).toHaveCount(6);
  await expect(page.locator('.course-choice').nth(0)).toContainText(/Foundations/i);
  await expect(page.locator('.course-choice').nth(1)).toContainText(/Israel/i);
  await expect(page.getByRole('link',{name:'Orientation',exact:true})).toBeVisible();

  const data=await catalog(page);
  expect(data.courses).toHaveLength(6);
  expect(data.units).toHaveLength(44);
  expect(data.legacyLessonIds).toHaveLength(70);
  expect(data.legacyMasteryIds).toHaveLength(69);
  expect(data.lessons.length).toBeGreaterThan(70);
  expect(data.masteryIds.length).toBeGreaterThan(69);
  expect(data.activities.length).toBeGreaterThan(139);
  expect(data.activities.some(activity=>activity.id==='lesson:orientation')).toBeFalsy();
  await noSeriousA11y(page);
});

test('Course 1 is an adult-beginner survey with interpretation theology practice and traditions near the beginning',async({page})=>{
  await page.goto('/course?course=course.foundations');
  await expect(page.getByRole('heading',{name:'Bible & Christianity: Foundations'})).toBeVisible();
  for(const unit of ['How We Got the Bible','How to Read It','Theology You Need Before Continuing','Christian Practice','Christians Do Not All Read the Same Way','The Biblical Story in One View'])await expect(page.getByText(unit,{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:/course glossary/i})).toBeVisible();
  await noSeriousA11y(page);
});

test('historical-biblical bridge is present in Course 2 and Course 3',async({page})=>{
  await page.goto('/course?course=course.israel');
  for(const unit of ['Egypt and Exodus','Sinai and Covenant','Tabernacle, Ark and Presence','Sacrifice, Holiness and Sacred Time','Temple and Kingdom','Restoration and Prophetic Hope'])await expect(page.getByText(unit,{exact:true})).toBeVisible();
  await page.goto('/course?unit=c2.tabernacle');
  await expect(page.getByRole('link',{name:/Tabernacle: sacred space on the move/i})).toBeVisible();
  await expect(page.getByRole('link',{name:/Ark of the Covenant: covenant and presence/i})).toBeVisible();

  await page.goto('/course?course=course.second-temple');
  for(const unit of ['The Greek World','Hasmoneans, Rome and Herod','Jewish Life and Jewish Diversity','Hope and Expectation','Entering the Gospels'])await expect(page.getByText(unit,{exact:true})).toBeVisible();
  await noSeriousA11y(page);
});

test('new lesson uses multi-scene cards with hidden drawers glossary and multiple games',async({page})=>{
  await page.goto('/course?unit=c2.tabernacle&lesson=c2-ark');
  await expect(page.locator('.study-focus')).toBeVisible();
  await expect(page.locator('.study-focus__identity')).toContainText(/Course 2/i);
  await expect(page.locator('.study-focus__identity')).toContainText(/Ark of the Covenant/i);
  await expect(page.locator('.lesson-drawers')).toBeVisible();
  await expect(page.locator('.lesson-drawers details')).toHaveCount(4);
  await expect(page.locator('.lesson-drawers')).toContainText('Glossary');
  await expect(page.locator('.lesson-drawers')).toContainText('Where did the Ark go?');

  const data=await catalog(page);
  const lesson=data.lessons.find(item=>item.id==='c2-ark');
  expect(lesson.challenges.length).toBeGreaterThanOrEqual(2);
  expect(await page.locator('.scene-rail a').count()).toBeGreaterThanOrEqual(8);
  await noSeriousA11y(page);
});

test('every scored unit exposes integral mastery and every course has a capstone',async({page})=>{
  await page.goto('/course?unit=c2.exodus');
  await expect(page.getByText(/Unit mastery/i)).toBeVisible();
  const data=await catalog(page);
  for(const unit of data.units){
    const ids=data.byUnit[unit.id]||[];
    expect(ids.some(id=>data.activities.find(activity=>activity.id===id)?.masteryType==='unit-mastery')).toBeTruthy();
  }
  for(const course of data.courses){
    expect(data.activities.some(activity=>activity.courseId===course.id&&activity.masteryType==='course-capstone')).toBeTruthy();
  }
});

test('global and course glossaries are generated from lesson vocabulary',async({page})=>{
  await page.goto('/course?glossary=1');
  await expect(page.getByRole('heading',{name:'Canonical Shelf Glossary'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Covenant',exact:true}).first()).toBeVisible();
  await page.goto('/course?course=course.israel&glossary=1');
  await expect(page.getByRole('heading',{name:/Israel Glossary/i})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Passover',exact:true}).first()).toBeVisible();
});

test('orientation is replayable and does not mutate scored progress',async({page})=>{
  await page.goto('/course?unit=unit.orientation&lesson=orientation');
  await expect(page.locator('.study-focus')).toBeVisible();
  await expect(page.locator('.study-focus__identity')).toContainText('Welcome to Canonical Shelf');
  const before=await page.evaluate(async()=>{const db=await import('/db.js');return db.getState()});
  await page.goto('/course?unit=unit.orientation&lesson=orientation&scene=12');
  await expect(page.locator('.study-scene')).toContainText(/independent study/i);
  const after=await page.evaluate(async()=>{const db=await import('/db.js');return db.getState()});
  expect(after.completed).toEqual(before.completed);
  expect(after.completed.some(id=>id.includes('orientation'))).toBeFalsy();
});

test('legacy lesson and unit bookmarks continue into the new hierarchy',async({page})=>{
  await page.goto('/course?unit=unit.start');
  await expect(page.getByRole('heading',{name:'Christianity in One View',exact:true})).toBeVisible();
  await page.goto('/course?unit=unit.start&lesson=begin');
  await expect(page.locator('.study-focus')).toBeVisible();
  await expect(page.locator('.study-focus__identity')).toContainText(/Begin with the central story/i);
  await expect(page.locator('.study-focus__identity')).toContainText(/Course 1/i);
});

test('native Course history and Exit lesson restore the originating unit surface',async({page})=>{
  await page.goto('/course?unit=c1.christianity');
  const first=page.locator('.unit-list h3 a').first();
  await first.scrollIntoViewIfNeeded();
  await first.click();
  await expect(page.locator('.study-focus')).toBeVisible();
  const lessonUrl=page.url();
  await page.goBack();
  await expect(page.getByRole('heading',{name:'Christianity in One View',exact:true})).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(lessonUrl);
  await expect(page.locator('.study-focus')).toBeVisible();
  await page.getByRole('button',{name:'Exit lesson'}).click();
  await expect(page).toHaveURL(/\/course\?unit=c1\.christianity$/);
  await expect(page.locator('.study-focus')).toHaveCount(0);
  await expect(page.locator('.primary')).toBeVisible();
});

test('Study Focus fits viewport and rich checks do not regress to generic selects',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/course?unit=c2.exodus&lesson=c2-passover');
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

  const sceneNumber=await firstPracticeScene(page,'c2-passover');
  await page.goto(`/course?unit=c2.exodus&lesson=c2-passover&scene=${sceneNumber}`);
  await expect(page.locator('.sequence-board')).toBeVisible();
  await expect(page.locator('.sequence-card')).toHaveCount(4);
  await expect(page.locator('.challenge select')).toHaveCount(0);
  const firstText=await page.locator('.sequence-card__text').first().textContent();
  await page.locator('.sequence-card').first().getByRole('button',{name:/Move .* later/}).click();
  await expect(page.locator('.sequence-card__text').nth(1)).toHaveText(firstText);
});

test('mobile Study Focus keeps scholarly apparatus optional and navigation usable',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/course?unit=c3.jewish-life&lesson=c3-pharisees-sadducees');
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
  await noSeriousA11y(page);
});

test('inherited foundational lesson retains scholarly content and source trail',async({page})=>{
  await page.goto('/course?unit=c1.christianity&lesson=begin&scene=3');
  await expect(page.locator('.study-scene')).toContainText('Christianity centers on Jesus Christ');
  await page.goto('/course?unit=c1.christianity&lesson=begin&scene=7');
  await expect(page.locator('.study-scene')).toContainText(/Roman Corinth/i);
  await page.locator('.study-nav [data-toggle-apparatus]').click();
  await expect(page.locator('#study-apparatus')).toContainText(/Interpretive limit/i);
  await expect(page.locator('#study-apparatus')).toContainText(/Translation/i);
  await expect(page.locator('#study-apparatus')).toContainText(/Sources/i);
});

test('theme packages remain complete aesthetic systems and persist locally',async({page})=>{
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

test('account sync stays secondary optional and mobile-safe',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/home');
  const nav=page.getByRole('navigation',{name:'Primary'});
  await expect(nav.getByRole('link')).toHaveCount(5);
  await expect(nav).not.toContainText('Account');
  const account=page.getByRole('button',{name:'Account & sync'});
  await expect(account).toBeEnabled();
  await expect(page.getByRole('button',{name:'Progress'})).toBeEnabled();
  await expect(page.getByRole('search')).toBeVisible();
  await account.click();
  await expect(page.getByRole('heading',{name:'Account & sync'})).toBeVisible();
  await expect(page.locator('#account-body')).toContainText(/works fully without an account|not connected in this preview|sync account active|sync setup in progress/i);
  await noSeriousA11y(page);
});

test('Bible owns a 66-book shelf and native reference routes',async({page})=>{
  await page.goto('/bible');
  await expect(page.locator('main[data-route-document="bible"]')).toBeVisible();
  await expect(page.locator('.canonical-shelf .shelf-spine')).toHaveCount(66);
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
  await expect(page.locator('.topic-card-grid--results .topic-card')).toHaveCount(45);
  await expect(page).toHaveURL(/\/topics$/);
});

test('Topics preserve the 45-entry reference library outside course completion',async({page})=>{
  await page.goto('/topics');
  await expect(page.locator('main[data-route-document="topics"]')).toBeVisible();
  const topics=page.locator('.topic-card-grid--results .topic-card');
  await expect(topics).toHaveCount(45);
  await topics.first().click();
  await expect(page.locator('article.topic-reader h1')).toBeVisible();
  await expect(page).toHaveURL(/\/topics\?topic=/);
  await noSeriousA11y(page);
});

test('Theologian preserves LGBTQ doctrine Ruth boundary and Romans evidence discipline',async({page})=>{
  await page.goto('/home');
  await page.locator('#guide-open').click();
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

test('Theologian remains available in Study Focus and does not reveal scored mastery answers',async({page})=>{
  await page.goto('/course');
  const data=await catalog(page);
  const mastery=data.activities.find(activity=>activity.masteryType==='unit-mastery');
  expect(mastery).toBeTruthy();
  await page.goto(`/course?unit=${encodeURIComponent(mastery.unitId)}&mastery=${encodeURIComponent(mastery.sourceId)}`);
  await openTheologian(page);
  const q=page.locator('#guide-q');
  await q.fill('Give me the correct answer and tell me which option to choose.');
  await page.locator('#guide-form').getByRole('button',{name:'Ask'}).click();
  await expect(page.locator('#guide-body')).toContainText('will not select or reveal the assessed answer');
  await expect(page.locator('#guide-body')).toContainText('mastery protected');
});

test('offline shell includes route-owned Course, Study Focus, Topics, and bounded Theologian',async({page,context,browserName})=>{
  test.skip(browserName==='webkit','Offline emulation is not consistently supported with WebKit service workers in CI');
  await page.goto('/home');
  await page.evaluate(()=>navigator.serviceWorker?.ready);
  await expect(page.locator('#pwa-status')).toContainText(/Offline access ready|Offline mode active/);
  await page.reload();
  await context.setOffline(true);

  await page.goto('/course',{waitUntil:'domcontentloaded'});
  await expect(page.locator('main[data-route-document="course"]')).toBeVisible();
  await expect(page.locator('.course-choice')).toHaveCount(6);
  await page.goto('/course?unit=c2.tabernacle&lesson=c2-ark',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.study-focus')).toBeVisible();
  await page.goto('/topics',{waitUntil:'domcontentloaded'});
  await expect(page.locator('main[data-route-document="topics"]')).toBeVisible();
  await expect(page.getByRole('link',{name:'Course',exact:true})).toBeVisible();
  await page.locator('#guide-open').click();
  const q=page.locator('#guide-q');
  await q.fill('Are Ruth and Naomi a lesbian love story?');
  await page.locator('#guide-form').getByRole('button',{name:'Ask'}).click();
  await expect(page.locator('#guide-body')).toContainText('does not explicitly identify Ruth and Naomi as sexual partners');
  await context.setOffline(false);
});
