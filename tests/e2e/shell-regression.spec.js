import {test,expect} from '@playwright/test';

test('shell controls initialize and permanent footer disclosures are usable',async({page})=>{
  await page.goto('/home');

  await page.getByRole('button',{name:'Progress',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Your Canonical Shelf'})).toBeVisible();
  await page.getByRole('button',{name:'Close progress'}).click();
  await expect(page.locator('#progress-panel')).toBeHidden();

  const guide=page.getByRole('button',{name:'Ask the Guide',exact:true});
  await expect(guide).toBeEnabled();
  await guide.click();
  await expect(page.getByRole('heading',{name:'Ask the Guide',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Close Ask the Guide'}).click();

  await page.getByRole('button',{name:'Feedback',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Send feedback'})).toBeVisible();
  await page.getByRole('button',{name:'Close feedback'}).click();

  const footer=page.locator('footer.site-footer');
  await expect(footer).toBeVisible();
  for(const label of ['Statement of Faith','About Canonical Shelf','How this guide approaches Scripture','Sources & methodology','Translation information','Accessibility','Privacy']){
    await expect(footer.getByRole('link',{name:label,exact:true})).toBeVisible();
  }

  await footer.getByRole('link',{name:'About Canonical Shelf',exact:true}).click();
  await expect(page).toHaveURL(/\/about\.html#about$/);
  await expect(page.getByRole('heading',{name:'How Canonical Shelf works.'})).toBeVisible();
  await expect(page.locator('#about')).toBeVisible();
});

test('primary destinations remain links and do not depend on utility-button scripting',async({page})=>{
  await page.goto('/home');
  for(const destination of ['Home','Course','Bible','Topics','Practice']){
    const link=page.getByRole('navigation',{name:'Primary'}).getByRole('link',{name:destination,exact:true});
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href',new RegExp(`/${destination.toLowerCase()}$`));
  }
  await page.getByRole('navigation',{name:'Primary'}).getByRole('link',{name:'Bible',exact:true}).click();
  await expect(page).toHaveURL(/\/bible$/);
  await expect(page.getByRole('heading',{name:'The Canonical Shelf',exact:true})).toBeVisible();
});
