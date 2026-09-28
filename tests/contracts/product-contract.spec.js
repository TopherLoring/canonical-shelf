import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes=['/home','/course','/bible','/topics','/practice','/search'];

test('core destinations render as valid documents',async({page})=>{
  for(const route of routes){
    const response=await page.goto(route,{waitUntil:'domcontentloaded'});
    expect(response?.ok(),`${route} should load`).toBeTruthy();
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();
  }
});

test('primary navigation is a same-document SPA transition',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/course');
  await expect(page.locator('#guide-open')).toBeEnabled();
  await page.evaluate(()=>{window.__CANONICAL_SPA_SENTINEL__='same-document'});
  for(const route of ['/bible','/topics','/practice','/home']){
    await page.locator(`nav.primary a[href="${route}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${route.replace('/','\\/')}(?:[?#]|$)`));
    await expect(page.locator('#main h1')).toHaveCount(1);
    expect(await page.evaluate(()=>window.__CANONICAL_SPA_SENTINEL__)).toBe('same-document');
  }
  await page.locator('nav.primary a[href="/course"]').click();
  await expect(page).toHaveURL(/\/course(?:[?#]|$)/);
  expect(await page.evaluate(()=>window.__CANONICAL_SPA_SENTINEL__)).toBe('same-document');
  await page.goBack();
  await expect(page).toHaveURL(/\/home(?:[?#]|$)/);
  expect(await page.evaluate(()=>window.__CANONICAL_SPA_SENTINEL__)).toBe('same-document');
  expect(errors).toEqual([]);
});

test('DOM template bank drives home, progress, course, and unit views',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/home');
  for(const id of ['tpl-home','tpl-home-book','tpl-home-recent-item','tpl-progress-panel','tpl-progress-course-link','tpl-progress-recent-item','tpl-course-chooser','tpl-course-chooser-preview','tpl-course-landing','tpl-course-volume-link','tpl-course-detail','tpl-course-unit-card','tpl-unit-experience','tpl-unit-activity-step'])await expect(page.locator(`#${id}`)).toHaveCount(1);
  await expect(page.locator('main a[href^="/bible?book="]')).toHaveCount(66);
  await page.locator('nav.primary a[href="/course"]').click();
  await expect(page.locator('.course-volume-landing')).toBeVisible();
  await expect(page.locator('#progress-open')).toBeEnabled();
  await page.locator('#progress-open').click();
  await expect(page.locator('#progress-body .progress-panel__summary')).toBeVisible();
  await page.locator('#progress-close').click();
  const courseHref=await page.locator('.course-volume').first().getAttribute('href');
  expect(courseHref).toBeTruthy();
  await page.locator('.course-volume').first().click();
  await expect(page.locator('.course-catalog-detail')).toBeVisible();
  const unitHref=await page.locator('.journey-unit-card h2 a').first().getAttribute('href');
  expect(unitHref).toBeTruthy();
  await page.locator('.journey-unit-card h2 a').first().click();
  await expect(page.locator('.unit-experience-hero')).toBeVisible();
  await expect(page.locator('.activity-step')).not.toHaveCount(0);
  expect(errors).toEqual([]);
});

test('one navigation bar: destinations are tabs in the masthead; Home keeps the canonical library',async({page})=>{
  await page.goto('/home');
  await expect(page.locator('nav:not(.site-footer__links)'),'one navigation bar besides the policy links in the footer').toHaveCount(1);
  await expect(page.locator('.masthead nav.primary a')).toHaveText(['Shelf','Pathway','Bible','Catalog','Practice']);
  await expect(page.locator('main a[href^="/bible?book="]')).toHaveCount(66);
}); 

test('one inline Feedback link on every screen and the Theologian tab everywhere, including lessons',async({page})=>{
  for(const route of ['/home','/course','/bible?book=43&chapter=3','/topics','/practice','/course?unit=c1.christianity&lesson=begin']){
    await page.goto(route);
    await expect(page.locator('main')).not.toBeEmpty();
    const visible=await page.locator('[data-feedback-open]').evaluateAll(els=>els.filter(el=>el.offsetParent!==null&&getComputedStyle(el).visibility!=='hidden').map(el=>getComputedStyle(el).position));
    expect(visible.length,`exactly one visible Feedback link on ${route}`).toBe(1);
    expect(visible[0],`Feedback link is not floating on ${route}`).not.toBe('fixed');
    await expect(page.locator('.utility-fab'),`no floating utility buttons on ${route}`).toHaveCount(0);
    const tab=page.locator('#guide-open');
    await expect(tab,`Theologian tab visible on ${route}`).toBeVisible();
    const box=await tab.boundingBox(),width=page.viewportSize().width;
    expect(Math.round(box.x+box.width),`Theologian tab sits on the right edge on ${route}`).toBeGreaterThanOrEqual(width-1);
  }
});

test('Theologian opens as a fixed chat panel with a conversation menu, and closes without losing the chat',async({page})=>{
  await page.goto('/course');
  await page.locator('#guide-open').click();
  await expect(page.locator('#guide')).toBeVisible();
  await expect(page.locator('#guide-q')).toBeVisible();
  await page.locator('#guide-menu-button').click();
  await expect(page.locator('#guide-menu [role=menuitem]')).toHaveText(['New chat','Save to my profile','Download as a text file','Share…']);
  await page.keyboard.press('Escape');
  await page.locator('#guide-q').fill('What is the gospel?');
  await page.locator('#guide-q').press('Enter');
  await expect(page.locator('#guide .chat-message--assistant').first()).toBeVisible({timeout:20000});
  await page.locator('#guide-close').click();
  await expect(page.locator('#guide')).toBeHidden();
  await page.locator('#guide-open').click();
  await expect(page.locator('#guide .chat-message--user').first()).toContainText('What is the gospel?');
  const answer=page.locator('#guide .chat-message--assistant').first();
  await expect(answer.locator('[data-theologian-rate="up"]')).toBeVisible();
  await answer.locator('[data-theologian-flag]').click();
  const flag=page.locator('#guide [data-flag-form]');
  await expect(flag.locator('select[name=reason] option')).toHaveText(['Choose a reason','Disagreement','Profound','Very helpful','Misguided','Inappropriate','Contrary to Scripture']);
  await expect(flag.locator('textarea[name=message]')).toHaveAttribute('required','');
});

test('cross-references are the last, collapsed detail level of the Reading Desk and list plain verse addresses',async({page})=>{
  await page.goto('/bible?book=43&chapter=3');
  const desk=page.locator('.library-reader-panel');
  await expect(desk.locator(':scope > details').last()).toHaveClass(/reader-crossrefs/);
  await page.locator('.reader.scripture .verses p').nth(15).click();
  const summary=desk.locator('[data-xref-summary]');
  await expect(summary).toContainText('John 3:16');
  await expect(desk.locator('details.reader-crossrefs')).not.toHaveAttribute('open','');
  await summary.click();
  const links=desk.locator('.xref-link');
  await expect(links.first()).toBeVisible();
  await expect(desk.locator('details.reader-crossrefs')).not.toContainText('Citation');
  expect(Number(await links.first().evaluate(el=>getComputedStyle(el).fontWeight))).toBeLessThanOrEqual(500);
  await expect(page.locator('#v5-verse-inspect')).toHaveCount(0);
});

test('lesson progress: unlabeled dots (vertical on desktop, centered along the bottom on phones) navigate to any step',async({page})=>{
  for(const [w,h,dir] of [[1440,900,'column'],[390,844,'row']]){
    await page.setViewportSize({width:w,height:h});
    await page.goto('/course?unit=c1.bible&lesson=c1-reading-kinds&scene=3');
    const rail=page.locator('.scene-rail'),dots=rail.locator('a');
    await expect(rail).toBeVisible();
    expect(await rail.evaluate(el=>getComputedStyle(el).flexDirection)).toBe(dir);
    await expect(rail.locator('.scene-rail__label').first()).toBeHidden();
    const count=await dots.count();
    expect(await dots.evaluateAll(a=>a.map(x=>x.dataset.state))).toEqual(Array.from({length:count},(_,i)=>i<2?'complete':i===2?'current':'upcoming'));
    await expect(dots.first()).toHaveAttribute('aria-label',new RegExp(`Step 1 of ${count}`));
    if(dir==='row'){const box=await rail.boundingBox();expect(Math.abs(box.x+box.width/2-w/2),'dots centered on phones').toBeLessThan(40)}
    else{await dots.nth(4).hover();await expect(dots.nth(4).locator('.scene-rail__label'),'step name shows on hover on desktop').toBeVisible()}
    await dots.nth(count-1).click();
    await expect(page).toHaveURL(new RegExp(`scene=${count}(?:&|$)`));
    await expect(rail.locator('a').nth(count-1)).toHaveAttribute('data-state','current');
    await rail.locator('a').first().click();
    await expect(rail.locator('a').first()).toHaveAttribute('data-state','current');
  }
});

test('authored Lesson 1: one step per section, checks inline where written, readable Scripture in light and dark',async({page})=>{
  await page.goto('/course?unit=c1.christianity&lesson=begin&scene=2');
  await expect(page.locator('.scene-rail a')).toHaveCount(7);
  await expect(page.locator('.scene-rail a').nth(1)).toHaveAttribute('aria-label',/Read the passage/);
  const scene=page.locator('.study-scene, main').first();
  await expect(scene.locator('.study-scripture')).toBeVisible();
  await expect(scene.locator('.inline-check')).toHaveCount(1);
  const order=await page.evaluate(()=>{const r=document.querySelector('.study-scripture'),c=document.querySelector('.inline-check');return r.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_FOLLOWING?'reading-then-check':'check-first'});
  expect(order).toBe('reading-then-check');
  for(const mode of ['light','dark']){
    await page.evaluate(m=>document.documentElement.setAttribute('data-mode',m),mode);
    const ratio=await page.locator('.study-scripture p:not(.eyebrow)').first().evaluate(el=>{
      const rgb=c=>c.match(/\d+(\.\d+)?/g).slice(0,3).map(Number);
      const lum=([r,g,b])=>[r,g,b].map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
      const f=lum(rgb(getComputedStyle(el).color)),b=lum(rgb(getComputedStyle(el.closest('.study-scripture')).backgroundColor));
      return (Math.max(f,b)+.05)/(Math.min(f,b)+.05);
    });
    expect(ratio,`Scripture contrast in ${mode} mode`).toBeGreaterThanOrEqual(4.5);
  }
});

test('lesson objectives describe lessons on the unit overview and never appear inside the lesson',async({page})=>{
  const objective='Put the proclamation Paul recalls';
  await page.goto('/course?unit=c1.christianity');
  await expect(page.locator('.unit-lesson-objective').first()).toContainText(objective);
  for(const scene of [1,2,3,7]){
    await page.goto(`/course?unit=c1.christianity&lesson=begin&scene=${scene}`);
    await expect(page.locator('main')).not.toContainText(objective);
  }
});

test('notes are built into the Bible side panel, follow the selected verse, and appear in the profile',async({page})=>{
  await page.goto('/bible?book=43&chapter=3');
  const mount=page.locator('.library-reader-panel [data-notes-mount]');
  await expect(mount.locator('.study-notes__anchor')).toContainText('John 3');
  await page.locator('.reader.scripture .verses p').nth(15).click();
  await expect(mount.locator('.study-notes__anchor')).toContainText('John 3:16');
  await mount.locator('[data-note-text]').fill('God so loved the world: ask about "world".');
  await mount.locator('[data-note-discuss]').check();
  await expect(mount.locator('[data-note-status]')).toContainText('Saved',{timeout:5000});
  await page.reload();
  await page.locator('.reader.scripture .verses p').nth(15).click();
  await expect(page.locator('.library-reader-panel [data-note-text]')).toHaveValue('God so loved the world: ask about "world".');
  await page.locator('#progress-open').click();
  await expect(page.locator('[data-my-notes]')).toContainText('To bring up in person (1)');
  await expect(page.locator('[data-my-notes]')).toContainText('John 3:16');
});

test('guided lessons foreground learner copy and keep notes separate from study tools',async({page})=>{
  await page.goto('/course?unit=c1.christianity&lesson=begin');
  const scene=page.locator('.study-scene__inner');
  await expect(scene.locator('.scene-objective')).toHaveCount(0);
  await expect(scene.locator('.scene-callout')).toBeVisible();
  await expect(scene.locator('.scene-prose').first()).toBeVisible();

  const desk=page.locator('#study-apparatus');
  await expect(desk).toBeVisible();
  await expect(desk.locator('h2')).toHaveText('Study Desk');
  await expect(desk.locator('[data-notes-mount] [data-note-text]')).toBeVisible();
  await expect(desk.locator('.apparatus-module summary').first()).toContainText('Your notes');
});

test('desktop and narrow layouts do not create horizontal page overflow',async({page})=>{
  for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    for(const route of ['/home','/bible','/course']){
      await page.goto(route);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      expect(overflow,`${route} at ${viewport.width}px`).toBeLessThanOrEqual(2);
    }
  }
});

test('critical accessibility smoke is clean on representative destinations',async({page})=>{
  for(const route of ['/home','/bible','/course']){
    await page.goto(route);
    const results=await new AxeBuilder({page}).analyze();
    const blocking=results.violations.filter(v=>v.impact==='critical'||v.impact==='serious');
    expect(blocking,`${route}: ${blocking.map(v=>v.id).join(', ')}`).toEqual([]);
  }
});
