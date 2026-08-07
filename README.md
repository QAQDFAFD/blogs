# JiaJun Li Blog

基于 Astro 的个人技术博客。文章使用 Markdown 或 MDX 编写，推送到 `main` 后由 GitHub Actions 自动发布到 GitHub Pages。

生产地址：`https://qaqdfafd.github.io/blogs/`

## 本地开发

需要 Node.js 22.12 或更高版本。

```bash
npm install
npm run dev
```

常用检查：

```bash
npm test
npm run check
npm run build
npm run verify
```

## 发布文章

在 `src/content/blog/` 新增 `.md` 或 `.mdx` 文件：

```yaml
---
title: 文章标题
description: 用于文章列表和搜索的简短摘要
pubDate: 2026-08-07
category: 前端工程
tags: [Astro, JavaScript]
cover: /images/example.webp
coverAlt: 对封面内容的准确描述
draft: false
---
```

`cover` 可省略。存在封面时必须提供 `coverAlt`。`draft: true` 的文章不会进入首页、归档、搜索、RSS 或站点地图。

提交并推送到 `main` 即可发布：

```bash
git add src/content/blog
git commit -m "docs: publish new post"
git push origin main
```

## GitHub Pages

仓库的 Pages 发布源应设置为 GitHub Actions。`.github/workflows/deploy.yml` 会依次执行测试、类型检查和生产构建，成功后部署 `dist/`。

如果尚未设置：打开仓库 `Settings` → `Pages`，在 `Build and deployment` 中选择 `GitHub Actions`。

## Giscus Setup

GitHub Discussions 已为 `QAQDFAFD/blogs` 启用，站点默认使用以下公开配置：

- Repository ID：`R_kgDOTv_-Sg`
- Category：`Announcements`
- Category ID：`DIC_kwDOTv_-Ss4DC0Fk`
- Mapping：`pathname`

还需要完成一次 Giscus App 授权：

1. 打开 [Giscus App 安装页](https://github.com/apps/giscus/installations/new)。
2. 选择 GitHub 账号 `QAQDFAFD`。
3. 选择 `Only select repositories`，只授权 `blogs`。
4. 返回任意文章页，评论区会自动创建对应 Discussion。

仓库 ID 和分类 ID 是公开标识，不是密钥。需要覆盖默认配置时，可在构建环境中设置：

```text
PUBLIC_GISCUS_REPO_ID
PUBLIC_GISCUS_CATEGORY
PUBLIC_GISCUS_CATEGORY_ID
```

## 项目结构

```text
src/content/blog/     文章
src/components/       导航、卡片、搜索、目录、评论
src/layouts/          页面与文章布局
src/pages/            静态路由、RSS、搜索索引
src/styles/           全局设计系统
design-system/        ui-ux-pro-max 生成并校正的设计规则
```
