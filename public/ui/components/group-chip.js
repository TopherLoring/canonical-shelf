// GroupChip Component (Reading Room design system)
// 8px square color swatch + 6px radius chip for the 9 Bible groups.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const BIBLE_GROUPS = {
  law: { id: 'law', label: 'Law', shortLabel: 'Law' },
  othist: { id: 'othist', label: 'Old Testament History', shortLabel: 'OT History' },
  wisdom: { id: 'wisdom', label: 'Wisdom and Poetry', shortLabel: 'Wisdom' },
  major: { id: 'major', label: 'Major Prophets', shortLabel: 'Major' },
  minor: { id: 'minor', label: 'Minor Prophets', shortLabel: 'Minor' },
  gospel: { id: 'gospel', label: 'Gospels and Acts', shortLabel: 'Gospels' },
  paul: { id: 'paul', label: 'Pauline Epistles', shortLabel: 'Paul' },
  general: { id: 'general', label: 'General Epistles', shortLabel: 'General' },
  apoc: { id: 'apoc', label: 'Revelation & Apocalyptic', shortLabel: 'Apocalypse' }
};

export function renderGroupChip({
  group = 'law',
  label = '',
  short = false,
  className = ''
} = {}) {
  const groupMeta = BIBLE_GROUPS[group] || { id: group, label: group, shortLabel: group };
  const effectiveLabel = label || (short ? groupMeta.shortLabel : groupMeta.label);

  return `
  <span class="ui-group-chip ${esc(className)}" data-group="${esc(group)}">
    <span class="ui-group-chip-swatch" aria-hidden="true"></span>
    <span class="ui-group-chip-label">${esc(effectiveLabel)}</span>
  </span>`;
}

