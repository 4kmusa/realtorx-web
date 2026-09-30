// ═══════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════

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
  | 'portal'
  | 'dealer'
  | 'become-dealer'
  | 'become-customer'
  | 'community'
  | 'erpnext'
  | 'signup'
  | 'login'
  | 'profile';

export type Language = 'en' | 'ur';

export type ViewMode =
  | 'grid'
  | 'list'
  | 'manifesto'
  | 'philosophy'
  | 'oath'
  | 'code'
  | 'members'
  | 'erpnext';

// ═══════════════════════════════════════════════════════
// PROPERTY TYPES
// ═══════════════════════════════════════════════════════

export type PropertyCategory =
  | 'Residential Plot'
  | 'Commercial Plot'
  | 'Luxury Villa'
  | 'Apartment'
  | 'Commercial Shop'
  | 'Farm House';

export type PropertyStatus = 'Available' | 'Under Offer' | 'Sold' | 'Hot Deal';

export interface Property {
  id: string;
  erpCode?: string;
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
    photo?: string;
  };
  commissionSplit: string;
  dateAdded: string;
  listed_by_member?: string;
  listing_type?: string;
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
  status:
    | 'Established'
    | 'Possession Handed Over'
    | 'Rapid Development'
    | 'New Precinct';
  precincts: string[];
  keyHighlights: string[];
}

// ═══════════════════════════════════════════════════════
// LEAD & APPLICATION TYPES
// ═══════════════════════════════════════════════════════

export interface SiteVisitLead {
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  preferredDate: string;
  preferredTimeSlot: string;
  notes?: string;
  source: string;
  referred_by_member?: string;
  referral_code?: string;
}

export interface DealerApplication {
  fullName: string;
  agencyName: string;
  city: string;
  areaFocus: string;
  phone: string;
  whatsapp: string;
  email: string;
  licenseNumber?: string;
  experienceYears: string;
  agreedToSplit: boolean;
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
// MEMBER / CULTURE TYPES
// ═══════════════════════════════════════════════════════

export interface MemberRecord {
  id: string;
  memberNumber: string;
  fullName: string;
  firmName: string;
  role: string;
  city: string;
  email: string;
  phone?: string;
  licenseNo?: string;
  tier: string;
  oathAccepted: boolean;
  codeAgreed: boolean;
  joinedAt: string;
  bio?: string;
  erpnextStatus?: string;
  erpnextDocId?: string;
  signatureHash?: string;
  signatureData?: string;
}

export interface ERPNextConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  doctype: string;
  autoSync: boolean;
  customWebhookUrl?: string;
  fieldMapping: Record<string, string>;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  memberId: string;
  memberName: string;
  action: 'create' | 'update' | 'sync' | 'error';
  status: 'success' | 'failed' | 'pending';
  message: string;
  payload?: Record<string, unknown>;
}

export interface CodeTenetDilemma {
  situation: string;
  unethicalMove: string;
  realtorxWay: string;
}

export interface CodeTenet {
  id: string;
  number: string;
  title: string;
  titleUrdu?: string;
  motto: string;
  mottoUrdu?: string;
  description?: string;
  explanation?: string;
  explanationUrdu?: string;
  inPractice: string;
  inPracticeUrdu?: string;
  dilemma?: CodeTenetDilemma;
  icon?: string;
  color?: string;
}

// ═══════════════════════════════════════════════════════
// AUTH TYPES
// ═══════════════════════════════════════════════════════

export interface AuthUser {
  email: string;
  full_name: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  user_image?: string;
  roles: string[];
  is_customer: boolean;
  is_dealer: boolean;
  is_website_user: boolean;
}

export interface SignupData {
  email: string;
  full_name: string;
  phone: string;
  password: string;
}

// ═══════════════════════════════════════════════════════
// CUSTOMER PORTAL TYPES
// ═══════════════════════════════════════════════════════

export interface CustomerUser {
  id: string;
  name?: string;
  full_name?: string;
  fullName?: string;
  email: string;
  phone?: string;
  cnic?: string;
  city?: string;
  address?: string;
  nomineeName?: string;
  nomineeCnic?: string;
  nomineeRelation?: string;
}

