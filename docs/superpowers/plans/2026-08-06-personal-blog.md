# JiaJun Li Personal Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a compact editorial Astro blog that publishes Markdown to GitHub Pages and uses GitHub Discussions through Giscus for comments.

**Architecture:** Astro statically renders content collections into homepage, article, archive, tag, RSS, sitemap, and search-index routes. Small client scripts progressively enhance theme selection, mobile navigation, search, active table of contents, image fallback, and Giscus while core reading and navigation remain server-rendered.

**Tech Stack:** Astro, TypeScript, MDX, native CSS, Vitest, Giscus, GitHub Actions, GitHub Pages

## Global Constraints

- Production URL is `https://qaqdfafd.github.io/blogs/` and every generated URL must support the `/blogs/` base path.
- Author name is `JiaJun Li`.
- Article source is Markdown or MDX in `src/content/blog/`.
- GitHub Discussions comments use Giscus with pathname mapping.
- Homepage uses a centered 960px container and compact single-column cards with optional right-side covers.
- Cards use 12px radius; controls use 8px radius; forest green is the only accent color.
- Default theme follows the operating system and manual choice persists.
- The site must work without JavaScript except for theme persistence, active TOC highlighting, search, and Giscus.
- No pure black, pure white, purple glow, gradient headline, decorative status dots, em dash, or en dash in visible site copy.
- Motion intensity stays at 3 and all motion honors `prefers-reduced-motion`.

---

## File Structure

- `package.json`: commands and pinned dependencies.
- `astro.config.mjs`: GitHub Pages site/base, MDX, sitemap, and Markdown configuration.
- `tsconfig.json`: Astro strict TypeScript configuration.
- `vitest.config.ts`: utility test configuration.
- `src/content.config.ts`: article schema.
- `src/content/blog/webpack-loader-plugin.md`: migrated first article.
- `src/config/site.ts`: author, repository, navigation, pagination, and public Giscus configuration.
- `src/lib/content.ts`: published filtering, sorting, pagination, tags, neighbors, and reading time.
- `src/lib/urls.ts`: base-aware internal and canonical URLs.
- `src/lib/content.test.ts`, `src/lib/urls.test.ts`: deterministic utility tests.
- `src/layouts/BaseLayout.astro`: document shell, SEO, theme initialization, navigation, and footer.
- `src/layouts/PostLayout.astro`: article header, TOC, prose, neighbors, and comments.
- `src/components/Header.astro`: single-line desktop navigation and mobile menu.
- `src/components/ThemeToggle.astro`: accessible light/dark/system switch.
- `src/components/PostCard.astro`: compact optional-cover article card.
- `src/components/PostList.astro`: empty state and article card collection.
- `src/components/SearchBox.astro`: progressive search control and results.
- `src/components/TableOfContents.astro`: desktop sticky and mobile disclosure TOC.
- `src/components/GiscusComments.astro`: loading, configured, unconfigured, and error states.
- `src/components/Seo.astro`: canonical, Open Graph, and BlogPosting metadata.
- `src/styles/global.css`: tokens, responsive layout, article typography, and interaction states.
- `src/pages/index.astro`: paginated homepage page 1.
- `src/pages/page/[page].astro`: remaining static home pages.
- `src/pages/posts/[...slug].astro`: static article routes.
- `src/pages/archive.astro`: grouped publication archive.
- `src/pages/tags/index.astro`: tag index.
- `src/pages/tags/[tag].astro`: per-tag lists.
- `src/pages/about.astro`: author page.
- `src/pages/404.astro`: recovery page.
- `src/pages/rss.xml.ts`: RSS route.
- `src/pages/search-index.json.ts`: static search data.
- `public/favicon.svg`: simple geometric site mark.
- `public/images/editorial-workspace.webp`: generated supporting visual.
- `.github/workflows/deploy.yml`: checks, build, and Pages deployment.
- `.gitignore`: generated directories and visual-companion artifacts.
- `README.md`: writing, local development, Pages, Discussions, and Giscus setup.

---

### Task 1: Scaffold Astro and lock base URL behavior

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `src/config/site.ts`
- Create: `src/lib/urls.ts`
- Test: `src/lib/urls.test.ts`

**Interfaces:**
- Produces: `SITE`, `withBase(path: string): string`, `canonicalUrl(path: string): URL`

- [ ] **Step 1: Write URL tests**

```ts
import { describe, expect, it } from 'vitest';
import { canonicalUrl, withBase } from './urls';

describe('base-aware urls', () => {
  it('prefixes internal paths exactly once', () => {
    expect(withBase('/posts/hello/')).toBe('/blogs/posts/hello/');
    expect(withBase('/blogs/posts/hello/')).toBe('/blogs/posts/hello/');
  });

  it('builds production canonical urls', () => {
    expect(canonicalUrl('/posts/hello/').href)
      .toBe('https://qaqdfafd.github.io/blogs/posts/hello/');
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/lib/urls.test.ts`

