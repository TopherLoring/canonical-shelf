// scripts/fix-profile-themes.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const repoRoot = process.cwd();
console.log('\n=== Fixing Profile Theme Application & Cache Invalidation ===\n');

// 1. Invalidate Service Worker cache
const swPath = resolve(repoRoot, 'public/sw.js');
if (existsSync(swPath)) {
  let sw = readFileSync(swPath, 'utf8');
  const newRelease = `v8-eight-themes-${new Date().toISOString().slice(0, 10)}-a`;
  sw = sw.replace(/const RELEASE='[^']+';/, `const RELEASE='${newRelease}';`);
  writeFileSync(swPath, sw, 'utf8');
  console.log(`[1/4] Bumped Service Worker release to ${newRelease}`);
}

// 2. Add swatches to public/profile.js theme cards
const profileJsPath = resolve(repoRoot, 'public/profile.js');
if (existsSync(profileJsPath)) {
  let profileJs = readFileSync(profileJsPath, 'utf8');
  if (!profileJs.includes('theme-card__swatch')) {
    profileJs = profileJs.replace(
      '<div class="profile-theme-grid" role="list">${THEMES.map(t => `<button class="theme-card ${t.id === theme ? \'is-selected\' : \'\'}" type="button" role="listitem" data-theme-option="${esc(t.id)}" aria-pressed="${t.id === theme}"><strong>${esc(t.name)}</strong><span>${esc(t.summary || \'\')}</span></button>`).join(\'\')}</div>',
      '<div class="profile-theme-grid" role="list">${THEMES.map(t => `<button class="theme-card ${t.id === theme ? \'is-selected\' : \'\'}" type="button" role="listitem" data-theme-option="${esc(t.id)}" aria-pressed="${t.id === theme}"><span class="theme-card__swatch" data-swatch="${esc(t.id)}" aria-hidden="true"><i></i><i></i><i></i></span><strong>${esc(t.name)}</strong><span>${esc(t.summary || \'\')}</span></button>`).join(\'\')}</div>'
    );
    writeFileSync(profileJsPath, profileJs, 'utf8');
    console.log('[2/4] Added visual swatches to theme cards in public/profile.js');
  } else {
    console.log('[2/4] public/profile.js already contains theme swatches');
  }
}

