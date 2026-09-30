import { PageId, Property } from '../types';
import { BRAND_TAGLINES, MOCK_PROPERTIES } from '../data/mockProperties';

export const REALTORX_PHILOSOPHY_QUOTE = BRAND_TAGLINES.philosophy;
// "Success is not measured by the number of properties we sell, but by the number of lives, businesses and investments we help transform."

export interface PageSEOMetadata {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: 'website' | 'article' | 'profile';
  twitterCard: 'summary_large_image' | 'summary';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalPath: string;
  schemaType: 'RealEstateAgent' | 'WebSite' | 'Article' | 'CollectionPage' | 'ContactPage' | 'AboutPage';
}

const DEFAULT_IMAGE = '/src/assets/images/realtorx_engraved_wall_1790597184603.jpg';

export const PAGE_SEO_MAP: Record<PageId, (property?: Property) => PageSEOMetadata> = {
  home: () => ({
    title: 'Realtor X — Real Estate. Reimagined. | Bahria Town Karachi',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Bahria Town Karachi's premier community-first property marketplace with verified listings and fair 40/60 commission model.`,
    ogTitle: 'Realtor X — Real Estate. Reimagined. | Bahria Town Karachi',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: DEFAULT_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Realtor X — Real Estate. Reimagined. | Bahria Town Karachi',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: DEFAULT_IMAGE,
    canonicalPath: '/',
    schemaType: 'RealEstateAgent',
  }),



  properties: () => ({
    title: 'Verified Properties in Bahria Town Karachi | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Explore verified villas, residential plots, commercial shops, and apartments across Bahria Town Karachi precincts.`,
    ogTitle: 'Verified Bahria Town Properties | Realtor X Marketplace',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/bahria_town_karachi_1790600916751.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Verified Bahria Town Properties | Realtor X Marketplace',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/bahria_town_karachi_1790600916751.jpg',
    canonicalPath: '/#properties',
    schemaType: 'CollectionPage',
  }),

  'property-detail': (property?: Property) => {
    const p = property || MOCK_PROPERTIES[0];
    return {
      title: `${p.title} — ${p.priceFormatted} | Realtor X Bahria Town`,
      description: `${REALTORX_PHILOSOPHY_QUOTE} ${p.title} (${p.size} ${p.sizeUnit}) located in ${p.precinct}, ${p.project}. Verified dealer listing with 40/60 commission transparency.`,
      ogTitle: `${p.title} — ${p.priceFormatted} | Realtor X`,
      ogDescription: `${REALTORX_PHILOSOPHY_QUOTE} Located in ${p.precinct}, Bahria Town Karachi. Verified listing.`,
      ogImage: p.images[0] || '/src/assets/images/villa_bahria_luxury_1790600936792.jpg',
      ogType: 'article',
      twitterCard: 'summary_large_image',
      twitterTitle: `${p.title} — ${p.priceFormatted} | Realtor X`,
      twitterDescription: `${REALTORX_PHILOSOPHY_QUOTE}`,
      twitterImage: p.images[0] || '/src/assets/images/villa_bahria_luxury_1790600936792.jpg',
      canonicalPath: `/#properties/${p.id}`,
      schemaType: 'RealEstateAgent',
    };
  },

  projects: () => ({
    title: 'Mega Projects — Bahria Town Karachi 1 & 2 | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Discover premier master-planned mega communities: Bahria Town Karachi (BTK-1) and Bahria Town Karachi 2 (BTK-2) on M-9 Motorway.`,
    ogTitle: 'Bahria Town Karachi 1 & 2 Mega Projects | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/plot_precinct_bahria_1790600998798.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Bahria Town Karachi 1 & 2 Mega Projects | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/plot_precinct_bahria_1790600998798.jpg',
    canonicalPath: '/#projects',
    schemaType: 'CollectionPage',
  }),

  about: () => ({
    title: 'About Realtor X — Transforming Pakistan Real Estate',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Learn how Realtor X is revolutionizing Pakistani property brokerage through radical transparency, 40/60 dealer splits, and community custodianship.`,
    ogTitle: 'About Realtor X — Transforming Pakistan Real Estate',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/realtorx_founding_ceremony_1790597198456.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'About Realtor X — Transforming Pakistan Real Estate',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/realtorx_founding_ceremony_1790597198456.jpg',
    canonicalPath: '/#about',
    schemaType: 'AboutPage',
  }),

  services: () => ({
    title: 'Brokerage & Advisory Services | Realtor X Bahria Town',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Comprehensive services: verified property valuation, digital transfer escrow, dealer empowerment network, and ERPNext integration.`,
    ogTitle: 'Brokerage & Advisory Services | Realtor X Bahria Town',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/commercial_bahria_hub_1790600954734.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Brokerage & Advisory Services | Realtor X Bahria Town',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/commercial_bahria_hub_1790600954734.jpg',
    canonicalPath: '/#services',
    schemaType: 'RealEstateAgent',
  }),

  contact: () => ({
    title: 'Contact Realtor X — Bahria Town Karachi Headquarters',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Visit our central office at Jinnah Avenue Commercial, Precinct 1, Bahria Town Karachi, or reach our consultants via 24/7 WhatsApp.`,
    ogTitle: 'Contact Realtor X — Bahria Town Karachi Headquarters',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/bahria_town_karachi_1790600916751.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Contact Realtor X — Bahria Town Karachi Headquarters',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/bahria_town_karachi_1790600916751.jpg',
    canonicalPath: '/#contact',
    schemaType: 'ContactPage',
  }),

  manifesto: () => ({
    title: 'The RealtorX Manifesto — Why We Exist | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} The foundational manifesto of Realtor X: ending client exploitation, restoring dealer dignity, and building a culture of honor in Bahria Town.`,
    ogTitle: 'The RealtorX Manifesto — Why We Exist | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/realtorx_engraved_wall_1790597184603.jpg',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    twitterTitle: 'The RealtorX Manifesto — Why We Exist | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/realtorx_engraved_wall_1790597184603.jpg',
    canonicalPath: '/#manifesto',
    schemaType: 'Article',
  }),

  oath: () => ({
    title: 'Founding Member Oath — Digital Signature | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Swear the RealtorX Founding Member Oath. Receive your verified digital certificate, lock in the 40/60 split, and sync directly with ERPNext.`,
    ogTitle: 'The RealtorX Founding Member Oath | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/realtorx_founding_ceremony_1790597198456.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'The RealtorX Founding Member Oath | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/realtorx_founding_ceremony_1790597198456.jpg',
    canonicalPath: '/#oath',
    schemaType: 'RealEstateAgent',
  }),

  code: () => ({
    title: 'The RealtorX Code — 8 Ethical Principles | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} The 8 behavioral tenets of Realtor X: Integrity First, Collaboration, Solutions Over Excuses, Respect, and Leaving the Industry Better.`,
    ogTitle: 'The RealtorX Code — 8 Ethical Principles | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/realtorx_hub_atrium_1790597209570.jpg',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    twitterTitle: 'The RealtorX Code — 8 Ethical Principles | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/realtorx_hub_atrium_1790597209570.jpg',
    canonicalPath: '/#code',
    schemaType: 'Article',
  }),

  portal: () => ({
    title: 'Customer Portal & Allotment Vault | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Access your customer dashboard: view confirmed Bahria Town bookings, active deals, installment payment schedules, NOCs, and site visits.`,
    ogTitle: 'Customer Portal & Allotment Vault | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/villa_bahria_luxury_1790600936792.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Customer Portal & Allotment Vault | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/villa_bahria_luxury_1790600936792.jpg',
    canonicalPath: '/#portal',
    schemaType: 'WebSite',
  }),

  dealer: () => ({
    title: 'Dealer Portal & 60% Commission Hub | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Certified Realtor X Dealer Hub: track quarterly targets, manage CRM leads, review deals, check commission balance, and request payouts.`,
    ogTitle: 'Dealer Portal & 60% Commission Hub | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/realtorx_hub_atrium_1790597209570.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Dealer Portal & 60% Commission Hub | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/realtorx_hub_atrium_1790597209570.jpg',
    canonicalPath: '/#dealer',
    schemaType: 'WebSite',
  }),

  'become-dealer': () => ({
    title: 'Become a Partner Dealer — 60% Split | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Join Realtor X as a partner dealer in Bahria Town Karachi. 8-step verification, transparent 40/60 split, verified leads, and instant ERPNext ID.`,
    ogTitle: 'Become a Partner Dealer — 60% Split | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/realtorx_founding_ceremony_1790597198456.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Become a Partner Dealer — 60% Split | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/realtorx_founding_ceremony_1790597198456.jpg',
    canonicalPath: '/#become-dealer',
    schemaType: 'RealEstateAgent',
  }),

  community: () => ({
    title: 'Custodians Wall of Honor — Verified Members | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Meet the founding members and certified custodians of Realtor X who have sworn the sacred oath to uphold ethical real estate in Pakistan.`,
    ogTitle: 'Custodians Wall of Honor — Verified Members | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/realtorx_engraved_wall_1790597184603.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Custodians Wall of Honor — Verified Members | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/realtorx_engraved_wall_1790597184603.jpg',
    canonicalPath: '/#community',
    schemaType: 'CollectionPage',
  }),

  erpnext: () => ({
    title: 'ERPNext REST API Integration Hub | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Connect and monitor ERPNext REST API integration for real-time dealer creation, KYC sync, and leads management on port 8000.`,
    ogTitle: 'ERPNext REST API Integration Hub | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: '/src/assets/images/realtorx_hub_atrium_1790597209570.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'ERPNext REST API Integration Hub | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: '/src/assets/images/realtorx_hub_atrium_1790597209570.jpg',
    canonicalPath: '/#erpnext',
    schemaType: 'WebSite',
  }),

  signup: () => ({
    title: 'Create Account | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Join the Realtor X community. Create your free account to browse verified properties in Bahria Town Karachi.`,
    ogTitle: 'Create Account | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: DEFAULT_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Create Account | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: DEFAULT_IMAGE,
    canonicalPath: '/#signup',
    schemaType: 'WebSite',
  }),

  login: () => ({
    title: 'Login | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Login to your Realtor X account to access your dashboard, bookings, and property inquiries.`,
    ogTitle: 'Login | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: DEFAULT_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Login | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: DEFAULT_IMAGE,
    canonicalPath: '/#login',
    schemaType: 'WebSite',
  }),

  profile: () => ({
    title: 'My Profile | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Manage your Realtor X profile, roles, and account settings.`,
    ogTitle: 'My Profile | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: DEFAULT_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'My Profile | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: DEFAULT_IMAGE,
    canonicalPath: '/#profile',
    schemaType: 'WebSite',
  }),

  'become-customer': () => ({
    title: 'Become a Customer | Realtor X',
    description: `${REALTORX_PHILOSOPHY_QUOTE} Register as a Realtor X customer to book properties, track payments, and manage your investments.`,
    ogTitle: 'Become a Customer | Realtor X',
    ogDescription: REALTORX_PHILOSOPHY_QUOTE,
    ogImage: DEFAULT_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Become a Customer | Realtor X',
    twitterDescription: REALTORX_PHILOSOPHY_QUOTE,
    twitterImage: DEFAULT_IMAGE,
    canonicalPath: '/#become-customer',
    schemaType: 'WebSite',
  }),
};

