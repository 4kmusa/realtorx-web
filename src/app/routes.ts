import { PageId } from '../types';

// Clean URL routing (History API). Every PageId has one canonical path; pages that take an id
// use "/<base>/<id>"; portal pages keep a multi-segment section ("/member/leads/LD-1").
// Old links from the former sales model are redirected to their new homes.

const PATHS: Record<PageId, string> = {
  home: '/',
  properties: '/properties',
  'property-detail': '/properties',
  projects: '/projects',
  'project-details': '/projects',
  'project-3d': '/projects',
  'post-listing': '/post-listing',
  'my-listings': '/my-listings',
  join: '/join',
  member: '/member',
  members: '/members',
  solutions: '/solutions',
  hub: '/hub',
  'developer-program': '/developer-program',
  about: '/about',
  manifesto: '/manifesto',
  code: '/code',
  contact: '/contact',
  admin: '/admin',
  signup: '/signup',
  login: '/login',
  faq: '/faq',
  privacy: '/privacy',
  terms: '/terms',
  'not-found': '/404',
};

/** Pages that take an id segment, keyed by base path. */
const ID_PAGES: Record<string, PageId> = {
  properties: 'property-detail',
  projects: 'project-details',
  'post-listing': 'post-listing',
  'my-listings': 'my-listings',
  members: 'members',
};

/** Pages that only exist with an id and share their base path with a list page. */
const DETAIL_ONLY: PageId[] = ['property-detail', 'project-details', 'project-3d'];
const NESTED_PAGES: PageId[] = ['member'];

/** Old paths (former sales model and earlier names) -> new page. */
const REDIRECTS: Record<string, PageId> = {
  'become-a-dealer': 'join',
  oath: 'join',
  dealer: 'member',
  customer: 'member',
  profile: 'member',
  community: 'members',
  developers: 'developer-program',
  services: 'solutions',
  'site-visit': 'properties',
};

export interface Route {
  page: PageId;
  id: string | null;
}

export function pathFor(page: PageId, id?: string | null): string {
  const base = PATHS[page] ?? '/';
  if (page === 'project-3d' && id) return `/projects/${encodeURIComponent(id)}/3d`;
  if (!id) return base;
  const tail = NESTED_PAGES.includes(page) ? id.split('/').map(encodeURIComponent).join('/') : encodeURIComponent(id);
  return `${base.replace(/\/$/, '')}/${tail}`;
}

const BY_PATH: Record<string, PageId> = Object.fromEntries(
  Object.entries(PATHS)
    .filter(([page]) => !DETAIL_ONLY.includes(page as PageId))
    .map(([page, path]) => [path, page as PageId])
);

export function parsePath(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (BY_PATH[clean]) return { page: BY_PATH[clean], id: null };
  const [, base, id, ...rest] = clean.split('/');
  if (base === 'member') {
    const nested = [id, ...rest].filter(Boolean).map(decodeURIComponent).join('/') || null;
    return { page: 'member', id: nested };
  }
  if (base === 'projects' && id && rest.length === 1 && rest[0] === '3d') return { page: 'project-3d', id: decodeURIComponent(id) };
  if (REDIRECTS[base]) return { page: REDIRECTS[base], id: null };
  if (id && !rest.length && ID_PAGES[base]) return { page: ID_PAGES[base], id: decodeURIComponent(id) };
  return { page: 'not-found', id: null };
}

/** Convert a legacy "#page/id" URL into a route, or null when there is no legacy hash. */
export function parseLegacyHash(hash: string): Route | null {
  const raw = hash.replace(/^#\/?/, '').split('?')[0];
  if (!raw) return null;
  const [page, id] = raw.split('/');
  if (!page) return null;
  if (REDIRECTS[page]) return { page: REDIRECTS[page], id: null };
  if (page === 'property-details') return { page: 'property-detail', id: id ? decodeURIComponent(id) : null };
  if (!(page in PATHS)) return null;
  return { page: page as PageId, id: id ? decodeURIComponent(id) : null };
}
