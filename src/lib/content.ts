import { getCollection, type CollectionEntry } from 'astro:content';
export { getReadingMinutes, paginatePosts, sortPosts } from './content-utils';
import { sortPosts } from './content-utils';

export type Post = CollectionEntry<'blog'>;

export async function getPublishedPosts() {
  return sortPosts((await getCollection('blog')).filter((post) => !post.data.draft));
}

export function getTagCounts(posts: Post[]) {
  const counts = new Map<string, number>();
  posts.forEach((post) => post.data.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)));
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'));
}

export function getPostNeighbors(posts: Post[], id: string) {
  const index = posts.findIndex((post) => post.id === id);
  return { newer: index > 0 ? posts[index - 1] : undefined, older: index >= 0 ? posts[index + 1] : undefined };
}
