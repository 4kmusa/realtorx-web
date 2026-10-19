// src/services/propertyService.ts
// Property Service - public website data from the RealtorX guest API (realtor_x.api.v1).
// Guests call these endpoints anonymously; the server decides what is published.

import { callGet } from './api/client';

const NO_IMAGE_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
      '<rect width="400" height="300" fill="#f3f4f6"/>' +
      '<text x="50%" y="50%" font-family="sans-serif" font-size="18" ' +
      'fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">No Image</text>' +
    '</svg>'
  );

// ═══════════════════════════════════════════════════════
// ERPNext Raw Property
// ═══════════════════════════════════════════════════════
export interface ERPProperty {
  name: string;
  property_title?: string;
  property_type?: string;
  custom_property_category?: string;
  custom_description?: string;
  custom_features?: string;
  custom_image_1?: string;
  custom_image_2?: string;
  custom_image_3?: string;
  custom_ownership?: string;
  status?: string;
  project?: string;
  size?: number;
  size_unit?: string;
  list_price?: number;
  source?: string;
  listing_type?: string;
  listed_by_member?: string;
  creation?: string;
}

// ═══════════════════════════════════════════════════════
// Frontend Property
// ═══════════════════════════════════════════════════════
export interface Property {
  id: string;
  erpCode: string;
  title: string;
  titleUrdu?: string;
  category: string;
  project: string;
  precinct: string;
  location: string;
  pricePkr: number;
  priceFormatted: string;
  size: number;
  sizeUnit: string;
  bedrooms?: number;
  bathrooms?: number;
  ownership: string;
  status: string;
  isFeatured: boolean;
  images: string[];
  description: string;
  features: string[];
  dealer: {
    name: string;
    firm: string;
    phone: string;
    whatsapp: string;
    isVerified: boolean;
  };
  commissionSplit: string;
  dateAdded: string;
  listed_by_member?: string;
  listing_type?: string;
}

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) return 'Price on Request';
  if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(2)} Crore`;
  if (price >= 100000) return `PKR ${(price / 100000).toFixed(2)} Lakh`;
  return `PKR ${price.toLocaleString()}`;
}

function getCategoryLabel(cat: string | undefined): string {
  if (!cat) return 'Property';
  const map: Record<string, string> = {
    'Residential Plot': 'Residential Plot',
    'Commercial Plot': 'Commercial Plot',
    House: 'House',
    Flat: 'Apartment',
    Shop: 'Commercial Shop',
    'Agricultural Land': 'Agricultural Land',
  };
  return map[cat] || cat;
}

function resolveImageUrl(path: string | undefined | null): string | null {
  if (!path || !path.trim()) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // Encode special chars (spaces) in filename part only
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  try {
    const parts = cleanPath.split('/');
    const filename = parts.pop() || '';
    cleanPath = [...parts, encodeURIComponent(filename)].join('/');
  } catch {
    // use raw path if encoding fails
  }
  return cleanPath;
}

function extractPrecinct(title: string | undefined): string {
  if (!title) return '';
  const precinctMatch = title.match(/Precinct\s+[\w-]+/i);
  if (precinctMatch) return precinctMatch[0];
  const btkMatch = title.match(/BTK-\d+/i);
  if (btkMatch) return btkMatch[0];
  const towerMatch = title.match(/Tower\s+[A-Z]/i);
  if (towerMatch) return towerMatch[0];
  if (title.toLowerCase().includes('jinnah avenue')) return 'Jinnah Avenue';
  return '';
}

function isAvailable(status: string | undefined | null): boolean {
  if (!status) return false;
  return status.trim().toLowerCase() === 'available';
}

function splitLines(val: any): string[] {
  if (!val || typeof val !== 'string') return [];
  return val.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
}

/**
 * Strip HTML tags & entities from a string.
 * Handles Frappe's Quill editor output (<div class="ql-editor"><p>...</p></div>)
 */
function stripHtml(val: string | undefined | null): string {
  if (!val) return '';
  return String(val)
    // Replace block-level tags with newlines / spaces
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<li>/gi, '\n• ')
    // Remove all remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Cleanup multiple newlines / spaces
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

// ═══════════════════════════════════════════════════════
// ERPNext Raw Property
// ═══════════════════════════════════════════════════════
export interface ERPProperty {
  name: string;
  property_title?: string;
  property_type?: string;
  custom_property_category?: string;
  custom_description?: string;
  custom_features?: string;
  custom_image_1?: string;
  custom_image_2?: string;
  custom_image_3?: string;
  custom_ownership?: string;
  status?: string;
  project?: string;
  size?: number;
  size_unit?: string;
  list_price?: number;
  source?: string;
  listing_type?: string;
  listed_by_member?: string;
  creation?: string;
  project_name?: string;
  bedrooms?: number;
  bathrooms?: number;
}

// ═══════════════════════════════════════════════════════
// Frontend Property
// ═══════════════════════════════════════════════════════
export interface Property {
  id: string;
  erpCode: string;
  title: string;
  titleUrdu?: string;
  category: string;
  project: string;
  precinct: string;
  location: string;
  pricePkr: number;
  priceFormatted: string;
  size: number;
  sizeUnit: string;
  bedrooms?: number;
  bathrooms?: number;
  ownership: string;
  status: string;
  isFeatured: boolean;
  images: string[];
  description: string;
  features: string[];
  dealer: {
    name: string;
    firm: string;
    phone: string;
    whatsapp: string;
    isVerified: boolean;
  };
  commissionSplit: string;
  dateAdded: string;
  listed_by_member?: string;
  listing_type?: string;
}

// ═══════════════════════════════════════════════════════
// Transform Property
// ═══════════════════════════════════════════════════════
function transformProperty(p: ERPProperty, projectMap?: Map<string, string>): Property {
  const precinct = extractPrecinct(p.property_title);
  const projectDisplayName = p.project ? projectMap?.get(p.project) || p.project : '';

  const realImages = [p.custom_image_1, p.custom_image_2, p.custom_image_3]
    .map(resolveImageUrl)
    .filter((u): u is string => u !== null);

  const images = realImages.length > 0 ? realImages : [NO_IMAGE_PLACEHOLDER];
  const features = splitLines(p.custom_features);

  return {
    id: p.name.toLowerCase().replace(/-/g, ''),
    erpCode: p.name,
    title: p.property_title || p.name,
    category: getCategoryLabel(p.custom_property_category),
    project: projectDisplayName,
    precinct: precinct,
    location: projectDisplayName || precinct || '',
    pricePkr: p.list_price || 0,
    priceFormatted: formatPrice(p.list_price),
    size: p.size || 0,
    sizeUnit: p.size_unit || '',
    bedrooms: p.bedrooms || undefined,
    bathrooms: p.bathrooms || undefined,
    ownership: p.custom_ownership || '',
    status: p.status || '',
    isFeatured: false,
    images: images,
    description: stripHtml(p.custom_description),
    features: features.map((f) => stripHtml(f)).filter((f) => f.length > 0),
    dealer: { name: '', firm: '', phone: '', whatsapp: '', isVerified: false },
    commissionSplit: '',
    dateAdded: p.creation ? p.creation.split(' ')[0] : '',
    listed_by_member: p.listed_by_member,
    listing_type: p.listing_type,
  };
}


// ═══════════════════════════════════════════════════════
// Fetch Properties (published + available)
// ═══════════════════════════════════════════════════════
interface PropertyPage {
  items: ERPProperty[];
  total: number;
  page: number;
  page_length: number;
}

function projectMapOf(rows: ERPProperty[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const r of rows) if (r.project) map.set(r.project, r.project_name || r.project);
  return map;
}

export async function fetchProperties(): Promise<Property[]> {
  try {
    const page = await callGet<PropertyPage>('realtor_x.api.v1.get_public_properties', { page_length: 100 });
    const rows = page?.items || [];
    const projectMap = projectMapOf(rows);
    return rows.filter((p) => isAvailable(p.status)).map((p) => transformProperty(p, projectMap));
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// Fetch Single Property
// ═══════════════════════════════════════════════════════
export async function fetchProperty(id: string): Promise<Property | null> {
  try {
    const raw = await callGet<ERPProperty>('realtor_x.api.v1.get_public_property_details', { property_id: id });
    return raw ? transformProperty(raw, projectMapOf([raw])) : null;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// Dealer Field Meta
// ═══════════════════════════════════════════════════════
export interface Dealer {
  id: string;
  memberId: string;
  name: string;
  firm: string;
  designation: string;
  city: string;
  phone: string;
  email: string;
  bio: string;
  tier: string;
  imageUrl: string | null;
}


// ═══════════════════════════════════════════════════════
// Approved dealers (public directory)
// ═══════════════════════════════════════════════════════
export async function fetchDealers(): Promise<Dealer[]> {
  try {
    const rows = await callGet<any[]>('realtor_x.api.v1.get_public_dealers');
    return (rows || []).map((r) => ({
      id: r.name,
      memberId: r.name,
      name: r.full_name || r.name,
      firm: r.company_name || (r.dealer_type === 'Individual' ? 'Independent Custodian' : ''),
      designation: r.designation || (r.dealer_type === 'Individual' ? 'Custodian Realtor' : 'Company Partner'),
      city: r.city || '',
      phone: r.phone ? String(r.phone) : '',
      email: r.email || '',
      bio: r.dealer_type === 'Company' ? r.company_name || '' : 'Independent Custodian',
      tier: r.dealer_type === 'Company' ? 'Company Partner' : 'Individual Dealer',
      imageUrl: r.profile_image ? resolveImageUrl(r.profile_image) : null,
    }));
  } catch (error) {
    console.error('Error fetching dealers:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// Dealer Application Status
// ═══════════════════════════════════════════════════════
export interface DealerApplication {
  id: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | '';
  reviewNotes: string;
  reviewedOn: string;
  submittedOn: string;
  fullName: string;
  firm: string;
  city: string;
  phone: string;
  email: string;
}


/** The signed-in user's own dealer application (the server ignores any email argument). */
export async function fetchMyDealerApplication(): Promise<DealerApplication | null> {
  try {
    const m = await callGet<any>('realtor_x.api.portal.get_my_dealer_application');
    if (!m) return null;
    return {
      id: m.id || '',
      status: m.status || 'Pending',
      reviewNotes: '',
      reviewedOn: '',
      submittedOn: m.submittedOn || '',
      fullName: m.fullName || '',
      firm: '',
      city: m.city || '',
      phone: '',
      email: '',
    };
  } catch {
    return null;
  }
}

/** @deprecated Use fetchMyDealerApplication(); kept for existing callers. */
export const fetchDealerApplicationByEmail = (_email: string) => fetchMyDealerApplication();

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  developer: string;
  projectType: string;
  city: string;
  address: string;
  location: string;
  status: string;
  launchDate?: string;
  completionDate?: string;
  heroImageUrl: string | null;
  keyHighlights: string[];
  precincts: string[];
  totalProperties: number;
}


export async function fetchProjects(): Promise<Project[]> {
  try {
    const rows = await callGet<any[]>('realtor_x.api.v1.get_public_projects');
    return (rows || []).map((r) => {
      const city = String(r.city || '').trim();
      const address = String(r.address || '').trim();
      return {
        id: r.name,
        name: r.project_name || r.name,
        tagline: r.custom_tagline || '',
        description: r.custom_description || '',
        developer: r.developer_name || '',
        projectType: r.project_type || '',
        city,
        address,
        location: [city, address].filter(Boolean).join(' · '),
        status: r.status || '',
        launchDate: r.launch_date || undefined,
        completionDate: r.expected_completion_date || undefined,
        heroImageUrl: resolveImageUrl(r.custom_hero_image || r.project_image),
        keyHighlights: splitLines(r.custom_key_highlights),
        precincts: splitLines(r.custom_precincts),
        totalProperties: r.available_units || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// Website Links
// ═══════════════════════════════════════════════════════
export interface WebsiteLink {
  id: string;
  label: string;
  route: string;
  extraId?: string;
  section: string;
  displayOrder: number;
}


// The "Website Link" DocType does not exist on the backend yet; navigation links are static.
export async function fetchWebsiteLinks(_section?: string): Promise<WebsiteLink[]> {
  return [];
}
