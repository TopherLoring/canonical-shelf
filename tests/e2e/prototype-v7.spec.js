import {test,expect} from '@playwright/test';

test.describe('v7 interactive prototype gate',()=>{
  test.beforeEach(async({page})=>{
    await page.goto('/prototypes/v7/index.html');
    await expect(page.getByText('Canonical Shelf',{exact:true}).first()).toBeVisible();
  });

  test('switches among all three directions and all required surfaces',async({page})=>{
    for(const direction of ['A','B','C']){
      await page.getByRole('button',{name:new RegExp(`^${direction}`)}).click();
      await expect(page.locator('body')).toHaveAttribute('data-direction',direction);
      for(const surface of ['Home','Learn','Lesson','Practice','Bible','Topics','Theologian']){
        await page.getByRole('navigation',{name:'Prototype pages'}).getByRole('button',{name:surface,exact:true}).click();
        await expect(page.locator('#prototype-main')).not.toBeEmpty();
      }
    }
  });

  test('lesson scenes, practice, Bible, Topics, and Theologian are interactive',async({page})=>{
    await page.getByRole('button',{name:'Lesson',exact:true}).click();
    await expect(page.getByText('Every text has a setting')).toBeVisible();
    await page.getByRole('button',{name:/Next/}).click();
    await expect(page.getByText('A claim made inside history')).toBeVisible();

    await page.getByRole('button',{name:'Practice',exact:true}).click();
    await page.getByRole('button',{name:/Move Exodus from Egypt down/}).click();
    await page.getByRole('button',{name:'Check order'}).click();
    await expect(page.locator('.feedback')).toBeVisible();

    await page.getByRole('button',{name:'Bible',exact:true}).click();
    await page.getByRole('button',{name:'Romans',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Romans',exact:true})).toBeVisible();

    await page.getByRole('button',{name:'Topics',exact:true}).click();
    await page.getByRole('button',{name:/Sexuality & Christian Ethics/}).click();
    await expect(page.getByRole('heading',{name:'Sexuality & Christian Ethics'})).toBeVisible();

    await page.getByRole('button',{name:'Theologian',exact:true}).click();
    await page.getByLabel('Ask the Theologian').fill('What does Romans 1 say about same-sex relationships?');
    await page.getByRole('button',{name:'Ask',exact:true}).click();
    await expect(page.getByText(/Romans 1:26–27 appears inside Paul’s larger argument/)).toBeVisible();
    await expect(page.getByText('Evidence used')).toBeVisible();
  });
});