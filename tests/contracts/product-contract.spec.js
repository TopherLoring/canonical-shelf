import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes=['/home','/course','/bible','/topics','/practice','/search'];

test('core destinations render as valid documents',{tag:'@smoke'},async({page})=>{
  test.slow();
  for(const route of routes){
    const response=await page.goto(route,{waitUntil:'domcontentloaded'});
    expect(response?.ok(),`${route} should load`).toBeTruthy();
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();
  }
});

test('primary navigation is a same-document SPA transition',{tag:'@smoke'},async({page})=>{
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
  await page.locator('nav.primary a[href="/path"], nav.primary a[href="/course"]').click();
  await expect(page).toHaveURL(/\/(?:course|path)(?:[?#]|$)/);
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
  await expect(page.locator('main [data-book-select]')).toHaveCount(66);
  await page.locator('nav.primary a[href="/path"], nav.primary a[href="/course"]').click();
  await expect(page.locator('[data-learning-path]')).toBeVisible();
  await page.locator('.profile-link').click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.locator('[data-profile-progress] .progress-panel__summary')).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-learning-path]')).toBeVisible();
  // Learning Path (redesigned, S3.J): a module in the rail, a unit's lessons, then the lesson itself.
  const moduleHref=await page.locator('#path-modules a[href^="/course?course="]').nth(1).getAttribute('href');
  expect(moduleHref).toBeTruthy();
  await page.locator('#path-modules a[href^="/course?course="]').nth(1).click();
  await expect(page.locator('[data-path-unit]')).not.toHaveCount(0);
  const lessonLink=page.locator('[data-path-unit][open] a[data-activity-link^="lesson:"]').first();
  expect(await lessonLink.getAttribute('href')).toMatch(/lesson=/);
  await lessonLink.click();
  await expect(page.locator('[data-lesson-screen]')).toBeVisible();
  expect(errors).toEqual([]);
});

test('one navigation bar: destinations are tabs in the masthead; Home keeps the canonical library',async({page})=>{
  await page.goto('/home');
  await expect(page.locator('nav:visible:not(.cs-footer__links)'),'one navigation bar besides the policy links in the footer').toHaveCount(1);
  await expect(page.locator('.cs-top .cs-nav a')).toHaveText(['Shelf','Learning Path','Bible','Study Topics','Review & Practice']);
  await expect(page.locator('main [data-book-select]')).toHaveCount(66);
}); 

test('one inline Feedback link on every screen and the Theologian tab everywhere, including lessons',async({page})=>{
  test.slow();
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

test('cross-references follow the selected verse, even when the verse is chosen before the data arrives',{tag:'@smoke'},async({page})=>{
  // Slow the chapter's cross-reference download so the verse is clicked before the data arrives (as on slow connections).
  await page.route('**/data/crossref/**',async route=>{await new Promise(r=>setTimeout(r,1500));await route.continue()});
  await page.goto('/bible?book=43&chapter=3');
  const panel=page.locator('[data-reader-panel]');
  await page.locator('[data-reader] #v16').click();
  await expect(panel.locator('.reader-panel-title')).toHaveText('John 3:16');
  const links=panel.locator('.ui-scripture-ref-link');
  await expect(links.first()).toBeVisible({timeout:5000});
  await expect(panel).not.toContainText('Citation');
  await expect(page.locator('#reader-rail-xrefs .ui-rail-count')).toHaveText(/^\d+$/);
  // Expanding a reference shows its verse text from the local Bible.
  await panel.locator('[data-ref-toggle]').first().click();
  await expect(panel.locator('.ui-scripture-ref-text').first()).toBeVisible();
  await expect(page.locator('#v5-verse-inspect')).toHaveCount(0);
});

test('lesson navigation: the sections list (rail on desktop, All steps sheet on phone) jumps to any section\'s first step, Continue/Back move one step',async({page})=>{
  for(const [w,h] of [[1440,900],[390,844]]){
    await page.setViewportSize({width:w,height:h});
    await page.goto('/course?unit=c1.christianity&lesson=begin&step=3');
    if(w<=700)await page.locator('.lesson-all-steps').click();
    const list=w>700?page.locator('.lesson-rail .lesson-sections'):page.locator('#lesson-steps-sheet .lesson-sections');
    await expect(list).toBeVisible();
    const current=list.locator('li.is-current');
    await expect(current).toHaveCount(1);
    await expect(current.locator('a')).toHaveAttribute('aria-current','step');
    const items=list.locator('li');
    const count=await items.count();
    await items.nth(count-1).locator('a').click();
    await expect(page).toHaveURL(/step=\d+/);
    await expect(page.locator('[data-lesson-count]')).toHaveText(/^\d+ of \d+$/);
    const atLast=await page.locator('[data-lesson-count]').textContent();
    await page.locator('.lesson-back').click();
    await expect(page.locator('[data-lesson-count]')).not.toHaveText(atLast);
    const before=await page.locator('[data-lesson-count]').textContent();
    await page.locator('.lesson-continue').click();
    await expect(page.locator('[data-lesson-count]')).not.toHaveText(before);
  }
});

test('authored lessons: sections may span several steps, checks render inline, Scripture is readable in light and dark (quoted inline and in the popover)',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/course?unit=c1.christianity&lesson=begin&step=1');
  await expect(page.locator('.lesson-rail .lesson-sections li').first()).toBeVisible();
  const perSection=await page.locator('.lesson-rail .lesson-sections li').evaluateAll(items=>items.map(li=>li.querySelectorAll('.lesson-section-dots span').length));
  expect(perSection.length).toBeGreaterThan(1);
  expect(Math.max(...perSection),'at least one section spans several steps').toBeGreaterThan(1);

  // A check renders inline on the step that holds it (begin step 13, the approved Lesson 1).
  await page.goto('/course?unit=c1.christianity&lesson=begin&step=13');
  await expect(page.locator('.lesson-body-text .inline-check')).toHaveCount(1);

  // Contrast of a text element against the first opaque background at or above it.
  const ratioOf=textSel=>page.evaluate(t=>{
    const rgba=c=>c.match(/[\d.]+/g).map(Number);
    const lum=([r,g,bl])=>[r,g,bl].map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
    const el=document.querySelector(t);
    let bg=el;while(bg&&(rgba(getComputedStyle(bg).backgroundColor)[3]??1)===0)bg=bg.parentElement;
    const f=lum(rgba(getComputedStyle(el).color)),b=lum(rgba(getComputedStyle(bg||document.body).backgroundColor));
    return (Math.max(f,b)+.05)/(Math.min(f,b)+.05);
  },textSel);

  // A short reading is quoted on the card (c1-library-groups step 2); a long one opens a popover (begin step 8).
  for(const mode of ['light','dark']){
    await page.goto('/course?unit=c1.bible&lesson=c1-library-groups&step=2');
    await page.evaluate(m=>document.documentElement.setAttribute('data-mode',m),mode);
    await expect(page.locator('.lesson-reading-inline')).toBeVisible();
    expect(await ratioOf('.lesson-reading-inline .ui-scripture-block-quote'),`quoted Scripture contrast in ${mode} mode`).toBeGreaterThanOrEqual(4.5);

    await page.goto('/course?unit=c1.christianity&lesson=begin&step=8');
    await page.evaluate(m=>document.documentElement.setAttribute('data-mode',m),mode);
    await page.locator('[data-reading-open]').first().click();
    await expect(page.locator('.lesson-reading-dialog[open]')).toBeVisible();
    expect(await ratioOf('.lesson-reading-dialog[open] .lesson-reading-text p'),`popover Scripture contrast in ${mode} mode`).toBeGreaterThanOrEqual(4.5);
  }
});

test('lesson objectives describe lessons on the unit overview and never appear inside the lesson',async({page})=>{
  const objective='Put the proclamation Paul recalls';
  await page.goto('/course?unit=c1.christianity');
  await expect(page.locator('.unit-lesson-objective').first()).toContainText(objective);
  await page.goto('/course?unit=c1.christianity&lesson=begin&step=1');
  const total=Number((await page.locator('[data-lesson-count]').textContent()).match(/of (\d+)/)[1]);
  for(const step of [1,2,3,total]){
    await page.goto(`/course?unit=c1.christianity&lesson=begin&step=${step}`);
    await expect(page.locator('main')).not.toContainText(objective);
  }
});

test('top bar: logo mark, tabs, search, Feedback, profile; the profile is a full screen with appearance',async({page})=>{
  await page.goto('/home');
  const bar=page.locator('header.masthead');
  await expect(bar.locator('.cs-wordmark'),'Home shows the logo mark only').toBeHidden();
  await expect(bar.locator(':scope > *')).toHaveCount(3);
  await expect(bar.locator('.masthead-tools > *')).toHaveCount(3);
  await page.goto('/bible');
  await expect(page.locator('header.masthead .brand')).toContainText('The Canonical Shelf');
  await page.goto('/home');
  for(const gone of ['#progress-open','#appearance-open','#account-open','#translation-select'])await expect(page.locator(gone)).toHaveCount(0);
  await bar.locator('.search-toggle').click();
  await expect(bar.locator('#q')).toBeFocused();
  await page.keyboard.type('covenant');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/search\?q=covenant/);
  await bar.locator('.profile-link').click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(bar.locator('.profile-link')).toHaveAttribute('aria-current','page');
  for(const id of ['you','progress','notes','appearance','reading','privacy'])await expect(page.locator(`#${id}.profile-screen__section`)).toBeVisible();
  await expect(page.locator('#you [data-account-mount]')).not.toContainText('Checking your account');
  const cards=page.locator('#appearance [data-theme-option]');
  const target=await cards.nth(2).getAttribute('data-theme-option');
  await cards.nth(2).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme',target);
  await page.locator('#appearance [data-mode-choice="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-mode','dark');
  await expect(page.locator('#appearance-panel')).toHaveCount(0);
  // the selected mode button is readable (text on the action color)
  const sel=page.locator('#appearance .mode-toggle-btn.is-selected');
  const ratio=await sel.evaluate(el=>{const rgb=c=>c.match(/\d+(\.\d+)?/g).slice(0,3).map(Number);const L=([r,g,b])=>[r,g,b].map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);const f=L(rgb(getComputedStyle(el).color)),b=L(rgb(getComputedStyle(el).backgroundColor));return (Math.max(f,b)+.05)/(Math.min(f,b)+.05)});
  expect(ratio,'selected light/dark button text contrast').toBeGreaterThanOrEqual(4.5);
  // arriving with a section in the address scrolls to it
  await page.goto('/profile#appearance');
  await expect(page.locator('#appearance')).toBeInViewport();
  // section links scroll to the section instead of re-rendering the page
  await page.locator('.profile-screen__nav a[href="#privacy"]').click();
  await expect(page).toHaveURL(/\/profile#privacy$/);
  await expect(page.locator('#privacy')).toBeInViewport();
  // theme cards: name and description do not overlap and stay readable in dark mode
  const card=page.locator('#appearance .theme-choice').first();
  const gap=await card.evaluate(el=>{const n=el.querySelector('strong').getBoundingClientRect(),d=el.querySelector('.theme-choice__text > span').getBoundingClientRect();return d.top-n.bottom});
  expect(gap,'description starts below the theme name').toBeGreaterThanOrEqual(0);
  await expect(card.locator('.theme-choice__swatch i')).toHaveCount(4);
});

test('each page starts close under the top bar (no large blank band); Home has no 66-books line',async({page})=>{
  for(const u of ['/home','/course','/bible?book=43&chapter=1','/bible?book=43&profile=1','/bible?view=timeline','/search?q=grace','/topics','/practice','/profile']){
    await page.goto(u);
    await expect(page.locator('main')).not.toBeEmpty();
    // Measured from the frame's top edge: the frame itself floats 28 board units under the bar by design.
    const gap=await page.evaluate(()=>{const frame=document.querySelector('main').getBoundingClientRect().top;const w=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT,{acceptNode:n=>n.textContent.trim()&&n.parentElement.offsetParent!==null?1:3});const t=w.nextNode();return t.parentElement.getBoundingClientRect().top-frame});
    expect(gap,`space above the first text on ${u}`).toBeLessThanOrEqual(48);
  }
  await page.goto('/home');
  await expect(page.locator('main')).not.toContainText('66 books');
});