Expected: FAIL because the project and URL helpers do not exist.

- [ ] **Step 3: Add Astro dependencies, commands, configuration, and URL helpers**

`package.json` commands must include `dev`, `build`, `preview`, `check`, `test`, and `test:run`. `astro.config.mjs` must use `site: 'https://qaqdfafd.github.io'`, `base: '/blogs'`, `trailingSlash: 'always'`, static output, MDX, and sitemap. `SITE` must include author `JiaJun Li`, repository `QAQDFAFD/blogs`, `postsPerPage: 10`, and public Giscus fields read from `PUBLIC_GISCUS_REPO_ID` and `PUBLIC_GISCUS_CATEGORY_ID`.

```ts
export const SITE = {
  title: 'JiaJun Li',
  description: '前端工程、构建工具与软件设计。',
  author: 'JiaJun Li',
  origin: 'https://qaqdfafd.github.io',
  base: '/blogs',
  repository: 'QAQDFAFD/blogs',
  postsPerPage: 10,
} as const;
```

- [ ] **Step 4: Run URL tests and Astro checks**

Run: `npm test -- src/lib/urls.test.ts && npm run check`

Expected: all tests pass and Astro reports no errors.

- [ ] **Step 5: Commit scaffold**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts .gitignore src/config/site.ts src/lib/urls.ts src/lib/urls.test.ts
git commit -m "chore: scaffold astro blog"
```

### Task 2: Define content schema and migrate the existing article

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/content.ts`
- Create: `src/lib/content.test.ts`
- Create: `src/content/blog/webpack-loader-plugin.md`
- Preserve source until migration is verified: `docs/webpack 的 loader 和 plugin 原理解析.md`

**Interfaces:**
- Produces: `getPublishedPosts()`, `sortPosts(posts)`, `paginatePosts(posts, page, size)`, `getReadingMinutes(body)`, `getTagCounts(posts)`, `getPostNeighbors(posts, slug)`

- [ ] **Step 1: Write failing content utility tests**

```ts
import { describe, expect, it } from 'vitest';
import { getReadingMinutes, paginatePosts, sortPosts } from './content';

describe('content utilities', () => {
  it('sorts newest first', () => {
    const posts = [
      { data: { pubDate: new Date('2025-01-01') } },
      { data: { pubDate: new Date('2026-01-01') } },
    ];
    expect(sortPosts(posts as never[])[0].data.pubDate.getFullYear()).toBe(2026);
  });

  it('never returns less than one reading minute', () => {
    expect(getReadingMinutes('很短的文章')).toBe(1);
  });

  it('paginates without inventing pages', () => {
    expect(paginatePosts([1, 2, 3], 1, 2)).toEqual({ items: [1, 2], totalPages: 2 });
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- src/lib/content.test.ts`

Expected: FAIL because content utilities do not exist.

- [ ] **Step 3: Implement schema and utilities**

Use Astro's `glob` loader and Zod schema. Make `coverAlt` required when `cover` is present with a schema refinement. Reading time must count CJK characters and whitespace-separated Latin words, using 350 CJK characters or 220 Latin words per minute, rounded up with minimum 1.

- [ ] **Step 4: Migrate the article verbatim below validated frontmatter**

```yaml
---
title: webpack 的 loader 和 plugin 原理解析
description: 从模块转换到编译钩子，理解 webpack 的 loader 与 plugin 机制。
pubDate: 2025-12-24
category: 前端工程
tags: [webpack, 构建工具]
draft: false
---
```

Copy the existing body and image URLs without rewriting technical content.

- [ ] **Step 5: Run tests and content build**

Run: `npm test -- src/lib/content.test.ts && npm run build`

Expected: tests pass and Astro emits the migrated article route.

- [ ] **Step 6: Commit content layer**

```bash
git add src/content.config.ts src/lib/content.ts src/lib/content.test.ts src/content/blog/webpack-loader-plugin.md
git commit -m "feat: add validated blog content"
```

