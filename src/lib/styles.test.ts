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

describe('compact article typography', () => {
  it('uses the balanced reading rhythm', () => {
    expect(css).toMatch(/\.reading-card\s*\{[^}]*padding:\s*clamp\(22px,\s*4vw,\s*44px\)/s);
    expect(css).toMatch(/\.prose\s*\{[^}]*line-height:\s*1\.72/s);
    expect(css).toMatch(/\.prose h2\s*\{[^}]*margin:\s*1\.45em 0 \.5em/s);
    expect(css).toMatch(/\.prose h3\s*\{[^}]*margin:\s*1\.3em 0 \.45em/s);
    expect(css).toMatch(/\.prose h4\s*\{[^}]*margin:\s*1\.15em 0 \.4em[^}]*font-size:\s*1\.08rem/s);
    expect(css).toMatch(/\.prose p\s*\{[^}]*margin:\s*\.8em 0/s);
    expect(css).toMatch(/\.prose ul, \.prose ol\s*\{[^}]*margin:\s*\.8em 0[^}]*padding-left:\s*1\.5em/s);
    expect(css).toMatch(/\.prose li \+ li\s*\{[^}]*margin-top:\s*\.25em/s);
    expect(css).toMatch(/\.prose li > :is\(ul, ol\)\s*\{[^}]*margin:\s*\.45em 0/s);
  });

  it('uses compact content-block spacing', () => {
    for (const selector of ['img', 'pre', 'table', 'blockquote']) {
      expect(css).toMatch(new RegExp(`\\.prose ${selector}\\s*\\{[^}]*margin:\\s*1\\.4rem 0`, 's'));
    }
  });

  it('compacts the desktop table of contents but preserves mobile targets', () => {
    expect(css).toMatch(/\.toc-desktop\s*\{[^}]*padding:\s*16px/s);
    expect(css).toMatch(/\.toc ol\s*\{[^}]*margin:\s*8px 0 0/s);
    expect(css).toMatch(/\.toc li\s*\{[^}]*margin:\s*2px 0/s);
    expect(css).toMatch(/\.toc li\.nested\s*\{[^}]*padding-left:\s*10px/s);
    expect(css).toMatch(/\.toc a\s*\{[^}]*min-height:\s*30px[^}]*line-height:\s*1\.3/s);
    expect(mobileCss).toMatch(/\.toc-mobile a\s*\{[^}]*min-height:\s*44px/s);
  });
});
