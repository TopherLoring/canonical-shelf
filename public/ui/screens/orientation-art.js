// Hand-drawn sketches for the Orientation lesson (S11). Each one is a small picture drawn inside the lesson card, with
// marker-style arrows that point at parts of that same picture (never at something outside the card). Lines are
// deterministically wobbled so they look drawn by hand but are identical on every load. Colors come from theme roles
// through classes (lesson.css), so there are no inline styles; every picture is decorative (aria-hidden), because the
// card's text says the same thing.
const W = 300;

function makePen(seed) {
  let s = seed;
  const r = () => { s = (s * 16807) % 2147483647; return (s / 2147483647 - 0.5) * 2; };
  const n = value => Math.round(value * 10) / 10;
  const seg = (x1, y1, x2, y2) => `Q${n((x1 + x2) / 2 + r() * 1.4)} ${n((y1 + y2) / 2 + r() * 1.4)} ${n(x2 + r() * 0.8)} ${n(y2 + r() * 0.8)}`;
  const path = (d, cls) => `<path class="${cls}" d="${d}"/>`;
  return {
    line: (x1, y1, x2, y2, cls = 'sk') => path(`M${n(x1)} ${n(y1)} ${seg(x1, y1, x2, y2)}`, cls),
    rect: (x, y, w, h, cls = 'sk') => path(`M${x} ${y} ${seg(x, y, x + w, y)} ${seg(x + w, y, x + w, y + h)} ${seg(x + w, y + h, x, y + h)} ${seg(x, y + h, x, y)}`, cls),
    // A curved marker arrow from (x1,y1) to (x2,y2) with an open arrowhead.
    arrow: (x1, y1, x2, y2, bend = 10) => {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      const cx = mx - (dy / len) * bend, cy = my + (dx / len) * bend;
      const a = Math.atan2(y2 - cy, x2 - cx), head = 6.5;
      const h1 = [x2 - head * Math.cos(a - 0.5), y2 - head * Math.sin(a - 0.5)], h2 = [x2 - head * Math.cos(a + 0.5), y2 - head * Math.sin(a + 0.5)];
      return path(`M${n(x1)} ${n(y1)} Q${n(cx)} ${n(cy)} ${n(x2)} ${n(y2)} M${n(h1[0])} ${n(h1[1])} L${n(x2)} ${n(y2)} L${n(h2[0])} ${n(h2[1])}`, 'arrow');
    },
    squiggle: (x, y, w, cls = 'sk sk--soft') => {
      let d = `M${x} ${y}`; const steps = Math.max(2, Math.round(w / 9));
      for (let i = 1; i <= steps; i += 1) d += ` q${n(w / steps / 2)} ${n(r() * 2.2)} ${n(w / steps)} 0`;
      return path(d, cls);
    },
    path
  };
}

const text = (x, y, lines, cls = 'cap', anchor = 'middle') => {
  const list = Array.isArray(lines) ? lines : [lines];
  return `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${list.map((line, i) => `<tspan x="${x}" dy="${i ? 11 : 0}">${line}</tspan>`).join('')}</text>`;
};

const frame = (height, body, name) => `<svg class="orient-art" data-art="${name}" viewBox="0 0 ${W} ${height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${body}</svg>`;

