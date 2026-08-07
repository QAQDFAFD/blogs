export function sortPosts<T extends { data: { pubDate: Date } }>(posts: T[]) {
  return [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getReadingMinutes(body: string) {
  const plain = body.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ');
  const cjk = (plain.match(/[\u3400-\u9fff]/g) ?? []).length;
  const latin = plain.replace(/[\u3400-\u9fff]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(cjk / 350 + latin / 220));
}

export function paginatePosts<T>(posts: T[], page: number, size: number) {
  return {
    items: posts.slice((page - 1) * size, page * size),
    totalPages: Math.max(1, Math.ceil(posts.length / size)),
  };
}
