export type PageId =
  | 'home'
  | 'properties'
  | 'property-detail'
  | 'projects'
  | 'about'
  | 'services'
  | 'contact'
  | 'manifesto'
  | 'oath'
  | 'code'
  | 'become-dealer'
  | 'community'
  | 'erpnext';

export type Language = 'en' | 'ur';

export type PropertyCategory = 'Residential Plot' | 'Commercial Plot' | 'Luxury Villa' | 'Apartment' | 'Commercial Shop' | 'Farm House';
export type PropertyStatus = 'Available' | 'Under Offer' | 'Sold' | 'Hot Deal';

export interface Property {
  id: string;
  erpCode?: string;
  title: string;
  titleUrdu?: string;
  category: PropertyCategory;
  project: string;
  precinct: string;
  location: string;
  pricePkr: number; // in PKR
  priceFormatted: string; // e.g. "PKR 1.45 Crore"
  size: number;
  sizeUnit: 'Sq. Yards' | 'Sq. Feet' | 'Marla' | 'Kanal';
  bedrooms?: number;
  bathrooms?: number;
  ownership: 'Freehold' | 'Allotment' | 'Possession Available' | 'Transfer Ready';
  status: PropertyStatus;
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
    photo?: string;
  };
  commissionSplit: string; // e.g. "40% Realtor X / 60% Dealer"
  dateAdded: string;
}

export interface ProjectInfo {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  location: string;
  description: string;
  heroImage: string;
  totalProperties: number;
  status: 'Established' | 'Possession Handed Over' | 'Rapid Development' | 'New Precinct';
  precincts: string[];
  keyHighlights: string[];
}

export interface SiteVisitLead {
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  preferredDate: string;
  preferredTimeSlot: string;
  notes?: string;
  source: 'Realtor X Web';
}

export interface DealerApplication {
  fullName: string;
  agencyName: string;
  city: string;
  areaFocus: string; // e.g. Bahria Town Karachi, DHA, etc.
  phone: string;
  whatsapp: string;
  email: string;
  licenseNumber?: string;
  experienceYears: string;
  agreedToSplit: boolean; // 40/60 split agreement
  agreedToOath: boolean;
  notes?: string;
}

export interface PropertyListingSubmission {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  category: PropertyCategory;
  project: string;
  precinct: string;
  plotOrHouseNo: string;
  size: string;
  askingPrice: string;
  statusDetails: string;
  ownershipType: string;
  notes?: string;
}

// ═══════════════════════════════════════════════════════
// MEMBER PORTAL TYPES
// ═══════════════════════════════════════════════════════

export interface MemberProfile {
  name: string;
  member_id: string;
  full_name: string;
  firm_name?: string;
  role: string;
  city: string;
  email: string;
  phone?: string;
  license_no?: string;
  membership_tier: string;
  oath_accepted: boolean;
  code_agreed: boolean;
  oath_date?: string;
  custodian_hash?: string;
  bio?: string;
  referral_code?: string;
  total_earnings?: number;
  pending_earnings?: number;
  properties_listed_count?: number;
}

export interface MemberReferral {
  name: string;
  member: string;
  lead?: string;
  customer?: string;
  deal?: string;
  property?: string;
  referral_date: string;
  sale_value?: number;
  realtorx_commission?: number;
  referral_rate?: number;
  referral_fee?: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'Cancelled';
  approved_by?: string;
  paid_date?: string;
  payment_reference?: string;
  notes?: string;
}

export interface MemberPayout {
  name: string;
  member: string;
  period_from: string;
  period_to: string;
  total_referral_fees?: number;
  deductions?: number;
  net_payable?: number;
  payment_date?: string;
  payment_mode?: string;
  payment_reference?: string;
  bank_account?: string;
  status: 'Draft' | 'Approved' | 'Paid' | 'Cancelled';
  approved_by?: string;
  notes?: string;
}

export interface MemberProperty {
  name: string;
  property_title: string;
  custom_property_category?: string;
  status: string;
  list_price: number;
  size: number;
  size_unit: string;
  location?: string;
  listed_by_member?: string;
}