export interface CustomerBooking {
  id: string;
  name?: string;
  bookingRef?: string;
  bookingDate?: string;
  booking_date?: string;
  property?: string;
  property_title?: string;
  propertyTitle?: string;
  precinct?: string;
  category?: string;
  type?: string;
  totalPricePkr?: number;
  tokenPaidPkr?: number;
  sale_price?: number;
  booking_amount?: number;
  status: string;
}

export interface CustomerDeal {
  id: string;
  name?: string;
  dealNumber?: string;
  dealDate?: string;
  deal_date?: string;
  property?: string;
  property_title?: string;
  propertyTitle?: string;
  category?: string;
  precinct?: string;
  closingAgent?: string;
  agentPhone?: string;
  net_sale_value?: number;
  totalAmountPkr?: number;
  company_commission?: number;
  dealer_commission?: number;
  status: string;
}

export interface PaymentScheduleItem {
  id: string;
  name?: string;
  installment_number?: number;
  milestone?: string;
  due_date?: string;
  dueDate?: string;
  amount?: number;
  amountPkr?: number;
  paid_amount?: number;
  receiptNo?: string;
  status:
    | 'Pending'
    | 'Partially Paid'
    | 'Paid'
    | 'Overdue'
    | 'Cancelled'
    | 'Upcoming';
}

export interface PaymentHistoryItem {
  id: string;
  name?: string;
  receiptNo?: string;
  transactionRef?: string;
  date?: string;
  amount?: number;
  amountPkr?: number;
  payment_date?: string;
  payment_mode?: string;
  paymentMethod?: string;
  reference_number?: string;
}

export interface CustomerDocument {
  id: string;
  name?: string;
  title?: string;
  docType?: string;
  dateIssued?: string;
  fileSize?: string;
  document_type?: string;
  file_url?: string;
  uploaded_at?: string;
}

export interface SiteVisitRecord {
  id: string;
  name?: string;
  customer?: string;
  customer_name?: string;
  property?: string;
  property_title?: string;
  propertyTitle?: string;
  precinct?: string;
  dealer?: string;
  agentName?: string;
  date?: string;
  timeSlot?: string;
  visit_date?: string;
  visit_time?: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'No-Show' | 'Cancelled';
  outcome?: string;
  follow_up_date?: string;
}

// ═══════════════════════════════════════════════════════
// DEALER PORTAL TYPES
// ═══════════════════════════════════════════════════════

export interface DealerUser {
  name: string;
  full_name: string;
  email: string;
  phone?: string;
  cnic?: string;
  city?: string;
  agency?: string;
  commission_plan?: string;
  availability?: string;
  service_radius_km?: number;
}

export interface DealerLead {
  name: string;
  lead_name: string;
  phone: string;
  email?: string;
  city?: string;
  budget?: number;
  status: string;
  priority?: string;
  next_followup_date?: string;
  notes?: string;
}

export interface DealerDeal {
  name: string;
  property: string;
  property_title?: string;
  customer: string;
  customer_name?: string;
  deal_date: string;
  net_sale_value: number;
  dealer_commission: number;
  company_commission: number;
  status: string;
}

export interface CommissionLedgerEntry {
  name: string;
  deal: string;
  gross_commission: number;
  company_commission: number;
  dealer_commission: number;
  status: 'Earned' | 'Approved' | 'Payable' | 'Paid' | 'Held';
  approved_by?: string;
  payment_reference?: string;
}

export interface DealerPayoutEntry {
  name: string;
  period_from: string;
  period_to: string;
  gross_payable: number;
  deductions: number;
  net_payable: number;
  payment_date?: string;
  status: 'Draft' | 'Approved' | 'Paid';
  payment_reference?: string;
}

export interface DealerTargetEntry {
  name: string;
  period_from: string;
  period_to: string;
  target_sales_value: number;
  target_deals_count: number;
  achieved_sales_value: number;
  achieved_deals_count: number;
}

export interface DealerTask {
  name: string;
  task_title: string;
  description?: string;
  due_date: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Overdue';
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
