import { describe, expect, it } from 'vitest';
import { getReadingMinutes, paginatePosts, sortPosts } from './content-utils';

describe('content utilities', () => {
  it('sorts newest first', () => {
    const posts = [
      { data: { pubDate: new Date('2025-01-01') } },
      { data: { pubDate: new Date('2026-01-01') } },
    ];
    expect(sortPosts(posts)[0].data.pubDate.getFullYear()).toBe(2026);
  });

  it('returns at least one reading minute', () => {
    expect(getReadingMinutes('很短的文章')).toBe(1);
  });

  it('paginates content', () => {
    expect(paginatePosts([1, 2, 3], 1, 2)).toEqual({ items: [1, 2], totalPages: 2 });
  });
});
