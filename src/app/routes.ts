import { PageId } from '../types';

// Clean URL routing (History API). Every PageId has one canonical path; pages that
// take an id (property, project) use "/<base>/<id>". Old "#page/id" links are
// converted on load so existing shared links keep working.

const PATHS: Partial<Record<PageId, string>> = {
  home: '/',
  properties: '/properties',
  'property-detail': '/properties',
  projects: '/projects',
  'project-details': '/projects',
  about: '/about',
  services: '/services',
  contact: '/contact',
  manifesto: '/manifesto',
  oath: '/oath',
  portal: '/customer',
  dealer: '/dealer',
  'become-dealer': '/become-a-dealer',
  admin: '/admin',
  community: '/community',
  signup: '/signup',
  login: '/login',
  profile: '/profile',
  'site-visit': '/site-visit',
  developers: '/developers',
  faq: '/faq',
  privacy: '/privacy',
  terms: '/terms',
};

/** Pages that take an id segment, keyed by base path. */
const ID_PAGES: Record<string, PageId> = {
  properties: 'property-detail',
  projects: 'project-details',
};

/** Legacy page ids that now render another page. */
const ALIASES: Partial<Record<PageId, PageId>> = {
  'property-details': 'property-detail',
  'become-customer': 'contact',
};

export interface Route {
  page: PageId;
  id: string | null;
}

export function canonicalPage(page: PageId): PageId {
  return ALIASES[page] || page;
}

/** Portal pages keep a multi-segment section path, e.g. /customer/payments/PAY-1. */
const NESTED_PAGES: PageId[] = ['portal', 'dealer'];

export function pathFor(page: PageId, id?: string | null): string {
  const target = canonicalPage(page);
  const base = PATHS[target] ?? '/';
  if (!id) return base;
  const tail = NESTED_PAGES.includes(target)
    ? id.split('/').map(encodeURIComponent).join('/')
    : encodeURIComponent(id);
  return `${base.replace(/\/$/, '')}/${tail}`;
}

const BY_PATH: Record<string, PageId> = Object.fromEntries(
  Object.entries(PATHS)
    .filter(([page]) => !Object.values(ID_PAGES).includes(page as PageId))
    .map(([page, path]) => [path as string, page as PageId])
);

export function parsePath(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (BY_PATH[clean]) return { page: BY_PATH[clean], id: null };
  const [, base, id, ...rest] = clean.split('/');
  // /customer/<section>[/<id>] and /dealer/<section>[/<id>] stay on the portal pages.
  const nested = [id, ...rest].filter(Boolean).map(decodeURIComponent).join('/') || null;
  if (base === 'customer') return { page: 'portal', id: nested };
  if (base === 'dealer') return { page: 'dealer', id: nested };
  if (base === 'site-visit' && id && !rest.length) return { page: 'site-visit', id: decodeURIComponent(id) };
  if (id && !rest.length && ID_PAGES[base]) return { page: ID_PAGES[base], id: decodeURIComponent(id) };
  return { page: 'not-found', id: null };
}

/** Convert a legacy "#page/id" URL into a route, or null when there is no legacy hash. */
export function parseLegacyHash(hash: string): Route | null {
  const raw = hash.replace(/^#\/?/, '').split('?')[0];
  if (!raw) return null;
  const [page, id] = raw.split('/');
  if (!page) return null;
  const known = (Object.keys(PATHS) as PageId[]).concat(Object.keys(ALIASES) as PageId[]);
  if (!known.includes(page as PageId)) return null;
  return { page: canonicalPage(page as PageId), id: id ? decodeURIComponent(id) : null };
}
