// Marketplace data: public search (guest) and the signed-in user's own listings.
import { callGet, callPost, uploadFile } from '../../services/api/client';

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
  ready_for_possession: number;
  latitude: number | null;
  longitude: number | null;
  map_link: string | null;
  listing_type: string | null;
  images: string[];
  cover_image: string | null;
  realtor: { id: string; name: string | null; member_id: string | null; firm_name: string | null } | null;
  videos?: string[];
  amenities?: string[];
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

export interface FormOptions {
  purposes: string[];
  category_groups: Record<string, string[]>;
  area_units: string[];
  amenities: Record<string, string[]>;
  cities: string[];
  max_images: number;
  max_upload_mb: number;
  listing_as: string | null;
  is_realtor: boolean;
  developer_projects: { name: string; project_name: string }[];
}

export interface RealtorChoice {
  member: string;
  member_id: string | null;
  full_name: string;
  firm_name: string | null;
  member_type: string;
  city: string | null;
  areas_served: string | null;
  experience_years: number | null;
}

export interface ListingImage {
  name: string;
  image: string;
  is_cover: number;
}

export interface MyListing {
  name: string;
  listing_status: string;
  decline_reason: string | null;
  status: string;
  purpose: string;
  category: string;
  city: string;
  location_area: string;
  address_line: string | null;
  latitude: number | null;
  longitude: number | null;
  map_link: string | null;
  size: number;
  size_unit: string;
  price: number;
  installment_available: number;
  ready_for_possession: number;
  is_studio: number;
  bedrooms: number;
  bathrooms: number;
  title: string;
  description: string;
  amenities: string[];
  videos: string[];
  images: ListingImage[];
  contact_email: string | null;
  contact_mobile: string | null;
  contact_landline: string | null;
  realtor_preference: string;
  requested_realtor: string | null;
  tagged_realtor_name: string | null;
  project: string | null;
  interest_count: number | null;
}

export interface MyListingRow {
  name: string;
  property_title: string;
  listing_status: string;
  decline_reason: string | null;
  purpose: string;
  custom_property_category: string;
  city: string;
  location_area: string;
  list_price: number;
  size: number;
  size_unit: string;
  status: string;
  interest_count: number | null;
  cover_image: string | null;
  creation: string;
}

export const searchListings = (filters: SearchFilters) =>
  callGet<SearchResult>('realtor_x.api.v1.get_public_properties', { page_length: 24, ...filters });
export const getListing = (id: string) =>
  callGet<PublicListing>('realtor_x.api.v1.get_public_property_details', { property_id: id });
export const getFormOptions = () => callGet<FormOptions>('realtor_x.api.listings.get_listing_form_options');
export const getRealtorChoices = (city?: string, search?: string) =>
  callGet<RealtorChoice[]>('realtor_x.api.listings.get_realtor_choices', { city, search });
export const getMyListings = () => callGet<MyListingRow[]>('realtor_x.api.listings.get_my_listings');
export const getMyListing = (name: string) => callGet<MyListing>('realtor_x.api.listings.get_my_listing', { name });
export const saveListing = (data: Record<string, unknown>, name?: string | null) =>
  callPost<{ name: string; listing_status: string }>('realtor_x.api.listings.save_listing', { ...data, name: name || undefined });
export const submitListing = (name: string) => callPost<{ listing_status: string }>('realtor_x.api.listings.submit_listing', { name });
export const withdrawListing = (name: string) => callPost('realtor_x.api.listings.withdraw_listing', { name });
export const markListingSold = (name: string) => callPost('realtor_x.api.listings.mark_listing_sold', { name });
export const uploadListingImage = (name: string, file: File) =>
  uploadFile<{ images: ListingImage[] }>('realtor_x.api.listings.upload_listing_image', file, { name });
export const removeListingImage = (name: string, row: string) =>
  callPost<{ images: ListingImage[] }>('realtor_x.api.listings.remove_listing_image', { name, row });
export const setListingCover = (name: string, row: string) =>
  callPost<{ images: ListingImage[] }>('realtor_x.api.listings.set_listing_cover', { name, row });

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
