// GroupChip Component (Reading Room design system)
// 8px square color swatch + 6px radius chip for the 9 Bible groups.

import { GROUP_NAMES } from '../labels.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const BIBLE_GROUPS = {
  law: { id: 'law', label: GROUP_NAMES.law, shortLabel: 'Law' },
  othist: { id: 'othist', label: GROUP_NAMES.othist, shortLabel: 'History' },
  wisdom: { id: 'wisdom', label: GROUP_NAMES.wisdom, shortLabel: 'Wisdom' },
  major: { id: 'major', label: GROUP_NAMES.major, shortLabel: 'Major' },
  minor: { id: 'minor', label: GROUP_NAMES.minor, shortLabel: 'Minor' },
  gospel: { id: 'gospel', label: GROUP_NAMES.gospel, shortLabel: 'Gospels' },
  paul: { id: 'paul', label: GROUP_NAMES.paul, shortLabel: 'Paul' },
  general: { id: 'general', label: GROUP_NAMES.general, shortLabel: 'General' },
  apoc: { id: 'apoc', label: GROUP_NAMES.apoc, shortLabel: 'Revelation' }
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

