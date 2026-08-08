import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const baseLayout = readFileSync(new URL('../layouts/BaseLayout.astro', import.meta.url), 'utf8');
const postLayout = readFileSync(new URL('../layouts/PostLayout.astro', import.meta.url), 'utf8');
const backToTopUrl = new URL('../components/BackToTop.astro', import.meta.url);
const imageLightboxUrl = new URL('../components/ImageLightbox.astro', import.meta.url);
const tableScrollbarsUrl = new URL('../components/TableScrollbars.astro', import.meta.url);

describe('article utilities', () => {
  it('mounts a site-wide back-to-top control without a scroll listener', () => {
    expect(baseLayout).toContain("import BackToTop from '../components/BackToTop.astro'");
    expect(baseLayout).toContain('<BackToTop />');
    expect(existsSync(backToTopUrl)).toBe(true);

    const component = existsSync(backToTopUrl) ? readFileSync(backToTopUrl, 'utf8') : '';
    expect(component).toContain("@tabler/icons/outline/arrow-bar-to-up.svg?raw");
    expect(component).toContain('set:html={arrowBarToUpIcon}');
    expect(component).toContain('IntersectionObserver');
    expect(component).toContain('button.tabIndex = visible ? 0 : -1');
    expect(component).toContain("button.setAttribute('aria-hidden', String(!visible))");
    expect(component).toContain('button.blur()');
    expect(component).toContain('window.scrollTo');
    expect(component).not.toContain("addEventListener('scroll'");
  });

  it('enhances article images with an accessible native dialog', () => {
    expect(postLayout).toContain("import ImageLightbox from '../components/ImageLightbox.astro'");
    expect(postLayout).toContain('<ImageLightbox />');
    expect(existsSync(imageLightboxUrl)).toBe(true);

    const component = existsSync(imageLightboxUrl) ? readFileSync(imageLightboxUrl, 'utf8') : '';
    expect(component).toContain('<dialog');
    expect(component).toContain("document.querySelectorAll<HTMLImageElement>('.prose img')");
    expect(component).toContain("image.setAttribute('role', 'button')");
    expect(component).toContain("image.addEventListener('keydown'");
    expect(component).toContain('dialog.showModal()');
    expect(component).toContain('const outsideDialog =');
    expect(component).toContain('activeImage?.focus()');
  });

  it('shows a persistent custom scrollbar only when an article table overflows', () => {
    expect(postLayout).toContain("import TableScrollbars from '../components/TableScrollbars.astro'");
    expect(postLayout).toContain('<TableScrollbars />');
    expect(existsSync(tableScrollbarsUrl)).toBe(true);

    const component = existsSync(tableScrollbarsUrl) ? readFileSync(tableScrollbarsUrl, 'utf8') : '';
    expect(component).toContain("document.querySelectorAll<HTMLTableElement>('.prose table')");
    expect(component).toContain('table.scrollWidth - table.clientWidth');
    expect(component).toContain('const overflowing = maxScroll > 0');
    expect(component).toContain("role = 'scrollbar'");
    expect(component).toContain("ariaOrientation = 'horizontal'");
    expect(component).toContain('ResizeObserver');
    expect(component).toContain("table.addEventListener('scroll'");
    expect(component).toContain("thumb.addEventListener('pointerdown'");
    expect(component).toContain("bar.addEventListener('keydown'");
    expect(component).toContain("case 'ArrowLeft'");
    expect(component).toContain("case 'End'");
    expect(component).not.toContain("window.addEventListener('scroll'");
  });
});