const ART = {
  // The five places along the top, each with an arrow from its caption up to its tab.
  nav() {
    const p = makePen(11);
    const tabs = [['Shelf'], ['Learning', 'Path'], ['Bible'], ['Study', 'Topics'], ['Review &', 'Practice']];
    const xs = [30, 90, 150, 210, 270];
    const caps = [['your', 'books'], ['guided', 'lessons'], ['the', 'text'], ['look', 'things up'], ['keep it', 'fresh']];
    return frame(116, p.rect(6, 6, 288, 40, 'sk sk--fill') + tabs.map((t, i) => text(xs[i], t.length > 1 ? 23 : 29, t, 'cap cap--label')).join('') +
      xs.map((x, i) => p.arrow(x, 86, x, 52, i % 2 ? 4 : -4) + text(x, 100, caps[i], 'cap cap--note')).join(''), 'nav');
  },
  // The Theologian tab on the right edge of a page.
  theologian() {
    const p = makePen(23);
    return frame(126, p.rect(10, 6, 250, 84, 'sk sk--fill') + p.squiggle(26, 24, 150) + p.squiggle(26, 38, 190) + p.squiggle(26, 52, 120) + p.squiggle(26, 66, 170) +
      p.rect(262, 22, 28, 54, 'sk sk--ink') + `<text class="cap cap--invert cap--small" x="280" y="49" text-anchor="middle" transform="rotate(-90 280 49)">Theologian</text>` +
      p.arrow(150, 106, 262, 70, -10) + text(100, 104, ['ask about what', 'is in front of you'], 'cap cap--note'), 'theologian');
  },
  // The book name at the top of the reader is the book selector.
  reader() {
    const p = makePen(31);
    return frame(112, p.rect(10, 6, 280, 92, 'sk sk--fill') + p.rect(22, 14, 74, 24, 'sk sk--strong') + text(54, 31, 'John ▾', 'cap cap--label') +
      p.squiggle(26, 54, 230) + p.squiggle(26, 68, 200) + p.squiggle(26, 82, 220) +
      p.arrow(190, 24, 100, 26, 8) + text(236, 22, ['book name =', 'book selector'], 'cap cap--note'), 'reader');
  },
  // My Notes beside the text.
  notes() {
    const p = makePen(41);
    return frame(126, p.rect(10, 6, 160, 90, 'sk sk--fill') + p.squiggle(22, 24, 130) + p.squiggle(22, 38, 110) + p.squiggle(22, 52, 130) + p.squiggle(22, 66, 90) +
      p.rect(180, 6, 110, 90, 'sk sk--strong') + text(235, 22, 'My Notes', 'cap cap--label') + p.squiggle(192, 36, 84) + p.squiggle(192, 50, 70) + p.squiggle(192, 64, 80) +
      p.arrow(112, 112, 190, 90, -6) + text(70, 108, ['your thoughts, next', 'to the verse'], 'cap cap--note'), 'notes');
  },
  // A lesson: the progress bar, the step dots and All steps.
  lesson() {
    const p = makePen(53);
    const segs = [0, 1, 2, 3, 4, 5, 6].map(i => p.rect(20 + i * 24, 17, 20, 7, i < 3 ? 'sk sk--solid' : 'sk')).join('');
    return frame(118, p.rect(10, 6, 280, 62, 'sk sk--fill') + segs + p.rect(214, 12, 66, 18, 'sk sk--strong') + text(247, 25, 'All steps', 'cap cap--label') +
      p.squiggle(22, 46, 170) + p.squiggle(22, 58, 120) +
      p.arrow(60, 100, 60, 28, 8) + text(60, 112, 'where you are', 'cap cap--note') +
      p.arrow(238, 100, 246, 34, -8) + text(238, 112, 'every step', 'cap cap--note'), 'lesson');
  },
  // Lessons lead to a Checkpoint, and a module ends with a Capstone.
  checkpoint() {
    const p = makePen(67);
    return frame(100, p.rect(8, 14, 76, 40, 'sk sk--fill') + text(46, 38, 'Lessons', 'cap cap--label') +
      p.rect(112, 10, 82, 48, 'sk sk--strong') + text(153, 30, 'Checkpoint', 'cap cap--label') + text(153, 44, '✓', 'cap cap--label') +
      p.rect(222, 6, 72, 56, 'sk sk--strong sk--double') + text(258, 30, 'Capstone', 'cap cap--label') + text(258, 46, '★', 'cap cap--label') +
      p.arrow(88, 34, 108, 34, -3) + p.arrow(198, 34, 218, 34, -3) +
      text(153, 80, 'ends each unit', 'cap cap--note') + text(258, 80, 'ends each module', 'cap cap--note'), 'checkpoint');
  },
  // Three kinds of statement, kept apart.
  kinds() {
    const p = makePen(71);
    const box = (x, title, line, cls) => p.rect(x, 12, 90, 60, cls) + text(x + 45, 32, title, 'cap cap--label') + text(x + 45, 48, line, 'cap cap--note');
    return frame(88, box(6, 'Text', ['what the', 'page says'], 'sk sk--strong') + box(105, 'Context', ['when and', 'why'], 'sk sk--strong sk--dash') + box(204, 'Interpretation', ['what people', 'make of it'], 'sk sk--strong sk--dot'), 'kinds');
  },
  // The four separate facts in a book overview.
  facts() {
    const p = makePen(83);
    const items = [['Shelf', 'place'], ['Kind of', 'writing'], ['When it', 'happens'], ['When it', 'was written']];
    return frame(86, items.map((t, i) => p.rect(6 + i * 74, 12, 68, 52, 'sk sk--strong') + text(40 + i * 74, 34, t, 'cap cap--label')).join('') + text(150, 82, 'four separate facts, often different', 'cap cap--note'), 'facts');
  },
  // What the Theologian draws on: four sources, each with an arrow in.
  sources() {
    const p = makePen(97);
    const rows = ['Bible text', 'This site', 'Statement of Faith', 'Vetted sources'];
    return frame(116, rows.map((label, i) => p.rect(6, 6 + i * 27, 126, 21, 'sk sk--fill') + text(69, 20 + i * 27, label, 'cap cap--label') + p.arrow(136, 16 + i * 27, 188, 58, i < 2 ? -6 : 6)).join('') +
      p.rect(190, 32, 104, 52, 'sk sk--ink') + text(242, 63, 'Theologian', 'cap cap--invert'), 'sources');
  },
  // A scored check: a hint, not the answer; nothing private goes in.
  privacy() {
    const p = makePen(101);
    return frame(112, p.rect(14, 44, 40, 34, 'sk sk--strong') + p.path('M22 44 q0 -22 12 -22 q12 0 12 22', 'sk sk--strong') + p.path('M34 56 v10', 'sk sk--strong') +
      p.rect(78, 8, 214, 96, 'sk sk--fill') + p.squiggle(92, 24, 120) + [0, 1, 2].map(i => `<circle class="sk" cx="98" cy="${44 + i * 15}" r="4"/>` + p.squiggle(110, 45 + i * 15, 70 + i * 12)).join('') +
      p.rect(196, 60, 90, 38, 'sk sk--strong sk--dash') + text(241, 76, ['a hint,', 'not the answer'], 'cap cap--note') + p.arrow(196, 72, 160, 60, 6), 'privacy');
  },
  // The four modules in order, with the current one marked.
  modules(current) {
    const p = makePen(113 + current);
    const names = [['Reading the', 'Bible Well'], ['Hebrew', 'Scriptures'], ['Second Temple', '& Christ Event'], ['Systematic', 'Synthesis']];
    const xs = [6, 81, 156, 231];
    return frame(100, names.map((n, i) => p.rect(xs[i], 18, 64, 44, i + 1 === current ? 'sk sk--strong sk--fill sk--double' : 'sk') + text(xs[i] + 32, 36, n, i + 1 === current ? 'cap cap--label cap--small' : 'cap cap--note cap--small') +
      (i < 3 ? p.arrow(xs[i] + 66, 40, xs[i + 1] - 2, 40, -3) : '')).join('') +
      p.arrow(xs[current - 1] + 32, 92, xs[current - 1] + 32, 66, 4) + text(xs[current - 1] + 32, 98, current === 1 ? 'start here' : 'you are here', 'cap cap--label cap--small'), 'modules');
  },
  // Spaced review: memory fades fast alone, and each review lifts it and slows the fade.
  curve() {
    const p = makePen(127);
    return frame(112, p.line(24, 94, 24, 8) + p.line(24, 94, 292, 94) +
      p.path('M26 14 Q60 84 150 86', 'sk sk--dash') +
      p.path('M26 14 Q50 52 82 56 L82 22 Q120 46 160 50 L160 26 Q210 40 290 38', 'sk sk--strong') +
      p.arrow(104, 6, 84, 24, -6) + p.arrow(190, 6, 162, 28, -6) + text(148, 14, 'review', 'cap cap--label') +
      text(214, 80, 'without review', 'cap cap--note') + text(14, 104, 'time →', 'cap cap--note', 'start'), 'curve');
  },
  // Profile settings: theme and translation.
  profile() {
    const p = makePen(131);
    return frame(112, p.rect(10, 6, 190, 96, 'sk sk--fill') + text(105, 22, 'Profile', 'cap cap--label') +
      text(24, 44, 'Theme', 'cap cap--note', 'start') + [0, 1, 2].map(i => p.rect(78 + i * 36, 34, 28, 14, i === 0 ? 'sk sk--solid' : 'sk')).join('') +
      text(24, 72, 'Translation', 'cap cap--note', 'start') + p.rect(78, 61, 100, 17, 'sk sk--strong') + text(120, 73, 'BSB ▾', 'cap cap--label') +
      p.arrow(262, 40, 188, 42, 8) + text(262, 56, ['the look', 'of the site'], 'cap cap--note') +
      p.arrow(262, 92, 184, 72, -8) + text(262, 108, 'your Bible', 'cap cap--note'), 'profile');
  }
};

export function orientationArt(name) {
  const modules = /^modules-(\d)$/.exec(name);
  if (modules) return ART.modules(Number(modules[1]));
  return ART[name] ? ART[name]() : '';
}
