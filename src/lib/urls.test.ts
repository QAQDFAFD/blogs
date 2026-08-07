import { describe, expect, it } from 'vitest';
import { canonicalUrl, withBase } from './urls';

describe('base-aware urls', () => {
  it('prefixes internal paths exactly once', () => {
    expect(withBase('/posts/hello/')).toBe('/blogs/posts/hello/');
    expect(withBase('/blogs/posts/hello/')).toBe('/blogs/posts/hello/');
  });

  it('builds canonical urls', () => {
    expect(canonicalUrl('/posts/hello/').href).toBe('https://qaqdfafd.github.io/blogs/posts/hello/');
  });
});
