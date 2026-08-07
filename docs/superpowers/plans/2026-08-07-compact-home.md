# Compact Article Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the landing-page hero so the homepage opens directly on a compact, responsive article feed, while fixing the 1000px cover-image height regression.

**Architecture:** Keep the existing Astro content and pagination data flow. Simplify only `index.astro`, convert `PostCard.astro` into a desktop horizontal/mobile stacked card, and protect the cover sizing rules with a focused CSS regression test.

**Tech Stack:** Astro 7, TypeScript 6, Vitest 4, CSS Grid, GitHub Pages

## Global Constraints

- The homepage must show published posts immediately after the global navigation.
- Search renders only when at least 5 published posts exist.
- Desktop cards use one 880px-wide column with a 260px cover rail.
- Mobile cards switch to a 16:9 stacked cover below 767px.
- Existing archive, tags, RSS, article pages, table of contents, and Giscus behavior must not change.
- Validate 375, 768, 1024, 1273, and 1440px without horizontal overflow.

---

### Task 1: Add the cover-sizing regression test

**Files:**
- Create: `src/lib/styles.test.ts`
- Test: `src/lib/styles.test.ts`

**Interfaces:**
- Consumes: `src/styles/global.css` as UTF-8 text.
- Produces: Vitest assertions that require a desktop height override and a mobile 16:9 override.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');

describe('post card cover sizing', () => {
  it('overrides intrinsic HTML height on desktop and mobile', () => {
    expect(css).toMatch(/\.post-card img\s*\{[^}]*height:\s*100%/s);
    expect(css).toMatch(/@media \(max-width: 767px\)[\s\S]*\.post-card img\s*\{[^}]*height:\s*auto[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/styles.test.ts`

Expected: FAIL because the existing desktop rule leaves the HTML `height="1000"` presentation hint active.

### Task 2: Replace the landing page with the article feed

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/PostCard.astro`
- Modify: `src/styles/global.css`
- Test: `src/lib/styles.test.ts`

**Interfaces:**
- Consumes: `getPublishedPosts()`, `paginatePosts(posts, 1, SITE.postsPerPage)`, `PostList`, and `SearchBox`.
- Produces: a static homepage that renders `.home-list-header`, optional search, and `.post-list`; a `.post-card.has-cover` that is horizontal on desktop and stacked on mobile.

- [ ] **Step 1: Simplify the Astro homepage**

Remove the `featured`, `featuredCover`, hero markup, and `getReadingMinutes` import. Render this structure inside `BaseLayout`:

```astro
<section class="articles-section home-articles">
  <div class="content-shell home-content">
    <header class="home-list-header">
      <div><span class="page-label">Writing</span><h1>文章</h1></div>
      <span>{allPosts.length} 篇</span>
    </header>
    {allPosts.length >= 5 && <div id="search"><SearchBox /></div>}
    <PostList posts={page.items} />
    {page.totalPages > 1 && <nav class="pagination"><a class="button button-secondary" href={withBase('/page/2/')}>下一页</a></nav>}
  </div>
</section>
```

- [ ] **Step 2: Remove the redundant card CTA**

Delete `<span class="card-read">阅读全文</span>` from `PostCard.astro`; the existing full-card anchor remains the only interaction target.

- [ ] **Step 3: Implement the compact card CSS**

Use these layout rules in `global.css`:

```css
.home-articles { min-height: 72dvh; padding-block: 64px 96px; background: var(--bg); }
.home-list-header { max-width: 880px; margin: 0 auto 28px; padding-bottom: 18px; display: flex; align-items: end; justify-content: space-between; border-bottom: 3px solid var(--border); }
.home-list-header h1 { margin: 12px 0 0; font-family: "Fredoka Variable", "PingFang SC", sans-serif; font-size: clamp(2.8rem, 6vw, 4.6rem); line-height: 1; }
.home-content #search { max-width: 880px; margin: 0 auto 28px; }
.post-list { max-width: 880px; }
.post-card.has-cover .post-card-link { min-height: 230px; display: grid; grid-template-columns: 260px minmax(0, 1fr); }
.post-card img { width: 100%; height: 100%; object-fit: cover; border-right: 3px solid var(--border); }
```

Inside the existing `@media (max-width: 767px)` block add:

```css
.home-articles { padding-block: 48px 76px; }
.home-list-header { align-items: center; }
.post-card.has-cover .post-card-link { min-height: 0; grid-template-columns: 1fr; }
.post-card img { height: auto; aspect-ratio: 16 / 9; border-right: 0; border-bottom: 3px solid var(--border); }
```

Remove the now-unused hero, featured-card, section-intro, section-heading, and `.card-read` rules.

- [ ] **Step 4: Run focused and full verification**

Run: `npm test -- src/lib/styles.test.ts`

Expected: PASS.

Run: `npm test && npm run check && npm run build && npm run verify && git diff --check`

Expected: all commands exit with code 0.

### Task 3: Browser verification and deployment

**Files:**
- Modify only if verification exposes a reproducible defect: `src/styles/global.css` or `src/pages/index.astro`

**Interfaces:**
- Consumes: local Astro preview and the GitHub Pages deployment workflow.
- Produces: verified responsive homepage and deployed production URL.

- [ ] **Step 1: Verify responsive dimensions**

At widths 375, 768, 1024, 1273, and 1440, record `innerWidth`, `document.documentElement.scrollWidth`, and the first cover `getBoundingClientRect()` dimensions. Every scroll width must equal the viewport width; at 1273px the cover height must be below 300px.

- [ ] **Step 2: Commit and push**

```bash
git add src/pages/index.astro src/components/PostCard.astro src/styles/global.css src/lib/styles.test.ts
git commit -m "feat: simplify homepage article feed"
git push origin main
```

- [ ] **Step 3: Verify production**

Wait for `.github/workflows/deploy.yml` to complete successfully, then open `https://qaqdfafd.github.io/blogs/`. Confirm the hero is absent, the first visible content is the article heading and feed, and the production cover height remains below 300px at 1273px.
