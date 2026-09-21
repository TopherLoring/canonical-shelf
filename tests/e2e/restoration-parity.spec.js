import {test,expect} from '@playwright/test';

const primary=page=>page.getByRole('navigation',{name:'Primary'});

test('Bible restores the original shelf, typography, and in-context book drawer',async({page})=>{
  await page.addInitScript(()=>localStorage.removeItem('canonical-shelf-theme-v1'));
  await page.goto('/bible');

  await expect(page.locator('html')).toHaveAttribute('data-theme','canonical-original');
  await expect(page.getByRole('heading',{name:'The Canonical Shelf',exact:true})).toBeVisible();
  await expect(page.locator('.bible-mode-map .bible-mode-card')).toHaveCount(0);
  const typography=await page.locator('.bible-identity h1').evaluate(node=>getComputedStyle(node).fontFamily);
  expect(typography).toMatch(/Iowan Old Style|Palatino Linotype|Book Antiqua|Palatino/);

  const spines=page.locator('.shelf-spine');
  await expect(spines).toHaveCount(66);
  const ezekiel=spines.filter({hasText:'Ezekiel'}).first();
  await ezekiel.click();

  await expect(page).toHaveURL(/view=shelf.*book=26.*profile=1/);
  const drawer=page.locator('[data-book-drawer]');
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAttribute('role','dialog');
  await expect(drawer).toHaveAttribute('aria-modal','true');
  await expect(page.locator('.bible-drawer-background')).toHaveAttribute('inert','');
  await expect(page.getByRole('heading',{name:'Ezekiel',exact:true})).toBeVisible();
  await expect(drawer).toContainText('Visions from exile');
  await expect(drawer.locator('.book-state-chip')).toContainText('Current book');
  await expect(page.locator('[data-book-drawer-close]')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
  await expect(page).toHaveURL(/view=shelf.*focus=26/);
  await expect(page.locator('.shelf-spine[data-book="26"]')).toBeFocused();

  await page.locator('.shelf-spine[data-book="1"]').click();
  const readLink=page.getByRole('link',{name:/Read Genesis from chapter 1/i});
  await expect(readLink).toBeVisible();
  await readLink.click();
  await expect(page).toHaveURL(/book=1.*chapter=1|chapter=1.*book=1/);
  await expect(page.locator('.reader.scripture')).toBeVisible();
  await expect(page.getByRole('link',{name:/Genesis profile|Book details/i}).first()).toBeVisible();
});

test('Topics exposes authored sections, Scripture references, and related traversal',async({page})=>{
  await page.goto('/topics?topic=trinity');
  await expect(page.getByRole('heading',{name:/Trinity/i}).first()).toBeVisible();
  await expect(page.locator('.topic-section').first()).toBeVisible();
  await expect(page.getByText('Why Christians say this',{exact:true})).toBeVisible();
  await expect(page.getByText(/Matthew 28:19/).first()).toBeVisible();
  await expect(page.locator('.related-topics, .topic-course-links').first()).toBeVisible();
  await expect(page.getByRole('button',{name:'Ask the Theologian about this',exact:true})).toBeVisible();
});

test('Search reaches deep content across Topics, Course, books, passages, and glossary',async({page})=>{
  await page.goto('/search?q=covenant');
  await expect(page.getByRole('heading',{name:/covenant/i}).first()).toBeVisible();
  for(const domain of ['Topics','Course','Book profiles','Curated passages','Glossary']){
    await expect(page.getByRole('heading',{name:domain,exact:true})).toBeVisible();
  }
  await expect(page.locator('.search-hit').first()).toBeVisible();
  await expect(page.getByRole('button',{name:'Ask the Theologian about this',exact:true})).toBeVisible();
});

test('Course renders authored visuals as semantic learning objects without changing curriculum',async({page})=>{
  await page.goto('/course?unit=c1.transmission&lesson=c1-bible-languages');
  await expect(page.getByRole('heading',{name:/Before English/i}).first()).toBeVisible();
  const visualize=page.locator('.scene-rail a').filter({hasText:'Visualize'}).first();
  await expect(visualize).toBeVisible();
  await visualize.click();
  await expect(page.locator('.semantic-visual')).toBeVisible();
  await expect(page.locator('.semantic-visual')).toHaveAttribute('data-visual-type',/flow|timeline|shelf|story-arc|relationship|compare|theme-thread|map-lite|book-profile|verse-context|spectrum|stack/);
  await expect(page.locator('.semantic-visual__text summary',{hasText:'Text equivalent'})).toBeVisible();
});

test('Practice exposes the full recovered curated passage library and translation-aware study',async({page})=>{
  await page.goto('/practice?mode=verses');
  await expect(page.getByRole('heading',{name:'Verse Library',exact:true})).toBeVisible();
  await expect(page.getByText(/232 passages/).first()).toBeVisible();
  await expect(page.getByRole('link',{name:'BSB',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'KJV',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Yours',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:/Start Verse Drill/i})).toBeVisible();
  await expect(page.locator('.verse-library-card').first()).toBeVisible();
});

test('Guide retrieves evidence from restored cross-product study graph',async({page})=>{
  await page.goto('/search?q=trinity');
  await page.getByRole('button',{name:'Ask the Theologian about this',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Ask the Guide',exact:true})).toBeVisible();
  await expect(page.getByText('Evidence and connections',{exact:true})).toBeVisible();
  await expect(page.locator('#guide-body .result').first()).toBeVisible();
  await expect(page.locator('#guide-body a[href^="/topics?topic="]').first()).toBeVisible();
});

test('restoration preserves the five primary destinations',async({page})=>{
  await page.goto('/home');
  for(const destination of ['Home','Course','Bible','Topics','Practice']){
    await expect(primary(page).getByRole('link',{name:destination,exact:true})).toBeVisible();
  }
});
