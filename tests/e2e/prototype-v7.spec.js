import {test,expect} from '@playwright/test';

test.describe('v7 Living Folio composition lab',()=>{
  test.beforeEach(async({page})=>{
    await page.goto('/prototypes/v7/composition-lab.html',{waitUntil:'domcontentloaded'});
    await expect(page.getByText('Canonical Shelf',{exact:true}).first()).toBeVisible();
    await expect(page.getByText('Living Folio Composition Lab',{exact:true})).toBeVisible();
  });

  test('all seven surfaces expose three materially separate composition previews',async({page})=>{
    const nav=page.getByRole('navigation',{name:'Prototype surfaces'});
    for(const surface of ['Home','Learn','Lesson','Bible','Practice','Topics','Theologian']){
      await nav.getByRole('button',{name:surface,exact:true}).click();
      for(const variant of ['1','2','3']){
        await page.locator('#variant-switch').getByRole('button',{name:variant,exact:true}).click();
        await expect(page.locator('#stage')).not.toBeEmpty();
        await expect(page.locator('#variant-name')).toContainText(`${variant}.`);
      }
    }
  });

  test('surface choices can be mixed and recorded in the selection summary',async({page})=>{
    const nav=page.getByRole('navigation',{name:'Prototype surfaces'});
    await nav.getByRole('button',{name:'Home',exact:true}).click();
    await page.locator('#variant-switch').getByRole('button',{name:'3',exact:true}).click();
    await page.getByRole('button',{name:'Choose this composition'}).click();

    await nav.getByRole('button',{name:'Bible',exact:true}).click();
    await page.locator('#variant-switch').getByRole('button',{name:'2',exact:true}).click();
    await page.getByRole('button',{name:'Choose this composition'}).click();

    await page.getByRole('button',{name:'Selection summary'}).click();
    await expect(page.getByText('3. Library Overview',{exact:true})).toBeVisible();
    await expect(page.getByText('2. Shelf + Book Desk',{exact:true})).toBeVisible();
    await expect(page.getByText('1. Living Folio — selected baseline',{exact:true})).toBeVisible();
  });

  test('lesson, practice, Bible, Topics, and Theologian interactions work',async({page})=>{
    const nav=page.getByRole('navigation',{name:'Prototype surfaces'});

    await nav.getByRole('button',{name:'Lesson',exact:true}).click();
    await expect(page.getByRole('heading',{name:'What exactly does Paul say happened?'})).toBeVisible();
    await page.getByRole('button',{name:/Continue to explanation/}).click();
    await expect(page.locator('.dots-rail button.current')).toHaveCount(1);

    await nav.getByRole('button',{name:'Practice',exact:true}).click();
    await page.getByRole('button',{name:/The passage proves one complete theory of atonement/}).click();
    await page.getByRole('button',{name:'Check reasoning'}).click();
    await expect(page.locator('.feedback')).toContainText('Correct');

    await nav.getByRole('button',{name:'Bible',exact:true}).click();
    await page.getByRole('button',{name:'Romans',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Romans',exact:true})).toBeVisible();

    await nav.getByRole('button',{name:'Topics',exact:true}).click();
    await page.getByRole('button',{name:/Sexuality & Ethics/}).click();
    await expect(page.getByRole('heading',{name:'Sexuality & Ethics'})).toBeVisible();

    await nav.getByRole('button',{name:'Theologian',exact:true}).click();
    await page.getByPlaceholder(/Ask about Scripture/).fill('What does Romans 1 mean?');
    await page.getByRole('button',{name:'Ask',exact:true}).click();
    await expect(page.getByText(/Romans 1:26–27 belongs to Paul’s larger argument/)).toBeVisible();
    await expect(page.getByText('Evidence & limits',{exact:true})).toBeVisible();
  });
});
