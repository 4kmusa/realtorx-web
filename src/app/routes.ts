import { PageId } from '../types';

// Clean URL routing (History API). Every PageId has one canonical path; pages that take an id
// use "/<base>/<id>". Buyers sign in on the website (/sign-in, My account at /account); agents and developers
// sign in to their own dashboards (/agent/, /developer/). Old links from earlier models are redirected to their new homes.

const PATHS: Record<PageId, string> = {
  home: '/',
  properties: '/properties',
  'property-detail': '/properties',
  projects: '/projects',
  'project-details': '/projects',
  'project-3d': '/projects',
  'virtual-tour': '/properties',
  'become-agent': '/become-an-agent',
  'my-application': '/my-application',
  account: '/account',
  solutions: '/client-services',
  'developer-program': '/for-developers',
  about: '/about',
  contact: '/contact',
  login: '/sign-in',
  faq: '/faq',
  privacy: '/privacy',
  terms: '/terms',
  legal: '/legal',
  cookies: '/cookies',
  'booking-policy': '/booking-policy',
  'agent-terms': '/agent-terms',
  'developer-terms': '/developer-terms',
  disclaimer: '/disclaimer',
  complaints: '/complaints',
  'buyer-statement': '/statement',
  'not-found': '/404',
};

/** Pages that take an id segment, keyed by base path. */
const ID_PAGES: Record<string, PageId> = {
  properties: 'property-detail',
  projects: 'project-details',
  statement: 'buyer-statement',
};

/** Pages that only exist with an id and share their base path with a list page. */
const DETAIL_ONLY: PageId[] = ['property-detail', 'project-details', 'project-3d', 'virtual-tour', 'buyer-statement'];

/** Old paths (earlier models and names) -> new page. */
const REDIRECTS: Record<string, PageId> = {
  // RealtorX OS v0.1 (community model, archived 2026-10-20)
  join: 'become-agent',
  oath: 'become-agent',
  member: 'login',
  members: 'about',
  hub: 'about',
  manifesto: 'about',
  code: 'about',
  community: 'about',
  'post-listing': 'properties',
  'my-listings': 'properties',
  signup: 'become-agent',
  login: 'login',
  admin: 'login',
  solutions: 'solutions',
  'developer-program': 'developer-program',
  // 2025 sales model and older names
  'become-a-dealer': 'become-agent',
  dealer: 'login',
  customer: 'login',
  profile: 'login',
  developers: 'developer-program',
  services: 'solutions',
  'site-visit': 'properties',
};

export interface Route {
  page: PageId;
  id: string | null;
}

export function pathFor(page: PageId, id?: string | null): string {
  const base = Object.prototype.hasOwnProperty.call(PATHS, page) ? PATHS[page] : '/';
  if (page === 'project-3d' && id) {
    const [project, query] = id.split('?'); // "<project>?unit=<property>&inside=1" opens on that unit
    return `/projects/${encodeURIComponent(project)}/3d${query ? `?${query}` : ''}`;
  }
  if (page === 'virtual-tour' && id) {
    // id = "property/<id>" or "project/<id>"
    const [kind, ...rest] = id.split('/');
    return `/${kind === 'project' ? 'projects' : 'properties'}/${encodeURIComponent(rest.join('/'))}/tour`;
  }
  if (!id) return base;
  if (id.startsWith('?')) return `${base}${id}`; // a list page with its filters, e.g. /properties?purpose=Rent
  return `${base.replace(/\/$/, '')}/${encodeURIComponent(id)}`;
}

const BY_PATH: Record<string, PageId> = Object.fromEntries(
  Object.entries(PATHS)
    .filter(([page]) => !DETAIL_ONLY.includes(page as PageId))
    .map(([page, path]) => [path, page as PageId])
);

export function parsePath(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '') || '/';
  // Own keys only: "/constructor" or "/toString" must not match Object.prototype and render as a page.
  const own = (map: object, key: string) => Object.prototype.hasOwnProperty.call(map, key);
  if (own(BY_PATH, clean)) return { page: BY_PATH[clean], id: null };
  const [, base, id, ...rest] = clean.split('/');
  if (base === 'projects' && id && rest.length === 1 && rest[0] === '3d') return { page: 'project-3d', id: decodeURIComponent(id) };
  if ((base === 'projects' || base === 'properties') && id && rest.length === 1 && rest[0] === 'tour') {
    return { page: 'virtual-tour', id: `${base === 'projects' ? 'project' : 'property'}/${decodeURIComponent(id)}` };
  }
  if (own(REDIRECTS, base)) return { page: REDIRECTS[base], id: null };
  if (id && !rest.length && own(ID_PAGES, base)) return { page: ID_PAGES[base], id: decodeURIComponent(id) };
  return { page: 'not-found', id: null };
}

/** Convert a legacy "#page/id" URL into a route, or null when there is no legacy hash. */
export function parseLegacyHash(hash: string): Route | null {
  const raw = hash.replace(/^#\/?/, '').split('?')[0];
  if (!raw) return null;
  const [page, id] = raw.split('/');
  if (!page) return null;
  if (Object.prototype.hasOwnProperty.call(REDIRECTS, page)) return { page: REDIRECTS[page], id: null };
  if (page === 'property-details') return { page: 'property-detail', id: id ? decodeURIComponent(id) : null };
  if (!Object.prototype.hasOwnProperty.call(PATHS, page)) return null;
  return { page: page as PageId, id: id ? decodeURIComponent(id) : null };
}