### Task 3: Build the global visual system and page shell

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/ThemeToggle.astro`
- Create: `src/components/Seo.astro`
- Create: `public/favicon.svg`
- Create: `public/images/editorial-workspace.webp`

**Interfaces:**
- Consumes: `SITE`, `withBase`, `canonicalUrl`
- Produces: `BaseLayout` props `{ title, description, image?, article? }`

- [ ] **Step 1: Generate and inspect the editorial supporting image**

Create a monochrome editorial photograph at 1600x1000 showing a quiet developer workspace, with no readable screen text, no logos, no gradient glow, and visual weight on the right. Save as optimized WebP.

- [ ] **Step 2: Implement semantic tokens and responsive shell**

Define light and dark CSS variables for background, surface, text, muted text, border, forest-green accent, radius, and shadow. Use system-first Geist-style sans and mono stacks. Add skip link, 960px content container, 64px maximum navigation, visible focus, reduced-motion override, and explicit mobile collapse below 768px.

- [ ] **Step 3: Implement theme initialization and controls**

Inline a small head script that reads `localStorage.theme` before paint, otherwise follows `prefers-color-scheme`. The control must cycle system, light, and dark; expose its current state via text and `aria-label`; and dispatch `theme-change` for Giscus synchronization.

- [ ] **Step 4: Implement SEO component**

Render unique title, description, canonical, Open Graph, Twitter card, and optional BlogPosting JSON-LD. Do not output article JSON-LD on non-article pages.

- [ ] **Step 5: Run static checks**

Run: `npm run check && npm run build`

Expected: both commands pass; generated HTML includes skip link, canonical URL, and theme initialization.

- [ ] **Step 6: Commit design shell**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro src/components/Header.astro src/components/ThemeToggle.astro src/components/Seo.astro public/favicon.svg public/images/editorial-workspace.webp
git commit -m "feat: add editorial blog shell"
```

### Task 4: Implement compact cards, homepage, pagination, and search

**Files:**
- Create: `src/components/PostCard.astro`
- Create: `src/components/PostList.astro`
- Create: `src/components/SearchBox.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/page/[page].astro`
- Create: `src/pages/search-index.json.ts`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: published content helpers and base-aware URLs
- Produces: compact card markup, static page routes, JSON array `{ title, description, category, tags, url, pubDate, readingMinutes }[]`

- [ ] **Step 1: Add a build test for homepage content and base-prefixed links**

Add `scripts/verify-build.mjs` that reads `dist/index.html`, asserts the author name and migrated title exist, and asserts all local `href` and `src` values start with `/blogs/`, `#`, `mailto:`, or an absolute URL.

- [ ] **Step 2: Run the verifier and confirm failure**

Run: `npm run build && node scripts/verify-build.mjs`

Expected: FAIL because homepage components and verifier expectations are not satisfied.

- [ ] **Step 3: Build compact cards and homepage**

Use a single-column list, 12px cards, optional 29% right cover, real reading time, category, tags, date, and path. Missing or failed covers must collapse to full-width text using a `data-cover-failed` state. With no published posts, render “还没有发布文章” plus About and RSS links.

- [ ] **Step 4: Add static pagination and lightweight search**

Generate page 2+ routes only when needed. Search fetches the base-aware JSON route, filters title, description, category, and tags, and renders an inline list. Include visible label, clear button, empty result, loading skeleton, and fetch error. Without JavaScript, the standard article list remains visible.

- [ ] **Step 5: Run verifier, tests, and checks**

Run: `npm test && npm run check && npm run build && node scripts/verify-build.mjs`

Expected: all commands pass.

- [ ] **Step 6: Commit homepage**

```bash
git add src/components/PostCard.astro src/components/PostList.astro src/components/SearchBox.astro src/pages/index.astro src/pages/page src/pages/search-index.json.ts src/styles/global.css scripts/verify-build.mjs package.json
git commit -m "feat: add compact searchable post index"
```

### Task 5: Implement article reading, TOC, and Giscus

**Files:**
- Create: `src/layouts/PostLayout.astro`
- Create: `src/components/TableOfContents.astro`
- Create: `src/components/GiscusComments.astro`
- Create: `src/pages/posts/[...slug].astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: Astro rendered headings, post data, neighbors, Giscus public config
- Produces: static post routes and progressive comment enhancement

- [ ] **Step 1: Extend build verification for the article route**

Assert `dist/posts/webpack-loader-plugin/index.html` exists and contains the article title, “本文目录”, “评论”, BlogPosting JSON-LD, and canonical URL with `/blogs/posts/webpack-loader-plugin/`.

- [ ] **Step 2: Run verifier and confirm failure**

Run: `npm run build && node scripts/verify-build.mjs`

Expected: FAIL because the article route is not implemented.

- [ ] **Step 3: Build the post layout and semantic prose**

Render header metadata, a 65ch article column, desktop sticky TOC, mobile `<details>` TOC, syntax-highlighted code, responsive images, external link styling, and previous/next links. Active heading uses IntersectionObserver and an `aria-current` attribute; anchor links work without JavaScript.

- [ ] **Step 4: Implement Giscus lifecycle**

When public IDs exist, load `https://giscus.app/client.js` with `repo="QAQDFAFD/blogs"`, `mapping="pathname"`, selected category, lazy loading, and current theme. Keep a skeleton until the iframe loads; listen for errors and show retry. When IDs are missing, show a link to the README Giscus setup section. On `theme-change`, post the supported Giscus theme update message to the iframe.

