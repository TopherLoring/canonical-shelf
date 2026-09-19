import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openGolden(page){
  await page.goto('/course?unit=unit.start&lesson=begin');
  await expect(page.locator('.golden-lesson')).toBeVisible();
}

async function noSeriousA11y(page){
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(result.violations.filter(item=>['serious','critical'].includes(item.impact))).toEqual([]);
}

test('golden lesson uses a finite living-folio scene flow',async({page})=>{
  await openGolden(page);
  await expect(page.locator('[data-gs-scene]')).toHaveCount(11);
  await expect(page.locator('[data-gs-scene]:not([hidden])')).toHaveAttribute('data-gs-role','Orient');
  await expect(page.locator('[data-gs-scene-target][aria-current="step"]')).toHaveCount(1);
  await page.getByRole('button',{name:'Next →'}).click();
  await expect(page.locator('[data-gs-scene]:not([hidden])')).toHaveAttribute('data-gs-role','Read');
  await expect(page.getByRole('link',{name:/Open in Bible/i})).toHaveAttribute('href',/\/bible\?book=46&chapter=15/);
  await noSeriousA11y(page);
});

test('golden sequence interaction supports explicit non-drag reordering',async({page})=>{
  await openGolden(page);
  await page.locator('[data-gs-scene-target="5"]').click();
  const form=page.locator('.gs-sequence');
  await expect(form).toBeVisible();
  const third=form.locator('[data-gs-seq-value="2"]');
  await third.getByRole('button',{name:/earlier/i}).click();
  await third.getByRole('button',{name:/earlier/i}).click();
  await expect(form.locator('input[name="p0"]')).toHaveValue('2');
  await expect(form.locator('.gs-sequence-item').first()).toContainText('Christ died for sins');
});

test('golden match and evidence-map interactions expose visible relationships',async({page})=>{
  await openGolden(page);
  await page.locator('[data-gs-scene-target="6"]').click();
  const match=page.locator('.gs-match');
  await expect(match).toBeVisible();
  const firstMatchOption=match.locator('[data-gs-pair-row="0"] [data-gs-pick]').first();
  await firstMatchOption.click();
  await expect(firstMatchOption).toHaveAttribute('aria-pressed','true');
  await expect(match.locator('[data-gs-pair-row="0"] [data-gs-selection]')).not.toContainText('No relationship selected');

  await page.locator('[data-gs-scene-target="7"]').click();
  const argument=page.locator('.gs-argument');
  await expect(argument).toBeVisible();
  await expect(argument.locator('[data-gs-pair-row]')).toHaveCount(3);
  const firstTarget=argument.locator('[data-gs-pair-row="0"] [data-gs-pick]').first();
  await firstTarget.click();
  await expect(firstTarget).toHaveAttribute('aria-pressed','true');
});

test('golden slice recomposes to a single-scene phone experience',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await openGolden(page);
  await expect(page.locator('.gs-scene-rail')).toBeVisible();
  await expect(page.locator('[data-gs-scene]:not([hidden])')).toHaveCount(1);
  await expect(page.getByRole('button',{name:'Next →'})).toBeVisible();
  await noSeriousA11y(page);
});