test('the internal belief context is never served by the site (only the Theologian server reads it)',async({request})=>{
  for(const path of ['/data/theologian-belief-context.md','/data/statement-of-faith-v3.md']){
    const res=await request.get(path);
    const body=await res.text();
    expect(body,`${path} must not expose the internal belief context`).not.toContain('Internal Belief and Interpretive Context');
  }
  const llms=await (await request.get('/llms.txt')).text();
  expect(llms).not.toContain('Internal Belief and Interpretive Context');
});

test('notes are built into the Bible side panel, follow the selected verse, and appear in the profile',{tag:'@smoke'},async({page})=>{
  await page.goto('/bible?book=43&chapter=3');
  const mount=page.locator('[data-reader-notes] [data-notes-mount]');
  await expect(mount.locator('.study-notes__anchor')).toContainText('John 3');
  await expect(page.locator('[data-notes-title]')).toHaveText('My notes on John 3');
  await page.locator('[data-reader] #v16').click();
  await expect(mount.locator('.study-notes__anchor')).toContainText('John 3:16');
  await expect(page.locator('[data-notes-title]')).toHaveText('My notes on 3:16');
  await mount.locator('[data-note-text]').fill('God so loved the world: ask about "world".');
  await expect(mount.locator('[data-note-discuss]')).toHaveCount(0);
  await mount.getByRole('button',{name:'Add a note',exact:true}).click();
  await expect(mount.locator('[data-note-status]')).toContainText('Saved',{timeout:5000});
  // The selected verse is kept in the address, so a reload returns to the same verse and note.
  await expect(page).toHaveURL(/[?&]start=16(&|$)/);
  await page.reload();
  await expect(page.locator('[data-reader-notes] [data-saved-note]')).toContainText('God so loved the world: ask about "world".');
  await page.locator('[data-reader-notes] .study-notes__all').click();
  await expect(page).toHaveURL(/\/profile#notes$/);
  await expect(page.locator('[data-my-notes]')).toContainText('John 3:16');
});

test('guided lessons foreground learner copy and keep notes separate from study tools',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/course?unit=c1.christianity&lesson=begin&step=1');
  const body=page.locator('.lesson-body-text');
  await expect(body.locator('.scene-objective')).toHaveCount(0);
  await expect(body.locator('p').first()).toBeVisible();

  // My Notes is its own column, separate from the Glossary / Go deeper apparatus.
  await expect(page.locator('.lesson-side [data-note-text]')).toBeVisible();
  await expect(page.locator('.lesson-side .lesson-apparatus details:has-text(\'Your notes\')')).toHaveCount(0);
  await expect(page.locator('.lesson-side .lesson-apparatus summary').first()).not.toContainText('Your notes');
});

test('desktop and narrow layouts do not create horizontal page overflow',{tag:'@smoke'},async({page})=>{
  for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    for(const route of ['/home','/bible','/course']){
      await page.goto(route);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      expect(overflow,`${route} at ${viewport.width}px`).toBeLessThanOrEqual(2);
    }
  }
});

test('critical accessibility smoke is clean on representative destinations',{tag:'@smoke'},async({page})=>{
  for(const route of ['/home','/bible','/course']){
    await page.goto(route);
    const results=await new AxeBuilder({page}).analyze();
    const blocking=results.violations.filter(v=>v.impact==='critical'||v.impact==='serious');
    expect(blocking,`${route}: ${blocking.map(v=>v.id).join(', ')}`).toEqual([]);
  }
});
