import rss from '@astrojs/rss';
import { getPublishedPosts } from '../lib/content';
import { SITE } from '../config/site';
import { canonicalUrl } from '../lib/urls';

export async function GET() {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: canonicalUrl('/'),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: canonicalUrl(`/posts/${post.id}/`).href,
      categories: [post.data.category, ...post.data.tags],
    })),
  });
}
