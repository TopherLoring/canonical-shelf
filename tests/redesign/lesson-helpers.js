// Shared by the lesson specs. The step flows in the window frame, so the part that scrolls is the lesson card on a wide
// screen and the article area (above the Back/Continue bar) on the phone. These helpers find it and measure it.
export const scrollArea = () => [...document.querySelectorAll('.cs-lesson__scroll, .cs-lesson-card')]
  .find(el => /auto|scroll/.test(getComputedStyle(el).overflowY) && el.offsetParent !== null);

/** How many pixels the lesson's scroll area has beyond what it shows (0 means the whole step is visible). */
export const overflowOf = page => page.evaluate(() => {
  const area = [...document.querySelectorAll('.cs-lesson__scroll, .cs-lesson-card')].find(el => /auto|scroll/.test(getComputedStyle(el).overflowY) && el.offsetParent !== null);
  return area ? area.scrollHeight - area.clientHeight : 0;
});