- [ ] **Step 5: Run verification**

Run: `npm test && npm run check && npm run build && node scripts/verify-build.mjs`

Expected: all checks pass and the article contains usable fallback content without public Giscus IDs.

- [ ] **Step 6: Commit reading experience**

```bash
git add src/layouts/PostLayout.astro src/components/TableOfContents.astro src/components/GiscusComments.astro src/pages/posts src/styles/global.css scripts/verify-build.mjs
git commit -m "feat: add article reading and discussions"
```

### Task 6: Complete archive, tags, about, RSS, and 404

**Files:**
- Create: `src/pages/archive.astro`
- Create: `src/pages/tags/index.astro`
- Create: `src/pages/tags/[tag].astro`
- Create: `src/pages/about.astro`
- Create: `src/pages/404.astro`
- Create: `src/pages/rss.xml.ts`
- Modify: `scripts/verify-build.mjs`

**Interfaces:**
- Consumes: published posts, tag counts, and base-aware URLs
- Produces: complete static information architecture and RSS

- [ ] **Step 1: Add expected route assertions**

Verify archive, tags, about, 404, RSS, sitemap, and the `webpack` tag route exist in `dist`. Parse RSS and assert the first item points at the production article URL.

- [ ] **Step 2: Run verifier and confirm failure**

Run: `npm run build && node scripts/verify-build.mjs`

Expected: FAIL with missing route files.

- [ ] **Step 3: Implement archive and tag pages**

Group archives by year and month. Tag index shows real post counts. Per-tag pages reuse `PostList` and return only matching published posts.

- [ ] **Step 4: Implement about, 404, and RSS**

About contains author name, concise purpose, and GitHub link. 404 provides home and article links. RSS uses `@astrojs/rss`, real descriptions and dates, and base-aware production links.

- [ ] **Step 5: Run full static verification**

Run: `npm test && npm run check && npm run build && node scripts/verify-build.mjs`

Expected: all checks pass.

- [ ] **Step 6: Commit complete routes**

```bash
git add src/pages/archive.astro src/pages/tags src/pages/about.astro src/pages/404.astro src/pages/rss.xml.ts scripts/verify-build.mjs
git commit -m "feat: complete blog discovery routes"
```

### Task 7: Add GitHub Pages deployment and operating documentation

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: npm commands and `dist/`
- Produces: deployable Pages artifact and one-time setup guide

- [ ] **Step 1: Add deployment workflow**

Use `actions/checkout`, `actions/setup-node` with npm cache, `npm ci`, `npm test`, `npm run check`, `npm run build`, `actions/upload-pages-artifact`, and `actions/deploy-pages`. Grant only `contents: read`, `pages: write`, and `id-token: write`; deploy only on pushes to `main`; cancel superseded deployments.

- [ ] **Step 2: Rewrite README as an operator guide**

Document Node version, install/dev/build commands, frontmatter example, image handling, drafts, production URL, Pages source set to GitHub Actions, Discussions enablement, Giscus app installation, category selection, public repository/category ID variables, and daily push-to-publish flow. Add anchor `#giscus-setup` for the unconfigured comment link.

- [ ] **Step 3: Validate workflow and documentation references**

Run: `npm test && npm run check && npm run build && node scripts/verify-build.mjs`

Expected: all checks pass; README commands match `package.json`.

- [ ] **Step 4: Commit deployment**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: deploy blog to github pages"
```

### Task 8: Browser QA and final repository verification

**Files:**
- Modify only files with verified defects.

**Interfaces:**
- Consumes: production build and preview server
- Produces: verified desktop/mobile, light/dark, keyboard, and failure-state behavior

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test && npm run check && npm run build && node scripts/verify-build.mjs`

Expected: all commands exit 0.

- [ ] **Step 2: Preview production with the GitHub base path**

Run: `npm run preview -- --host 127.0.0.1`

Open the reported `/blogs/` URL, not the root URL.

- [ ] **Step 3: Verify visual and interaction matrix**

Check 375px, 768px, and desktop widths; light and dark; keyboard navigation; mobile menu; system/light/dark theme cycling; search success/empty/error; mobile TOC; desktop active TOC; cover fallback; Giscus unconfigured/loading/error; 404; and reduced motion.

- [ ] **Step 4: Run Lighthouse and inspect console**

Target LCP below 2.5s, INP below 200ms, CLS below 0.1, accessibility 95+, SEO 95+, and no console errors on homepage or article.

- [ ] **Step 5: Fix verified defects and rerun affected checks**

For every defect, add or extend a deterministic test when possible, make the smallest code change, and rerun the focused test plus the complete suite.

- [ ] **Step 6: Commit final QA fixes**

```bash
git add -u src public scripts
git commit -m "fix: polish blog release"
```

If no QA defects require changes, do not create an empty commit.
