import { PageId } from '../types';

export const PHILOSOPHY =
  'Success is not measured by the number of properties we sell, but by the number of lives, businesses and investments we help transform.';

interface PageMeta {
  title: string;
  description: string;
  path: string;
}

const PAGES: Record<PageId, PageMeta> = {
  home: { title: 'RealtorX | The Real Estate Community', description: `Verified marketplace, member community, Solution Desk and Hub. ${PHILOSOPHY}`, path: '/' },
  properties: { title: 'Marketplace | RealtorX', description: 'Verified properties for sale and rent, each handled by a RealtorX member realtor.', path: '/properties' },
  'property-detail': { title: 'Property | RealtorX', description: 'A RealtorX verified listing.', path: '/properties' },
  projects: { title: 'Projects | RealtorX', description: 'Developer projects on RealtorX.', path: '/projects' },
  'project-details': { title: 'Project | RealtorX', description: 'A developer project on RealtorX.', path: '/projects' },
  'project-3d': { title: 'Explore in 3D | RealtorX', description: 'Explore the building in 3D, choose a floor and a unit, and see live availability.', path: '/projects' },
  'post-listing': { title: 'Post a Property | RealtorX', description: 'List your property for sale or rent. RealtorX verifies every listing.', path: '/post-listing' },
  'my-listings': { title: 'My Listings | RealtorX', description: 'Your listings, review status and buyer interest.', path: '/my-listings' },
  join: { title: 'Join RealtorX | Membership', description: 'Membership for realtors, agencies, developers, investors and solution partners: verification, orientation, the Oath and your Member ID.', path: '/join' },
  member: { title: 'Member Portal | RealtorX', description: 'Your membership, card, listings, leads, cases and Hub bookings.', path: '/member' },
  members: { title: 'Member Directory | RealtorX', description: 'Verified RealtorX realtors, agencies, developers, investors and solution partners.', path: '/members' },
  solutions: { title: 'Solution Desk | RealtorX', description: 'Stuck investment, project delay, merger or legal problem? Submit it to the RealtorX Solution Desk.', path: '/solutions' },
  hub: { title: 'RealtorX Hub | Events, Rooms & Desks', description: 'Orientations, oath ceremonies, trainings and networking, plus meeting rooms and desks for members.', path: '/hub' },
  'developer-program': { title: 'Developer Program | RealtorX', description: 'Projects, brochures, dedicated desks and a network of RealtorX member realtors for developers.', path: '/developer-program' },
  about: { title: 'About | RealtorX', description: 'Why RealtorX exists: a real estate community built on trust, collaboration and solutions.', path: '/about' },
  manifesto: { title: 'The RealtorX Manifesto', description: 'Building more than real estate.', path: '/manifesto' },
  code: { title: 'The RealtorX Code', description: 'How every RealtorX member behaves.', path: '/code' },
  contact: { title: 'Contact | RealtorX', description: 'Talk to the RealtorX community team.', path: '/contact' },
  admin: { title: 'Community Team | RealtorX', description: 'RealtorX back office.', path: '/admin' },
  signup: { title: 'Create an Account | RealtorX', description: 'Create your RealtorX account.', path: '/signup' },
  login: { title: 'Sign In | RealtorX', description: 'Sign in to RealtorX.', path: '/login' },
  faq: { title: 'FAQ | RealtorX', description: 'Answers about membership, listings, the Solution Desk and the Hub.', path: '/faq' },
  privacy: { title: 'Privacy Notice | RealtorX', description: 'How RealtorX handles your information.', path: '/privacy' },
  terms: { title: 'Terms of Use | RealtorX', description: 'Terms for using RealtorX.', path: '/terms' },
  'not-found': { title: 'Page Not Found | RealtorX', description: 'The page you are looking for does not exist.', path: '/' },
};

const IMAGE = '/images/realtorx_engraved_wall_1790597184603.jpg';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Title, description, Open Graph / Twitter tags and canonical link for a page. */
export function applyPageSEO(pageId: PageId) {
  const meta = PAGES[pageId] || PAGES.home;
  if (typeof document === 'undefined') return meta;
  document.title = meta.title;
  const url = `${window.location.origin}${pageId.endsWith('detail') || pageId.endsWith('details') || pageId === 'project-3d' ? window.location.pathname : meta.path}`;
  setMeta('name', 'description', meta.description);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', 'RealtorX');
  setMeta('property', 'og:title', meta.title);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', `${window.location.origin}${IMAGE}`);
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', meta.title);
  setMeta('name', 'twitter:description', meta.description);
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
  return meta;
}