/**
 * Updates DOM head tags for SEO, Open Graph, Twitter Cards, and Schema.org JSON-LD
 */
export function applyPageSEO(pageId: PageId, property?: Property): PageSEOMetadata {
  const getMetadata = PAGE_SEO_MAP[pageId] || PAGE_SEO_MAP.home;
  const metadata = getMetadata(property);

  if (typeof document === 'undefined') return metadata;

  // 1. Document Title
  document.title = metadata.title;

  // Helpers to set or create meta tag
  const setMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const origin = window.location.origin;
  const fullUrl = `${origin}${metadata.canonicalPath}`;
  const fullImageUrl = metadata.ogImage.startsWith('http')
    ? metadata.ogImage
    : `${origin}${metadata.ogImage}`;

  // 2. Primary Meta Tags
  setMeta('name', 'description', metadata.description);
  setMeta('name', 'title', metadata.title);
  setMeta('name', 'author', 'Realtor X Pakistan');
  setMeta('name', 'robots', 'index, follow');

  // 3. Open Graph Tags
  setMeta('property', 'og:type', metadata.ogType);
  setMeta('property', 'og:site_name', 'Realtor X');
  setMeta('property', 'og:title', metadata.ogTitle);
  setMeta('property', 'og:description', metadata.ogDescription);
  setMeta('property', 'og:url', fullUrl);
  setMeta('property', 'og:image', fullImageUrl);
  setMeta('property', 'og:image:alt', metadata.ogTitle);
  setMeta('property', 'og:locale', 'en_PK');

  // 4. Twitter Tags
  setMeta('name', 'twitter:card', metadata.twitterCard);
  setMeta('name', 'twitter:site', '@RealtorX_PK');
  setMeta('name', 'twitter:creator', '@RealtorX_PK');
  setMeta('name', 'twitter:title', metadata.twitterTitle);
  setMeta('name', 'twitter:description', metadata.twitterDescription);
  setMeta('name', 'twitter:image', fullImageUrl);
  setMeta('name', 'twitter:image:alt', metadata.twitterTitle);

  // 5. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', fullUrl);

  // 6. JSON-LD Structured Data
  let jsonLdEl = document.getElementById('realtorx-ld-json') as HTMLScriptElement | null;
  if (!jsonLdEl) {
    jsonLdEl = document.createElement('script');
    jsonLdEl.id = 'realtorx-ld-json';
    jsonLdEl.type = 'application/ld+json';
    document.head.appendChild(jsonLdEl);
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': metadata.schemaType,
    name: metadata.ogTitle,
    headline: metadata.ogTitle,
    description: metadata.description,
    image: fullImageUrl,
    url: fullUrl,
    publisher: {
      '@type': 'RealEstateAgent',
      name: 'Realtor X',
      url: origin,
      slogan: REALTORX_PHILOSOPHY_QUOTE,
      telephone: '+92 300 8472910',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Jinnah Avenue Commercial, Precinct 1',
        addressLocality: 'Bahria Town Karachi',
        addressRegion: 'Sindh',
        postalCode: '75340',
        addressCountry: 'PK'
      }
    }
  };

  jsonLdEl.textContent = JSON.stringify(structuredData, null, 2);

  return metadata;
}
