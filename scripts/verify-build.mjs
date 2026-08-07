import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const required = [
  'dist/index.html',
  'dist/posts/webpack-loader-plugin/index.html',
  'dist/archive/index.html',
  'dist/tags/index.html',
  'dist/about/index.html',
  'dist/404.html',
  'dist/rss.xml',
  'dist/search-index.json',
  'dist/sitemap-index.xml',
];

const missing = required.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) throw new Error(`Missing build output: ${missing.join(', ')}`);

const home = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
const article = readFileSync(resolve(root, 'dist/posts/webpack-loader-plugin/index.html'), 'utf8');
const homeText = home.replace(/<[^>]+>/g, '');

for (const text of ['JiaJun Li', '文章', 'webpack 的 loader 和 plugin 原理解析']) {
  if (!homeText.includes(text)) throw new Error(`Homepage missing: ${text}`);
}
for (const fragment of ['class="home-list-header"', '<h1>文章</h1>']) {
  if (!home.includes(fragment)) throw new Error(`Homepage structure missing: ${fragment}`);
}
for (const fragment of ['home-hero', 'featured-card', 'section-intro', 'data-search']) {
  if (home.includes(fragment)) throw new Error(`Homepage still contains removed content: ${fragment}`);
}

for (const text of ['本文目录', '评论', 'BlogPosting', 'https://qaqdfafd.github.io/blogs/posts/webpack-loader-plugin/']) {
  if (!article.includes(text)) throw new Error(`Article missing: ${text}`);
}

for (const html of [home, article]) {
  const localRefs = [...html.matchAll(/(?:href|src)="(\/[^\"]*)"/g)].map((match) => match[1]);
  const invalid = localRefs.filter((value) => !value.startsWith('/blogs/'));
  if (invalid.length) throw new Error(`URL missing /blogs base: ${invalid.join(', ')}`);
}

console.log('Build output verified.');
