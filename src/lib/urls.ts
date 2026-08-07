import { SITE } from '../config/site';

export function withBase(path = '/') {
  if (/^(?:https?:|mailto:|#)/.test(path)) return path;
  const normalized = `/${path}`.replace(/\/+/g, '/');
  if (normalized === SITE.base || normalized.startsWith(`${SITE.base}/`)) return normalized;
  if (normalized === '/') return `${SITE.base}/`;
  return `${SITE.base}${normalized}`;
}

export function canonicalUrl(path = '/') {
  return new URL(withBase(path), SITE.origin);
}
