// Marketplace data: public search (guest) and the signed-in user's own listings.
import { callGet } from '../../services/api/client';

export interface PublicListing {
  name: string;
  property_title: string;
  purpose: 'Sell' | 'Rent' | null;
  custom_property_category: string | null;
  category_group: 'Home' | 'Plots' | 'Commercial' | null;
  property_type: string | null;
  custom_description?: string | null;
  status: string;
  project: string | null;
  project_name: string;
  city: string | null;
  location_area: string | null;
  size: number | null;
  size_unit: string | null;
  list_price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  is_studio: number;
  installment_available: number;
  /** In Featured Listings: the label RealtorX gave it (e.g. "New launch"), or null. */
  featured_badge?: string | null;
  ready_for_possession: number;
  latitude: number | null;
  longitude: number | null;
  map_link: string | null;
  listing_type: string | null;
  images: string[];
  cover_image: string | null;
  videos?: string[];
  amenities?: string[];
  has_tour?: boolean;
  /** The unit is on its project's live 3D model (interior: it also has a 3D apartment to explore). */
  unit_3d?: { project: string; interior: boolean } | null;
  /** The unit's project: its unit type and that type's floor plan, a project card, nearby places and location. */
  project_context?: {
    type: string;
    floor_plan?: { title: string; image: string } | null;
    project: { name: string; project_name: string; city?: string | null; status?: string | null; completion?: string | null; cover_image?: string | null;
      developer?: string | null; developer_logo?: string | null; units: number; available: number; type_units: number; type_available: number };
    nearby: { place: string; kind: string; distance?: string | null }[];
    location: { latitude?: number | null; longitude?: number | null; map_link?: string | null; address?: string | null; city?: string | null };
  } | null;
  payment_plan?: PaymentPlan | null;
  creation: string;
}

export interface SearchResult {
  items: PublicListing[];
  total: number;
  page: number;
  page_length: number;
}

export interface SearchFilters {
  purpose?: string;
  group?: string;
  category?: string;
  city?: string;
  location?: string;
  min_price?: string;
  max_price?: string;
  min_area?: string;
  max_area?: string;
  area_unit?: string;
  beds?: string;
  baths?: string;
  installment?: string;
  possession?: string;
  sort?: string;
  page?: number;
  project?: string;
}

export interface PaymentPlanLine {
  label: string;
  percent: number;
  kind: 'One-time' | 'Installments';
  installments: number;
  every_months: number;
  due_after_days: number;
  on_possession: number;
}

export interface PaymentPlan {
  name: string;
  summary: string;
  lines: PaymentPlanLine[];
}

/** Amount of one plan line for a price (installments: the amount of each installment). */
export function planLineAmount(price: number | null | undefined, line: PaymentPlanLine): number | null {
  if (!price) return null;
  const total = (price * line.percent) / 100;
  return line.kind === 'Installments' && line.installments ? total / line.installments : total;
}

export interface FormOptions {
  purposes: string[];
  category_groups: Record<string, string[]>;
  area_units: string[];
  amenities: Record<string, string[]>;
  cities: string[];
}

export const getFormOptions = () => callGet<FormOptions>('realtor_x.api.v1.get_search_options');
export const searchListings = (filters: SearchFilters) =>
  callGet<SearchResult>('realtor_x.api.v1.get_public_properties', { page_length: 24, ...filters });
export const getFeatured = () => callGet<PublicListing[]>('realtor_x.api.v1.get_featured_properties').then((r) => r || []);
export const getListing = (id: string) =>
  callGet<PublicListing>('realtor_x.api.v1.get_public_property_details', { property_id: id });

// ── Formatting ───────────────────────────────────────────────────────────

export function formatPrice(price: number | null | undefined, purpose?: string | null): string {
  if (!price) return 'Price on request';
  let text: string;
  if (price >= 10_000_000) text = `PKR ${(price / 10_000_000).toFixed(2).replace(/\.?0+$/, '')} Crore`;
  else if (price >= 100_000) text = `PKR ${(price / 100_000).toFixed(2).replace(/\.?0+$/, '')} Lakh`;
  else text = `PKR ${Math.round(price).toLocaleString('en-PK')}`;
  return purpose === 'Rent' ? `${text} / month` : text;
}

export function formatArea(size: number | null | undefined, unit: string | null | undefined): string {
  if (!size) return '';
  const n = Number.isInteger(size) ? String(size) : size.toFixed(1);
  return `${n} ${unit || ''}`.trim();
}

export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  const parts = clean.split('/');
  const file = parts.pop() || '';
  return [...parts, encodeURIComponent(decodeURIComponent(file))].join('/');
}

export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{6,20})/);
  return m ? m[1] : null;
}

export function mapEmbedUrl(listing: { latitude: number | null; longitude: number | null; location_area?: string | null; city?: string | null }): string | null {
  if (listing.latitude != null && listing.longitude != null && (listing.latitude !== 0 || listing.longitude !== 0)) {
    return `https://maps.google.com/maps?q=${listing.latitude},${listing.longitude}&z=15&output=embed`;
  }
  const q = [listing.location_area, listing.city].filter(Boolean).join(', ');
  return q ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=13&output=embed` : null;
}

export const LISTING_STATUS_TONE: Record<string, string> = {
  Draft: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  'Pending Review': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Declined: 'bg-red-500/15 text-red-300 border-red-500/30',
  Withdrawn: 'bg-slate-600/15 text-slate-400 border-slate-600/30',
};

export const LISTING_STATUS_LABEL: Record<string, string> = {
  Approved: 'Live',
  'Pending Review': 'Under review',
  Declined: 'Needs changes',
};
