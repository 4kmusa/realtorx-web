import { PageId } from '../types';

const TAGLINE = 'Verified developer inventory, sold by identity-checked RealtorX Agents.';

interface PageMeta {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}

const PAGES: Record<PageId, PageMeta> = {
  home: { title: 'RealtorX | Buy from trusted developers', description: TAGLINE, path: '/' },
  properties: { title: 'Properties | RealtorX', description: 'Verified units for sale and rent from developers under contract with RealtorX.', path: '/properties' },
  'property-detail': { title: 'Property | RealtorX', description: 'A RealtorX verified listing.', path: '/properties' },
  projects: { title: 'Projects | RealtorX', description: 'Developer projects on RealtorX, with 3D views and live availability.', path: '/projects' },
  'project-details': { title: 'Project | RealtorX', description: 'A developer project on RealtorX.', path: '/projects' },
  'virtual-tour': { title: '360° Virtual Tour | RealtorX', description: 'Walk through the property room by room in 360°.', path: '/properties' },
  'project-3d': { title: 'Explore in 3D | RealtorX', description: 'Explore the building in 3D, choose a floor and a unit, and see live availability.', path: '/projects' },
  'my-application': { title: 'My Application | RealtorX', description: 'Follow your RealtorX Agent application.', path: '/my-application', noindex: true },
  'become-agent': { title: 'Become a RealtorX Agent', description: 'Sell verified developer inventory as an identity-checked RealtorX Agent.', path: '/become-an-agent' },
  solutions: { title: 'Client Services | RealtorX', description: 'Property not selling, maintenance, stuck investment or paperwork? RealtorX helps owners solve it.', path: '/client-services' },
  'developer-program': { title: 'For Developers | RealtorX', description: 'Sign with RealtorX: verified agents sell your inventory, and you follow every deal in your developer dashboard.', path: '/for-developers' },
  about: { title: 'About | RealtorX', description: TAGLINE, path: '/about' },
  contact: { title: 'Contact | RealtorX', description: 'Talk to the RealtorX team.', path: '/contact' },
  login: { title: 'Sign In | RealtorX', description: 'Sign in or create a free account to enquire, book visits and request bookings.', path: '/sign-in' },
  account: { title: 'My Account | RealtorX', description: 'Your enquiries, site visits and booking requests.', path: '/account', noindex: true },
  faq: { title: 'FAQ | RealtorX', description: 'Answers for buyers, agents, developers and owners.', path: '/faq' },
  privacy: { title: 'Privacy Policy | RealtorX', description: 'What information RealtorX collects, why, who sees it and your rights.', path: '/privacy' },
  terms: { title: 'Terms of Use | RealtorX', description: 'The rules for using the RealtorX website and your buyer account.', path: '/terms' },
  legal: { title: 'Policies | RealtorX', description: 'All RealtorX policies and terms in one place.', path: '/legal' },
  cookies: { title: 'Cookie Policy | RealtorX', description: 'The cookies and browser storage the RealtorX website uses.', path: '/cookies' },
  'booking-policy': { title: 'Booking, Cancellation and Refund Policy | RealtorX', description: 'How visits, booking requests, unit holds, payments, cancellations and refunds work on RealtorX.', path: '/booking-policy' },
  'agent-terms': { title: 'RealtorX Agent Terms', description: 'The terms for applying as, and working as, a RealtorX Agent.', path: '/agent-terms' },
  'developer-terms': { title: 'Developer Partner Terms | RealtorX', description: 'The terms on which developers list and sell projects through RealtorX.', path: '/developer-terms' },
  disclaimer: { title: 'Disclaimer | RealtorX', description: 'What listings, images, 3D models and tools on RealtorX promise, and what they do not.', path: '/disclaimer' },
  complaints: { title: 'Complaints Policy | RealtorX', description: 'How to raise a complaint with RealtorX and when we answer.', path: '/complaints' },
  'buyer-statement': { title: 'Payment Statement | RealtorX', description: 'Your payment statement.', path: '/statement', noindex: true },
  'not-found': { title: 'Page Not Found | RealtorX', description: 'The page you are looking for does not exist.', path: '/', noindex: true },
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
  const url = `${window.location.origin}${pageId.endsWith('detail') || pageId.endsWith('details') || pageId === 'project-3d' || pageId === 'virtual-tour' ? window.location.pathname : meta.path}`;
  setMeta('name', 'robots', meta.noindex ? 'noindex, nofollow' : 'index, follow');
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
