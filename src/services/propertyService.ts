// src/services/propertyService.ts
// Property Service - Fetches real data from ERPNext

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';
const API_KEY = import.meta.env.VITE_ERPNEXT_API_KEY || '';
const API_SECRET = import.meta.env.VITE_ERPNEXT_API_SECRET || '';

const API_BASE = import.meta.env.PROD ? '/api/erp' : `${ERPNEXT_URL}/api`;

// Use Vercel proxy in production, direct ERPNext in dev
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
  custom_bedrooms?: number;
  custom_bathrooms?: number;
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
  return `${ERPNEXT_URL}${path.startsWith('/') ? '' : '/'}${path}`;
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

function pickField(available: string[], candidates: string[]): string | null {
  for (const c of candidates) if (available.includes(c)) return c;
  return null;
}

function splitLines(val: any): string[] {
  if (!val || typeof val !== 'string') return [];
  return val.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
}

// ═══════════════════════════════════════════════════════
// Project Name Cache (RX Project) — for Property.project
// ═══════════════════════════════════════════════════════
let projectNameCache: Map<string, string> | null = null;

async function loadProjectNameCache(): Promise<Map<string, string>> {
  if (projectNameCache) return projectNameCache;
  const map = new Map<string, string>();

  try {
    const doctype = 'RX Project';
    let nameField: string | null = null;

    try {
      const metaRes = await fetch(
        `${API_BASE}/method/frappe.desk.form.load.getdoctype?doctype=${encodeURIComponent(doctype)}`,
        { headers: { Authorization: `token ${API_KEY}:${API_SECRET}`, Accept: 'application/json' } }
      );
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        const docs = metaData.docs || [];
        const main = docs.find((d: any) => d.name === doctype);
        const fieldnames = (main?.fields || [])
          .map((f: any) => f.fieldname)
          .filter((n: any) => typeof n === 'string' && n.length > 0);
        nameField = pickField(fieldnames, ['project_name', 'project_title', 'title']);
      }
    } catch {}

    const fields = ['name'];
    if (nameField) fields.push(nameField);

    const url =
      `${API_BASE}/resource/${encodeURIComponent(doctype)}` +
      `?fields=${encodeURIComponent(JSON.stringify(fields))}&limit_page_length=0`;

    const res = await fetch(url, {
      headers: { Authorization: `token ${API_KEY}:${API_SECRET}`, Accept: 'application/json' },
    });

    if (!res.ok) { projectNameCache = map; return map; }
    const data = await res.json();
    const rows: any[] = data.data || [];
    for (const r of rows) {
      const display = nameField && r[nameField] && String(r[nameField]).trim()
        ? String(r[nameField])
        : r.name;
      map.set(r.name, display);
    }
    projectNameCache = map;
    return map;
  } catch {
    projectNameCache = map;
    return map;
  }
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
    bedrooms: p.custom_bedrooms || undefined,
    bathrooms: p.custom_bathrooms || undefined,
    ownership: p.custom_ownership || '',
    status: p.status || '',
    isFeatured: false,
    images: images,
    description: p.custom_description?.trim() || '',
    features: features,
    dealer: { name: '', firm: '', phone: '', whatsapp: '', isVerified: false },
    commissionSplit: '',
    dateAdded: p.creation ? p.creation.split(' ')[0] : '',
    listed_by_member: p.listed_by_member,
    listing_type: p.listing_type,
  };
}

