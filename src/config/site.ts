export const SITE = {
  title: 'JiaJun Li',
  description: '前端工程、构建工具与软件设计。',
  author: 'JiaJun Li',
  origin: 'https://qaqdfafd.github.io',
  base: '/blogs',
  repository: 'QAQDFAFD/blogs',
  github: 'https://github.com/QAQDFAFD',
  postsPerPage: 10,
} as const;

export const GISCUS = {
  repo: 'QAQDFAFD/blogs',
  repoId: import.meta.env.PUBLIC_GISCUS_REPO_ID ?? 'R_kgDOTv_-Sg',
  category: import.meta.env.PUBLIC_GISCUS_CATEGORY ?? 'Announcements',
  categoryId: import.meta.env.PUBLIC_GISCUS_CATEGORY_ID ?? 'DIC_kwDOTv_-Ss4DC0Fk',
} as const;
