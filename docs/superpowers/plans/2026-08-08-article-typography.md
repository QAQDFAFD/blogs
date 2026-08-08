# Article Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 缩短文章正文标题、内容块与桌面目录的纵向间距，同时保留移动端 44px 触控高度和现有阅读功能。

**Architecture:** 不改变 Astro 组件或 Markdown 数据结构，只在全局样式中调整文章页的排版节奏。CSS 文本回归测试先锁定设计规格中的精确规则，构建后再通过真实浏览器验证计算样式、溢出和响应式行为。

**Tech Stack:** Astro 7.2、CSS、Vitest 4、Astro Preview、浏览器计算样式检查

## Global Constraints

- `.reading-card` 使用 `padding: clamp(22px, 4vw, 44px)`；移动端继续使用 `22px 18px`。
- `.prose` 保持 `72ch` 最大宽度和现有字号，行高改为 `1.72`。
- H2 使用 `1.45em 0 .5em`，H3 使用 `1.3em 0 .45em`，H4 使用 `1.15em 0 .4em`。
- 图片、代码块、表格和引用块的上下外边距统一为 `1.4rem`。
- 桌面目录链接最小高度为 `30px`；移动目录链接最小高度为 `44px`。
- 不新增依赖，不修改 Astro 组件结构，不改动文章 Markdown 文件。

---

### Task 1: 锁定紧凑排版的 CSS 合约

**Files:**
- Modify: `src/lib/styles.test.ts:1-19`
- Test: `src/lib/styles.test.ts`

**Interfaces:**
- Consumes: `src/styles/global.css` 的完整文本以及从 `@media (max-width: 767px)` 截取的移动端 CSS。
- Produces: 对正文卡片、标题、内容块、桌面目录和移动目录精确规则的 Vitest 回归约束。

- [ ] **Step 1: 写入失败的样式回归测试**

在现有测试后加入：

```ts
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
```

- [ ] **Step 2: 运行测试并确认它因旧样式失败**

Run: `npm test -- src/lib/styles.test.ts`

Expected: `compact article typography` 中的新断言失败，原有文章封面测试继续通过。

### Task 2: 实现正文与目录的紧凑样式

**Files:**
- Modify: `src/styles/global.css:139-161`
- Modify: `src/styles/global.css:200-203`
- Test: `src/lib/styles.test.ts`

**Interfaces:**
- Consumes: Task 1 定义的 CSS 选择器和值。
- Produces: 文章页的紧凑正文节奏、桌面目录密度以及移动端 44px 目录触控高度。

- [ ] **Step 1: 实现正文卡片、标题和内容块样式**

将文章正文相关规则调整为：

```css
.reading-card { padding: clamp(22px, 4vw, 44px); }
.prose { line-height: 1.72; }
.prose h2, .prose h3, .prose h4 { scroll-margin-top: 28px; font-family: "Fredoka Variable", "PingFang SC", sans-serif; line-height: 1.25; letter-spacing: -.025em; }
.prose h2 { margin: 1.45em 0 .5em; font-size: 1.75rem; }
.prose h3 { margin: 1.3em 0 .45em; font-size: 1.35rem; }
.prose h4 { margin: 1.15em 0 .4em; font-size: 1.08rem; line-height: 1.35; }
.prose p { margin: .8em 0; }
.prose ul, .prose ol { margin: .8em 0; padding-left: 1.5em; }
.prose li + li { margin-top: .25em; }
.prose li > :is(ul, ol) { margin: .45em 0; }
```

保留每条现有规则中的边框、颜色、圆角、阴影、横向滚动和内部 padding，只把 `.prose img`、`.prose pre`、`.prose table`、`.prose blockquote` 的 `margin` 改为 `1.4rem 0`。

- [ ] **Step 2: 实现桌面与移动目录样式**

将目录规则调整为：

```css
.toc-desktop { padding: 16px; }
.toc ol { margin: 8px 0 0; }
.toc li { margin: 2px 0; }
.toc li.nested { padding-left: 10px; }
.toc a { min-height: 30px; line-height: 1.3; }

@media (max-width: 767px) {
  .toc-mobile a { min-height: 44px; }
}
```

保留目录的 sticky、display、颜色、当前章节状态、边框、背景和阴影属性。

- [ ] **Step 3: 运行聚焦测试并确认通过**

Run: `npm test -- src/lib/styles.test.ts`

Expected: `5 passed`，其中原有 2 个封面测试与新增 3 个排版测试全部通过。

- [ ] **Step 4: 运行完整静态验证**

Run: `npm test && npm run check && npm run build && npm run verify && git diff --check`

Expected: 所有 Vitest 测试通过，Astro check 无错误，构建和产物验证通过，Git 差异无空白错误。

### Task 3: 浏览器验收并发布

**Files:**
- Verify: `dist/posts/webpack-loader-plugin/index.html`
- Verify: `https://qaqdfafd.github.io/blogs/posts/webpack-loader-plugin/`

**Interfaces:**
- Consumes: Task 2 生成的 Astro 静态产物。
- Produces: 桌面和移动视口的计算样式验收结果，以及已部署的 GitHub Pages 页面。

- [ ] **Step 1: 启动本地预览并验证桌面计算样式**

Run: `npm run preview -- --host 127.0.0.1`

在 1273×963 视口读取 `.prose`、首个 H2、首个 H3、`.toc-desktop li` 和 `.toc-desktop a` 的计算样式。

Expected: 正文行高约为字号的 1.72 倍；H2 外边距约 41px/14px；H3 约 28px/10px；目录项目步进不超过 34px；页面 `scrollWidth <= innerWidth`。

- [ ] **Step 2: 验证移动触控尺寸与溢出**

在 375×812 视口展开 `.toc-mobile` 并读取 summary 与目录链接矩形。

Expected: summary 和每个目录链接高度均不小于 44px，页面 `scrollWidth <= innerWidth`。

- [ ] **Step 3: 提交并推送实现**

```bash
git add src/lib/styles.test.ts src/styles/global.css
git commit -m "style: tighten article reading rhythm"
git push origin main
```

- [ ] **Step 4: 等待 GitHub Pages 成功并验证线上页面**

Run: `gh run list --workflow deploy.yml --limit 1`，随后使用 `gh run watch <run-id> --exit-status`。

Expected: 最新部署工作流成功；生产文章页返回 200，且线上 CSS 包含本计划中的紧凑排版规则。
