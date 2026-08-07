import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');
const mobileCss = css.slice(
  css.indexOf('@media (max-width: 767px)'),
  css.indexOf('@media (prefers-reduced-motion: reduce)'),
);

describe('post card cover sizing', () => {
  it('overrides intrinsic HTML height on desktop and mobile', () => {
    expect(css).toMatch(/\.post-card img\s*\{[^}]*height:\s*100%/s);
    expect(mobileCss).toMatch(/\.post-card img\s*\{[^}]*height:\s*auto[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  });

  it('falls back to a single column when the cover fails', () => {
    expect(css).toContain('.post-card.has-cover:not(.cover-failed) .post-card-link');
  });
});
