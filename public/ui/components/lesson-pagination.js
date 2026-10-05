/**
 * Fit authored lesson DOM into measured parts. Form controls are moved neither
 * between forms nor into clones: hidden parts remain successful form controls.
 * Screen CSS owns the viewport size and must honour the native hidden attribute.
 */
export function createLessonPagination({viewport, content, onChange = () => {}}) {
  if (!viewport || !content) throw new TypeError('A lesson viewport and content are required.');
  const doc = content.ownerDocument, win = doc.defaultView;
  const hidden = new Map(), replacements = [], offsets = new WeakMap();
  const contexts = new Map();
  let units = [], containers = new Set(), pages = [[]], index = 0;
  let disposed = false, frame = 0, measuring = false, overflow = false;
  const remember = node => { if (!hidden.has(node)) hidden.set(node, node.hidden); };
  const setHidden = (node, value) => { remember(node); node.hidden = value; };
  const state = () => ({part: index + 1, parts: pages.length, hasPrevious: index > 0,
    hasNext: index < pages.length - 1, overflow});
  function show(selected) {
    const visible = new Set(selected);
    for (const unit of units) setHidden(unit, !visible.has(unit));
    // Keep original form, list and fieldset ancestors in place. This also keeps
    // board event delegation and radio-group / native form relationships intact.
    for (const parent of containers) setHidden(parent, !selected.some(node => parent.contains(node)));
    // A continued answer group retains its authored question in the SAME DOM
    // node. Measure this context on every part, rather than hiding its legend
    // and presenting identical choices with no question or accessible group.
    for (const [owner, nodes] of contexts) {
      const active = selected.some(node => owner === node || owner.contains(node));
      for (const node of nodes) setHidden(node, !active);
    }
    viewport.scrollTop = 0;
  }
  function fits() {
    const bounds = viewport.getBoundingClientRect();
    return viewport.scrollHeight <= viewport.clientHeight + 1 &&
      content.getBoundingClientRect().bottom <= bounds.bottom + 1 &&
      viewport.scrollWidth <= viewport.clientWidth + 1;
  }
  function restore() {
    for (const [node, value] of hidden) node.hidden = value;
    hidden.clear();
    for (const {original, fragments} of replacements) {
      const first = fragments.find(node => node.parentNode);
      if (first) first.before(original);
      for (const fragment of fragments) fragment.remove();
    }
    replacements.length = 0;
    containers.clear();
    contexts.clear();
  }
  function textSlice(node, start, end) {
    const walker = doc.createTreeWalker(node, win.NodeFilter.SHOW_TEXT);
    const range = doc.createRange();
    let position = 0, text;
    while ((text = walker.nextNode())) {
      const next = position + text.length;
      if (start >= position && start < next) range.setStart(text, start - position);
      if (end > position && end <= next) { range.setEnd(text, end - position); break; }
      position = next;
    }
    return range.cloneContents();
  }
  function proseParts(node) {
    // Interactive nodes are never cloned. A paragraph's inline emphasis and
    // links retain their exact text and markup in each continuation.
    const text = node.textContent;
    if (!text || node.matches('button, input, select, textarea, label, summary, legend') ||
      node.querySelector('input, select, textarea, button, img, svg, video, canvas')) return null;
    if (!node.matches('p, h1, h2, h3, h4, h5, h6, blockquote, li, dd, dt, figcaption')) return null;
    const fragments = [], originalIndex = units.indexOf(node), fragmentIds = new Set();
    let start = 0;
    while (start < text.length) {
      const fragment = node.cloneNode(false);
      if (fragments.length) fragment.removeAttribute('id');
      fragment.classList.add('lesson-page-fragment');
      node.before(fragment);
      units.splice(originalIndex + fragments.length, 0, fragment);
      let low = start + 1, high = text.length, best = start;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        fragment.replaceChildren(textSlice(node, start, middle));
        show([fragment]);
        if (fits()) { best = middle; low = middle + 1; } else high = middle - 1;
      }
      if (best === start) best = start + 1;
      // Prefer a word boundary, preserving every separator exactly. A long
      // unbroken token still makes progress one measured segment at a time.
      const boundary = text.slice(start, best).search(/\s+\S*$/u);
      if (best < text.length && boundary > 0) best = start + boundary + 1;
      fragment.replaceChildren(textSlice(node, start, best));
      for (const descendant of fragment.querySelectorAll('[id]')) {
        if (fragmentIds.has(descendant.id)) descendant.removeAttribute('id');
        else fragmentIds.add(descendant.id);
      }
      fragments.push(fragment);
      offsets.set(fragment, {original: node, start, end: best});
      start = best;
    }
    units.splice(units.indexOf(node), 1);
    node.remove();
    replacements.push({original: node, fragments});
    return fragments;
  }
  function subdivide(node) {
    const prose = proseParts(node);
    if (prose) return true;
    // A label/card with a control is an accessible atomic choice. Other authored
    // structural containers can show their children on successive parts.
    if (node.matches('label, button, select, textarea, input, summary, legend')) return false;
    const authoredChildren = [...node.children].filter(child => !child.hidden && !child.matches('input[type="hidden"]'));
    const context = authoredChildren.filter(child =>
      (node.matches('fieldset') && child.matches('legend')) ||
      (node.matches('form') && child.matches('.challenge-prompt')));
    const children = authoredChildren.filter(child => !context.includes(child));
    if (!children.length) return false;
    const directText = [...node.childNodes].some(child => child.nodeType === 3 && child.textContent.trim());
    if (directText) return false;
    if (context.length) contexts.set(node, context);
    containers.add(node);
    units.splice(units.indexOf(node), 1, ...children);
    return true;
  }
  function reflow() {
    if (disposed || measuring) return state();
    measuring = true;
    const anchor = pages[index]?.[0];
    const anchorOffset = offsets.get(anchor);
    const originalAnchor = anchorOffset?.original || anchor;
    const active = doc.activeElement;
    restore();
    units = [...content.children].filter(node => !node.hidden);
    for (let cursor = 0; cursor < units.length;) {
      const node = units[cursor];
      show([node]);
      if (!fits() && subdivide(node)) continue;
      cursor++;
    }
    pages = []; overflow = false;
    let page = [];
    for (const node of units) {
      show([...page, node]);
      if (page.length && !fits()) { pages.push(page); page = []; show([node]); }
      if (!fits()) overflow = true;
      page.push(node);
    }
    if (page.length || !pages.length) pages.push(page);
    const replacement = replacements.find(entry => entry.original === originalAnchor);
    const anchorNode = replacement?.fragments.find(node => {
      const position = offsets.get(node);
      return position.start <= (anchorOffset?.start || 0) && position.end > (anchorOffset?.start || 0);
    }) || originalAnchor;
    const activeIndex = pages.findIndex(part => part.some(node => node.contains(active)));
    const nextIndex = activeIndex >= 0 ? activeIndex : pages.findIndex(part => part.some(node => node === anchorNode || node.contains(anchorNode)));
    index = nextIndex < 0 ? Math.min(index, pages.length - 1) : nextIndex;
    show(pages[index]);
    measuring = false;
    onChange(state());
    return state();
  }
  function schedule() {
    if (!disposed && !frame) frame = win.requestAnimationFrame(() => { frame = 0; reflow(); });
  }
  function goTo(partIndex) {
    index = Math.max(0, Math.min(pages.length - 1, partIndex));
    show(pages[index]); onChange(state());
    return state();
  }
  function reveal(node) {
    const part = pages.findIndex(page => page.some(unit => unit === node || unit.contains(node)));
    if (part >= 0) goTo(part);
  }
  // Capture occurs before native validity UI tries to focus a hidden required
  // field. Multiple invalid fields reveal the first only, matching form order.
  let invalidPending = false;
  function invalid(event) {
    // Native validation still blocks submission for every invalid field. Only
    // the first gets its validation bubble now; later fields become reachable
    // through navigation or the next submission attempt.
    if (invalidPending) { event.preventDefault(); return; }
    invalidPending = true; reveal(event.target);
    win.queueMicrotask(() => { invalidPending = false; });
  }
  const observer = new win.ResizeObserver(schedule);
  observer.observe(viewport);
  win.addEventListener('resize', schedule);
  win.visualViewport?.addEventListener('resize', schedule);
  doc.fonts?.addEventListener('loadingdone', schedule);
  doc.fonts?.ready.then(schedule);
  doc.addEventListener('canonical-theme-changed', schedule);
  doc.addEventListener('canonical-mode-changed', schedule);
  content.addEventListener('invalid', invalid, true);
  content.addEventListener('input', schedule);
  content.addEventListener('change', schedule);
  content.addEventListener('toggle', schedule, true);
  content.addEventListener('load', schedule, true);
  reflow();
  return {get state() { return state(); }, reflow, goTo, reveal,
    next: () => goTo(index + 1), previous: () => goTo(index - 1),
    destroy() {
      disposed = true; observer.disconnect(); win.cancelAnimationFrame(frame);
      win.removeEventListener('resize', schedule);
      win.visualViewport?.removeEventListener('resize', schedule);
      doc.fonts?.removeEventListener('loadingdone', schedule);
      doc.removeEventListener('canonical-theme-changed', schedule);
      doc.removeEventListener('canonical-mode-changed', schedule);
      content.removeEventListener('invalid', invalid, true);
      content.removeEventListener('input', schedule);
      content.removeEventListener('change', schedule);
      content.removeEventListener('toggle', schedule, true);
      content.removeEventListener('load', schedule, true);
      restore();
    }};
}
