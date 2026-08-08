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
    expect(css).toMatch(/\.post-header, \.post-grid\s*\{[^}]*width:\s*min\(1080px,\s*calc\(100% - 48px\)\)/s);
    expect(css).toMatch(/\.reading-card\s*\{[^}]*padding:\s*clamp\(20px,\s*3vw,\s*36px\)/s);
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

  it('keeps short tables content-sized while constraining wide tables', () => {
    expect(css).toMatch(/\.prose table\s*\{[^}]*width:\s*max-content[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto/s);
    expect(css).not.toContain('.prose table { display: block; width: 100%;');
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

describe('article utility styling', () => {
  it('removes the header underline-like shadow on every viewport', () => {
    expect(css).toMatch(/\.nav-shell\s*\{[^}]*box-shadow:\s*none/s);
    expect(mobileCss).toMatch(/\.nav-shell\s*\{[^}]*box-shadow:\s*none/s);
  });

  it('renders source tabs at two spaces in code blocks', () => {
    expect(css).toMatch(/\.prose pre\s*\{[^}]*tab-size:\s*2/s);
  });

  it('styles accessible image zoom and back-to-top controls', () => {
    expect(css).toMatch(/\.prose img\s*\{[^}]*cursor:\s*zoom-in/s);
    expect(css).toMatch(/\.image-lightbox\s*\{[^}]*max-height:\s*calc\(100dvh - 32px\)/s);
    expect(css).toMatch(/\.back-to-top\s*\{[^}]*position:\s*fixed[^}]*min-width:\s*52px[^}]*min-height:\s*52px/s);
    expect(css).toMatch(/\.back-to-top svg\s*\{[^}]*width:\s*24px[^}]*height:\s*24px[^}]*stroke-width:\s*2\.5/s);
    expect(css).toMatch(/\.back-to-top\s*\{[^}]*visibility:\s*hidden/s);
    expect(css).toMatch(/\.back-to-top\[data-visible\]\s*\{[^}]*visibility:\s*visible[^}]*opacity:\s*1/s);
  });
});