// 3. Add 8-theme swatch styling and grid layout to public/canonical-shelf.css
const cssPath = resolve(repoRoot, 'public/canonical-shelf.css');
if (existsSync(cssPath)) {
  let css = readFileSync(cssPath, 'utf8');
  const swatchBlock = `
/* 8-Theme Profile Swatches (CSP-compliant, light and dark) */
.profile-theme-grid .theme-card{display:grid;grid-template-columns:3.6rem 1fr;grid-template-rows:auto auto;column-gap:.85rem;align-items:start;text-align:left;padding:12px;border:1px solid var(--color-border);border-radius:var(--radius-large,12px);background:var(--color-surface);color:var(--color-text);cursor:pointer;transition:border-color .15s ease}
.profile-theme-grid .theme-card .theme-card__swatch{grid-row:1/3;display:grid;grid-template-columns:repeat(3,1fr);height:2.8rem;border-radius:7px;overflow:hidden;border:1px solid var(--color-border)}
.profile-theme-grid .theme-card.is-selected{border:2px solid var(--color-action);box-shadow:0 0 0 1px var(--color-action)}

.theme-card__swatch[data-swatch="paper"] i:nth-child(1){background:#F4EFE6}
.theme-card__swatch[data-swatch="paper"] i:nth-child(2){background:#2B2927}
.theme-card__swatch[data-swatch="paper"] i:nth-child(3){background:#756354}

.theme-card__swatch[data-swatch="library"] i:nth-child(1){background:#F5EFEB}
.theme-card__swatch[data-swatch="library"] i:nth-child(2){background:#2B1D14}
.theme-card__swatch[data-swatch="library"] i:nth-child(3){background:#825E2A}

.theme-card__swatch[data-swatch="collegiate"] i:nth-child(1){background:#F4F5F8}
.theme-card__swatch[data-swatch="collegiate"] i:nth-child(2){background:#0A192F}
.theme-card__swatch[data-swatch="collegiate"] i:nth-child(3){background:#8B1E2D}

.theme-card__swatch[data-swatch="stained-glass"] i:nth-child(1){background:#EBF1F5}
.theme-card__swatch[data-swatch="stained-glass"] i:nth-child(2){background:#121A24}
.theme-card__swatch[data-swatch="stained-glass"] i:nth-child(3){background:#0066CC}

.theme-card__swatch[data-swatch="fun"] i:nth-child(1){background:#FFFEEA}
.theme-card__swatch[data-swatch="fun"] i:nth-child(2){background:#1E1B18}
.theme-card__swatch[data-swatch="fun"] i:nth-child(3){background:#E02050}

.theme-card__swatch[data-swatch="watercolor"] i:nth-child(1){background:#FCFAF6}
.theme-card__swatch[data-swatch="watercolor"] i:nth-child(2){background:#324147}
.theme-card__swatch[data-swatch="watercolor"] i:nth-child(3){background:#48758C}

.theme-card__swatch[data-swatch="illustrated"] i:nth-child(1){background:#F6F3EC}
.theme-card__swatch[data-swatch="illustrated"] i:nth-child(2){background:#212121}
.theme-card__swatch[data-swatch="illustrated"] i:nth-child(3){background:#2B2B2B}

.theme-card__swatch[data-swatch="midnight-study"] i:nth-child(1){background:#EAEEF5}
.theme-card__swatch[data-swatch="midnight-study"] i:nth-child(2){background:#121A28}
.theme-card__swatch[data-swatch="midnight-study"] i:nth-child(3){background:#2563EB}

html[data-mode="dark"] .theme-card__swatch[data-swatch="paper"] i:nth-child(1){background:#161514}
html[data-mode="dark"] .theme-card__swatch[data-swatch="paper"] i:nth-child(2){background:#ECE5DA}
html[data-mode="dark"] .theme-card__swatch[data-swatch="paper"] i:nth-child(3){background:#D8CBB5}

html[data-mode="dark"] .theme-card__swatch[data-swatch="library"] i:nth-child(1){background:#120C08}
html[data-mode="dark"] .theme-card__swatch[data-swatch="library"] i:nth-child(2){background:#E6D8BA}
html[data-mode="dark"] .theme-card__swatch[data-swatch="library"] i:nth-child(3){background:#C5A059}

html[data-mode="dark"] .theme-card__swatch[data-swatch="collegiate"] i:nth-child(1){background:#070E1A}
html[data-mode="dark"] .theme-card__swatch[data-swatch="collegiate"] i:nth-child(2){background:#F0F4FC}
html[data-mode="dark"] .theme-card__swatch[data-swatch="collegiate"] i:nth-child(3){background:#C93248}

html[data-mode="dark"] .theme-card__swatch[data-swatch="stained-glass"] i:nth-child(1){background:#050608}
html[data-mode="dark"] .theme-card__swatch[data-swatch="stained-glass"] i:nth-child(2){background:#F0F4FC}
html[data-mode="dark"] .theme-card__swatch[data-swatch="stained-glass"] i:nth-child(3){background:#3B7DFF}

html[data-mode="dark"] .theme-card__swatch[data-swatch="fun"] i:nth-child(1){background:#1B1424}
html[data-mode="dark"] .theme-card__swatch[data-swatch="fun"] i:nth-child(2){background:#FFF9F2}
html[data-mode="dark"] .theme-card__swatch[data-swatch="fun"] i:nth-child(3){background:#FF5B89}

html[data-mode="dark"] .theme-card__swatch[data-swatch="watercolor"] i:nth-child(1){background:#121820}
html[data-mode="dark"] .theme-card__swatch[data-swatch="watercolor"] i:nth-child(2){background:#E2ECF0}
html[data-mode="dark"] .theme-card__swatch[data-swatch="watercolor"] i:nth-child(3){background:#8FB4C4}

html[data-mode="dark"] .theme-card__swatch[data-swatch="illustrated"] i:nth-child(1){background:#1A1A1A}
html[data-mode="dark"] .theme-card__swatch[data-swatch="illustrated"] i:nth-child(2){background:#EDEDED}
html[data-mode="dark"] .theme-card__swatch[data-swatch="illustrated"] i:nth-child(3){background:#EDEDED}

html[data-mode="dark"] .theme-card__swatch[data-swatch="midnight-study"] i:nth-child(1){background:#0A0E17}
html[data-mode="dark"] .theme-card__swatch[data-swatch="midnight-study"] i:nth-child(2){background:#DCE3F0}
html[data-mode="dark"] .theme-card__swatch[data-swatch="midnight-study"] i:nth-child(3){background:#4A90E2}
`;

  if (!css.includes('8-Theme Profile Swatches')) {
    css += `\n${swatchBlock}\n`;
    writeFileSync(cssPath, css, 'utf8');
    console.log('[3/4] Appended 8-theme swatch styles to public/canonical-shelf.css
    console.log('[3/4] Appended 8-theme swatch styles to public/canonical-shelf.css');
  } else {
    console.log('[3/4] Swatch styles already present in public/canonical-shelf.css');
  }
}

// 4. Re-sync ROA and verify
console.log('[4/4] Synchronizing ROA tokens and running verification...');
execSync('bun run verify', { stdio: 'inherit' });
console.log('\n[SUCCESS] Verification passed.');