// ═══════════════════════════════════════════════════════
// Fetch All Properties — sirf Available
// ═══════════════════════════════════════════════════════
export async function fetchProperties(): Promise<Property[]> {
  try {
    const fields = [
      'name', 'property_title', 'property_type', 'custom_property_category',
      'custom_description', 'custom_features', 'custom_image_1', 'custom_image_2',
      'custom_image_3', 'custom_bedrooms', 'custom_bathrooms', 'custom_ownership',
      'status', 'project', 'size', 'size_unit', 'list_price', 'source',
      'listing_type', 'listed_by_member', 'creation',
    ];
    const filters = [['status', '=', 'Available']];

    const url =
      `${API_BASE}/resource/Property` +
      `?fields=${encodeURIComponent(JSON.stringify(fields))}` +
      `&filters=${encodeURIComponent(JSON.stringify(filters))}` +
      `&limit_page_length=100&order_by=creation+desc`;

    const [response, projectMap] = await Promise.all([
      fetch(url, {
        method: 'GET',
        headers: { Authorization: `token ${API_KEY}:${API_SECRET}`, Accept: 'application/json' },
      }),
      loadProjectNameCache(),
    ]);

    if (!response.ok) {
      console.error('Failed to fetch properties:', response.status, await response.text());
      return [];
    }
    const data = await response.json();
    const properties: ERPProperty[] = data.data || [];
    const availableOnly = properties.filter((p) => isAvailable(p.status));
    return availableOnly.map((p) => transformProperty(p, projectMap));
  } catch (error) {
    console.error('Error fetching properties from ERPNext:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// Fetch Single Property
// ═══════════════════════════════════════════════════════
export async function fetchProperty(id: string): Promise<Property | null> {
  try {
    const url = `${API_BASE}/resource/Property/${encodeURIComponent(id)}`;
    const [response, projectMap] = await Promise.all([
      fetch(url, {
        method: 'GET',
        headers: { Authorization: `token ${API_KEY}:${API_SECRET}`, Accept: 'application/json' },
      }),
      loadProjectNameCache(),
    ]);
    if (!response.ok) { console.error('Failed to fetch property:', response.status, id); return null; }
    const data = await response.json();
    const raw: ERPProperty = data.data;
    if (!isAvailable(raw.status)) return null;
    return transformProperty(raw, projectMap);
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

interface MemberFieldMeta {
  fieldnames: string[];
  labelMap: Map<string, string>;
}

let cachedMemberMeta: MemberFieldMeta | null = null;

async function getMemberFieldMeta(): Promise<MemberFieldMeta> {
  if (cachedMemberMeta) return cachedMemberMeta;
  const empty: MemberFieldMeta = { fieldnames: [], labelMap: new Map() };

  try {
    const url = `${API_BASE}/method/frappe.desk.form.load.getdoctype?doctype=${encodeURIComponent('RealtorX Member')}`;
    const res = await fetch(url, {
      headers: { Authorization: `token ${API_KEY}:${API_SECRET}`, Accept: 'application/json' },
    });
    if (!res.ok) { cachedMemberMeta = empty; return empty; }

    const data = await res.json();
    const docs = data.docs || [];
    const main = docs.find((d: any) => d.name === 'RealtorX Member');
    if (!main || !Array.isArray(main.fields)) { cachedMemberMeta = empty; return empty; }

    const fieldnames: string[] = [];
    const labelMap = new Map<string, string>();
    for (const f of main.fields) {
      const fn = f.fieldname;
      const label = f.label;
      if (typeof fn === 'string' && fn.length > 0) fieldnames.push(fn);
      if (typeof label === 'string' && typeof fn === 'string') {
        labelMap.set(label.trim().toLowerCase(), fn);
      }
    }
    cachedMemberMeta = { fieldnames, labelMap };
    return cachedMemberMeta;
  } catch {
    cachedMemberMeta = empty;
    return empty;
  }
}

function findMemberField(
  meta: MemberFieldMeta,
  labelCandidates: string[],
  fieldnameCandidates: string[]
): string | null {
  for (const label of labelCandidates) {
    const fn = meta.labelMap.get(label.trim().toLowerCase());
    if (fn) return fn;
  }
  for (const fn of fieldnameCandidates) {
    if (meta.fieldnames.includes(fn)) return fn;
  }
  return null;
}

// ═══════════════════════════════════════════════════════
// Fetch Dealers — sirf Approved/Active
// ═══════════════════════════════════════════════════════
export async function fetchDealers(): Promise<Dealer[]> {
  try {
    const doctype = 'RealtorX Member';
    const meta = await getMemberFieldMeta();
    if (meta.fieldnames.length === 0) return [];

    const nameField = findMemberField(meta, ['Full Name', 'Name'], ['full_name', 'member_name', 'dealer_name']);
    const firmField = findMemberField(meta, ['Agency / Firm Name', 'Firm Name', 'Firm'], ['firm_name', 'company']);
    const roleField = findMemberField(meta, ['Role in Real Estate', 'Role', 'Designation'], ['role', 'designation']);
    const cityField = findMemberField(meta, ['City / Region', 'City'], ['city']);
    const phoneField = findMemberField(meta, ['Phone / WhatsApp', 'Phone', 'WhatsApp'], ['phone', 'mobile_no']);
    const emailField = findMemberField(meta, ['Official Email', 'Email'], ['email', 'email_id']);
    const bioField = findMemberField(meta, ['Member Statement', 'Bio'], ['bio']);
    const tierField = findMemberField(meta, ['Membership Tier', 'Tier'], ['membership_tier', 'tier']);
    const idField = findMemberField(meta, ['Member Custodian ID', 'Member ID'], ['member_id', 'member_number']);
    const imageField = findMemberField(
      meta,
      ['Profile Image', 'Photo', 'Image'],
      ['custom_profile_image', 'profile_image', 'member_image', 'image', 'photo', 'dealer_image']
    );
    const statusField = findMemberField(
      meta,
      ['Application Status'],
      ['custom_application_status', 'application_status']
    );

    const fields: string[] = ['name'];
    const addIf = (f: string | null) => { if (f && !fields.includes(f)) fields.push(f); };
    addIf(nameField); addIf(firmField); addIf(roleField); addIf(cityField);
    addIf(phoneField); addIf(emailField); addIf(bioField); addIf(tierField);
    addIf(idField); addIf(imageField); addIf(statusField);

    // Sirf Approved ya Active dealers
    const filters: any[] = [];
    if (statusField) {
      filters.push([statusField, 'in', ['Approved', 'Active']]);
    }

    const url =
      `${API_BASE}/resource/${encodeURIComponent(doctype)}` +
      `?fields=${encodeURIComponent(JSON.stringify(fields))}` +
      (filters.length > 0 ? `&filters=${encodeURIComponent(JSON.stringify(filters))}` : '') +
      `&limit_page_length=12&order_by=creation+desc`;

    const res = await fetch(url, {
      headers: { Authorization: `token ${API_KEY}:${API_SECRET}`, Accept: 'application/json' },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const rows: any[] = data.data || [];

    return rows.map((r) => ({
      id: r.name,
      memberId: idField ? String(r[idField] || r.name) : r.name,
      name: nameField ? r[nameField] || r.name : r.name,
      firm: firmField ? r[firmField] || '' : '',
      designation: roleField ? r[roleField] || '' : '',
      city: cityField ? r[cityField] || '' : '',
      phone: phoneField ? String(r[phoneField] || '') : '',
      email: emailField ? r[emailField] || '' : '',
      bio: bioField ? r[bioField] || '' : '',
      tier: tierField ? r[tierField] || '' : '',
      imageUrl: imageField ? resolveImageUrl(r[imageField]) : null,
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

export async function fetchDealerApplicationByEmail(
  email: string
): Promise<DealerApplication | null> {
  if (!email) return null;

  try {
    const meta = await getMemberFieldMeta();

    const statusField = findMemberField(
      meta,
      ['Application Status'],
      ['custom_application_status', 'application_status']
    );
    const notesField = findMemberField(
      meta,
      ['Review Notes'],
      ['custom_review_notes', 'review_notes']
    );
    const reviewedField = findMemberField(
      meta,
      ['Reviewed On'],
      ['custom_reviewed_on', 'reviewed_on']
    );
    const nameField = findMemberField(meta, ['Full Name', 'Name'], ['full_name']);
    const firmField = findMemberField(meta, ['Agency / Firm Name', 'Firm Name'], ['firm_name']);
    const cityField = findMemberField(meta, ['City / Region', 'City'], ['city']);
    const phoneField = findMemberField(meta, ['Phone / WhatsApp', 'Phone'], ['phone']);
    const emailField = findMemberField(meta, ['Official Email', 'Email'], ['email']);

    const fields: string[] = ['name', 'creation'];
    const addIf = (f: string | null) => { if (f && !fields.includes(f)) fields.push(f); };
    addIf(statusField); addIf(notesField); addIf(reviewedField);
    addIf(nameField); addIf(firmField); addIf(cityField);
    addIf(phoneField); addIf(emailField);

    const filters = [['email', '=', email]];

    const url =
      `${API_BASE}/resource/RealtorX Member` +
      `?fields=${encodeURIComponent(JSON.stringify(fields))}` +
      `&filters=${encodeURIComponent(JSON.stringify(filters))}` +
      `&limit_page_length=1&order_by=creation+desc`;

    const res = await fetch(url, {
      headers: { Authorization: `token ${API_KEY}:${API_SECRET}`, Accept: 'application/json' },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const rows: any[] = data.data || [];
    if (rows.length === 0) return null;

    const r = rows[0];
    return {
      id: r.name,
      status: statusField ? r[statusField] || 'Pending' : 'Pending',
      reviewNotes: notesField ? r[notesField] || '' : '',
      reviewedOn: reviewedField ? r[reviewedField] || '' : '',
      submittedOn: r.creation || '',
      fullName: nameField ? r[nameField] || '' : '',
      firm: firmField ? r[firmField] || '' : '',
      city: cityField ? r[cityField] || '' : '',
      phone: phoneField ? String(r[phoneField] || '') : '',
      email: emailField ? r[emailField] || '' : '',
    };
  } catch (error) {
    console.error('Error fetching dealer application:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// Projects (RX Project) — label-based field detection
// ═══════════════════════════════════════════════════════
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

interface ProjectFieldMeta {
  fieldnames: string[];
  labelMap: Map<string, string>;
}

let cachedProjectMeta: ProjectFieldMeta | null = null;

async function getProjectFieldMeta(): Promise<ProjectFieldMeta> {
  if (cachedProjectMeta) return cachedProjectMeta;
  const empty: ProjectFieldMeta = { fieldnames: [], labelMap: new Map() };

  try {
    const url = `${API_BASE}/method/frappe.desk.form.load.getdoctype?doctype=${encodeURIComponent('RX Project')}`;
    const res = await fetch(url, {
      headers: { Authorization: `token ${API_KEY}:${API_SECRET}`, Accept: 'application/json' },
    });
    if (!res.ok) { cachedProjectMeta = empty; return empty; }

    const data = await res.json();
    const docs = data.docs || [];
    const main = docs.find((d: any) => d.name === 'RX Project');
    if (!main || !Array.isArray(main.fields)) { cachedProjectMeta = empty; return empty; }

    const fieldnames: string[] = [];
    const labelMap = new Map<string, string>();
    for (const f of main.fields) {
      const fn = f.fieldname;
      const label = f.label;
      if (typeof fn === 'string' && fn.length > 0) fieldnames.push(fn);
      if (typeof label === 'string' && typeof fn === 'string') {
        labelMap.set(label.trim().toLowerCase(), fn);
      }
    }
    cachedProjectMeta = { fieldnames, labelMap };
    return cachedProjectMeta;
  } catch {
    cachedProjectMeta = empty;
    return empty;
  }
}

function findProjectField(
  meta: ProjectFieldMeta,
  labelCandidates: string[],
  fieldnameCandidates: string[]
): string | null {
  for (const label of labelCandidates) {
    const fn = meta.labelMap.get(label.trim().toLowerCase());
    if (fn) return fn;
  }
  for (const fn of fieldnameCandidates) {
    if (meta.fieldnames.includes(fn)) return fn;
  }
  return null;
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const doctype = 'RX Project';
    const meta = await getProjectFieldMeta();
    if (meta.fieldnames.length === 0) return [];

    const nameField = findProjectField(meta, ['Project Name', 'Name', 'Title'], ['project_name', 'project_title', 'title']);
    const taglineField = findProjectField(meta, ['Tagline'], ['custom_tagline', 'tagline']);
    const descField = findProjectField(meta, ['Description'], ['custom_description', 'description']);
    const devField = findProjectField(meta, ['Developer/Owner', 'Developer', 'Owner'], ['developer_owner', 'developer', 'custom_developer_owner']);
    const typeField = findProjectField(meta, ['Project Type', 'Type'], ['project_type', 'type']);
    const cityField = findProjectField(meta, ['City'], ['city']);
    const addrField = findProjectField(meta, ['Address'], ['address']);
    const statusField = findProjectField(meta, ['Status'], ['status', 'project_status']);
    const launchField = findProjectField(meta, ['Launch Date'], ['launch_date']);
    const completionField = findProjectField(meta, ['Expected Completion Date', 'Completion Date'], ['expected_completion_date', 'completion_date']);
    const highlightsField = findProjectField(meta, ['Key Highlights', 'Highlights'], ['custom_key_highlights', 'key_highlights', 'highlights']);
    const precinctsField = findProjectField(meta, ['Precincts', 'Active Precincts'], ['custom_precincts', 'precincts', 'active_precincts']);
    const imageField = findProjectField(meta, ['Hero Image', 'Image', 'Project Image'], ['custom_hero_image', 'hero_image', 'image', 'project_image', 'cover_image']);

    const fields: string[] = ['name'];
    const addIf = (f: string | null) => { if (f && !fields.includes(f)) fields.push(f); };
    addIf(nameField); addIf(taglineField); addIf(descField); addIf(devField);
    addIf(typeField); addIf(cityField); addIf(addrField); addIf(statusField);
    addIf(launchField); addIf(completionField); addIf(highlightsField);
    addIf(precinctsField); addIf(imageField);

    const url =
      `${API_BASE}/resource/${encodeURIComponent(doctype)}` +
      `?fields=${encodeURIComponent(JSON.stringify(fields))}` +
      `&limit_page_length=0&order_by=creation+asc`;

    const [res, allProperties] = await Promise.all([
      fetch(url, {
        headers: { Authorization: `token ${API_KEY}:${API_SECRET}`, Accept: 'application/json' },
      }),
      fetchProperties(),
    ]);

    if (!res.ok) {
      console.error('fetchProjects failed:', res.status, await res.text());
      return [];
    }

    const data = await res.json();
    const rows: any[] = data.data || [];

    const countByProject = new Map<string, number>();
    for (const p of allProperties) {
      if (!p.project) continue;
      countByProject.set(p.project, (countByProject.get(p.project) || 0) + 1);
    }

    return rows.map((r) => {
      const displayName = nameField ? r[nameField] || r.name : r.name;
      const cityPart = cityField ? String(r[cityField] || '').trim() : '';
      const addrPart = addrField ? String(r[addrField] || '').trim() : '';
      const location = [cityPart, addrPart].filter(Boolean).join(' · ');

      return {
        id: r.name,
        name: displayName,
        tagline: taglineField ? r[taglineField] || '' : '',
        description: descField ? r[descField] || '' : '',
        developer: devField ? r[devField] || '' : '',
        projectType: typeField ? r[typeField] || '' : '',
        city: cityPart,
        address: addrPart,
        location: location,
        status: statusField ? r[statusField] || '' : '',
        launchDate: launchField ? r[launchField] || undefined : undefined,
        completionDate: completionField ? r[completionField] || undefined : undefined,
        heroImageUrl: imageField ? resolveImageUrl(r[imageField]) : null,
        keyHighlights: highlightsField ? splitLines(r[highlightsField]) : [],
        precincts: precinctsField ? splitLines(r[precinctsField]) : [],
        totalProperties: countByProject.get(displayName) || 0,
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

export async function fetchWebsiteLinks(section?: string): Promise<WebsiteLink[]> {
  try {
    const fields = ['name', 'label', 'route', 'extra_id', 'section', 'display_order'];
    const filters: any[] = [['enabled', '=', 1]];
    if (section) filters.push(['section', '=', section]);

    const url =
      `${API_BASE}/resource/Website Link` +
      `?fields=${encodeURIComponent(JSON.stringify(fields))}` +
      `&filters=${encodeURIComponent(JSON.stringify(filters))}` +
      `&order_by=display_order+asc&limit_page_length=0`;

    const res = await fetch(url, {
      headers: { Authorization: `token ${API_KEY}:${API_SECRET}`, Accept: 'application/json' },
    });

    if (!res.ok) return [];
    const data = await res.json();
    const rows: any[] = data.data || [];
    return rows.map((r) => ({
      id: r.name,
      label: r.label || '',
      route: r.route || '',
      extraId: r.extra_id || undefined,
      section: r.section || '',
      displayOrder: r.display_order || 100,
    }));
  } catch {
    return [];
  }
}
