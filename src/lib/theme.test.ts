import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const baseLayout = readFileSync(new URL('../layouts/BaseLayout.astro', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/Header.astro', import.meta.url), 'utf8');
const toggle = readFileSync(new URL('../components/ThemeToggle.astro', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');

describe('color theme controls', () => {
  it('applies the saved or system theme before the page renders', () => {
    expect(baseLayout).toContain("localStorage.getItem(storageKey)");
    expect(baseLayout).toContain("matchMedia('(prefers-color-scheme: dark)')");
    expect(baseLayout).toContain('root.dataset.theme = theme');
    expect(baseLayout).toContain('root.style.colorScheme = theme');
  });

  it('renders an accessible icon toggle in the site header', () => {
    expect(header).toContain("import ThemeToggle from './ThemeToggle.astro'");
    expect(header).toContain('<ThemeToggle />');
    expect(toggle).toContain('aria-label="切换到黑夜模式"');
    expect(toggle).toContain('aria-pressed="false"');
    expect(toggle).toContain("@tabler/icons/outline/moon.svg?raw");
    expect(toggle).toContain("@tabler/icons/outline/sun.svg?raw");
    expect(toggle).toContain('theme-icon-moon');
    expect(toggle).toContain('theme-icon-sun');
    expect(toggle).toContain("localStorage.setItem(storageKey, theme)");
    expect(toggle).toContain("new CustomEvent('theme-change', { detail: theme })");
  });

  it('defines full dark-theme tokens and swaps the visible icon', () => {
    expect(css).toMatch(/:root\[data-theme='dark'\]\s*\{[^}]*--bg:\s*#171c26[^}]*--surface:\s*#232b39[^}]*--article-text:\s*#d1d8e3/s);
    expect(css).toMatch(/\.theme-toggle\s*\{[^}]*width:\s*44px[^}]*height:\s*44px/s);
    expect(css).toMatch(/\.theme-icon svg\s*\{[^}]*width:\s*22px[^}]*stroke-width:\s*2\.5/s);
    expect(css).toContain(":root[data-theme='dark'] .theme-icon-moon { display: none; }");
    expect(css).toContain(":root[data-theme='dark'] .theme-icon-sun { display: block; }");
  });
});
