import {test,expect} from '@playwright/test';

test('Course Catalog opens as a six-course selector for a learner without progress',async({page})=>{
  await page.goto('/course');
  await expect(page.getByRole('heading',{name:'Choose where to begin.'})).toBeVisible();
  await expect(page.locator('.course-choice')).toHaveCount(6);
  await expect(page.locator('.course-choice[aria-selected="true"]')).toHaveCount(1);
  const second=page.locator('.course-choice').nth(1);
  const title=await second.locator('strong').textContent();
  await second.click();
  await expect(page.locator('.course-preview__head h2')).toContainText(title.trim());
  await expect(page.locator('.course-preview__units .course-preview__unit')).not.toHaveCount(0);
});

test('selected course uses Current Next Later and Prev Next navigation',async({page})=>{
  const data=await page.request.get('/data/catalog.json').then(response=>response.json());
  const course=data.courses[1]||data.courses[0];
  await page.goto(`/course?course=${encodeURIComponent(course.id)}`);
  await expect(page.locator('.course-catalog-detail')).toBeVisible();
  await expect(page.locator('.course-current-sequence')).toContainText('Current');
  await expect(page.locator('.course-current-sequence')).toContainText('Next');
  await expect(page.locator('.course-volume-nav').getByRole('link',{name:'Prev'})).toBeVisible();
  await expect(page.locator('.course-volume-nav').getByRole('link',{name:'Next'})).toBeVisible();
  await expect(page.locator('.course-catalog-contents')).toBeVisible();
});

test('Study Focus uses dot progress and attached Session Notes',async({page})=>{
  await page.goto('/course?unit=c2.exodus&lesson=c2-passover');
  await expect(page.locator('.library-lesson-identity')).toBeVisible();
  await expect(page.locator('.library-lesson-identity')).toContainText(/COURSE 2/i);
  await expect(page.locator('.study-folio__count')).toBeHidden();
  await expect(page.locator('.scene-rail a span').first()).toHaveText('');
  await expect(page.locator('#study-apparatus h2')).toHaveText('Session Notes');
  await expect(page.locator('#study-apparatus').getByRole('button',{name:'Journal Notes'})).toBeVisible();
  await expect(page.locator('#study-apparatus').getByRole('button',{name:'Feedback'})).toBeVisible();
  await expect(page.locator('.study-scripture').first()).toHaveCSS('background-color','rgb(49, 53, 60)');
});

test('Bible reader uses a light reading surface with charcoal collapsible book notes',async({page})=>{
  await page.goto('/bible?book=43&chapter=3');
  await expect(page.locator('.bible-reader-shell')).toBeVisible();
  await expect(page.locator('.bible-reader-shell .reader')).toBeVisible();
  await expect(page.locator('.library-reader-panel')).toBeVisible();
  await expect(page.locator('.library-reader-panel h2')).toContainText('John');
  await expect(page.locator('.library-reader-panel details')).not.toHaveCount(0);
  await expect(page.locator('.library-reader-panel')).toHaveCSS('background-color','rgb(49, 53, 60)');
});

test('Bible shelf exposes a full-name reveal for each compact spine',async({page})=>{
  await page.goto('/bible?view=shelf');
  const spines=page.locator('.shelf-spine');
  await expect(spines).toHaveCount(66);
  await expect(spines.first().locator('.shelf-spine__reveal')).toHaveCount(1);
  await spines.first().focus();
  await expect(spines.first().locator('.shelf-spine__reveal')).toBeVisible();
});

test('Topic reader uses the light reference surface with charcoal contextual notes',async({page})=>{
  const data=await page.request.get('/data/catalog.json').then(response=>response.json());
  const topic=data.topics[0];
  await page.goto(`/topics?topic=${encodeURIComponent(topic.id)}`);
  await expect(page.locator('.topic-library-shell')).toBeVisible();
  await expect(page.locator('.topic-library-shell>.topic-reference-page')).toBeVisible();
  await expect(page.locator('.topic-context-panel')).toBeVisible();
  await expect(page.locator('.topic-context-panel')).toContainText(/Context & connections/i);
  await expect(page.locator('.topic-context-panel details')).not.toHaveCount(0);
});

test('Account and sync surface includes selectable appearance themes',async({page})=>{
  await page.goto('/home');
  await page.getByRole('button',{name:'Account & sync'}).click();
  await expect(page.locator('.profile-theme-choice')).toBeVisible();
  await expect(page.locator('.profile-theme-grid [data-theme-option]')).toHaveCount(6);
  await page.locator('.profile-theme-grid [data-theme-option="slate-linen"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','slate-linen');
});
