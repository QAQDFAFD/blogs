import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../lib/content';
import { withBase } from '../lib/urls';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  return new Response(JSON.stringify(posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    category: post.data.category,
    tags: post.data.tags,
    url: withBase(`/posts/${post.id}/`),
    pubDate: post.data.pubDate.toISOString(),
  }))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
