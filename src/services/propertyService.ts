// Property Service - Fetches real properties from ERPNext

export interface ERPProperty {
  name: string;
  property_title: string;
  custom_property_category: string;
  status: string;
  project: string;
  size: number;
  size_unit: string;
  list_price: number;
  source: string;
  assigned_dealer?: string;
}

// Transform ERPNext Property → Frontend Property format
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
}

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';
const API_KEY = import.meta.env.VITE_ERPNEXT_API_KEY || '';
const API_SECRET = import.meta.env.VITE_ERPNEXT_API_SECRET || '';

// Format price in PKR (Crore / Lakh)
function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `PKR ${(price / 10000000).toFixed(2)} Crore`;
  } else if (price >= 100000) {
    return `PKR ${(price / 100000).toFixed(2)} Lakh`;
  }
  return `PKR ${price.toLocaleString()}`;
}

// Get category display
function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    'Residential Plot': 'Residential Plot',
    'Commercial Plot': 'Commercial Plot',
    'House': 'House',
    'Flat': 'Apartment',
    'Shop': 'Commercial Shop',
    'Agricultural Land': 'Agricultural Land',
  };
  return map[cat] || cat;
}

// Transform ERPNext property → Frontend property
function transformProperty(p: ERPProperty): Property {
  // Generate image based on category
  const imageMap: Record<string, string> = {
    'Residential Plot': '/src/assets/images/plot_precinct_bahria_1790600998798.jpg',
    'Commercial Plot': '/src/assets/images/commercial_bahria_hub_1790600954734.jpg',
    'House': '/src/assets/images/villa_bahria_luxury_1790600936792.jpg',
    'Flat': '/src/assets/images/apartment_bahria_heights_1790600970754.jpg',
    'Shop': '/src/assets/images/commercial_bahria_hub_1790600954734.jpg',
  };

  const mainImage = imageMap[p.custom_property_category] || '/src/assets/images/bahria_town_karachi_1790600916751.jpg';

  // Extract precinct from title
  const precinctMatch = p.property_title.match(/Precinct\s+[\w-]+/i) || p.property_title.match(/BTK-\d+/i);
  const precinct = precinctMatch ? precinctMatch[0] : 'Bahria Town';

  return {
    id: p.name.toLowerCase().replace(/-/g, ''),
    erpCode: p.name,
    title: p.property_title,
    category: getCategoryLabel(p.custom_property_category),
    project: 'Bahria Town Karachi',
    precinct: precinct,
    location: `${precinct}, Bahria Town Karachi`,
    pricePkr: p.list_price,
    priceFormatted: formatPrice(p.list_price),
    size: p.size,
    sizeUnit: p.size_unit,
    ownership: p.source === 'Company-Owned' ? 'Freehold' : 'Transfer Ready',
    status: p.status,
    isFeatured: true,
    images: [mainImage],
    description: `Premium ${getCategoryLabel(p.custom_property_category)} in ${precinct}, Bahria Town Karachi. ${p.size} ${p.size_unit} with all modern amenities.`,
    features: [
      `${p.size} ${p.size_unit}`,
      'Prime Location',
      'Verified Documents',
      'Ready for Transfer',
      'Bahria Town Approved',
    ],
    dealer: {
      name: 'Realtor X Verified Dealer',
      firm: 'Realtor X',
      phone: '+92 300 8472910',
      whatsapp: '+923008472910',
      isVerified: true,
    },
    commissionSplit: '40% Realtor X / 60% Dealer',
    dateAdded: new Date().toISOString().split('T')[0],
  };
}

// Fetch all properties from ERPNext
export async function fetchProperties(): Promise<Property[]> {
  try {
    const url = `${ERPNEXT_URL}/api/resource/Property?fields=["*"]&limit_page_length=100&order_by=creation+desc`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch properties:', response.status);
      return [];
    }

    const data = await response.json();
    const properties: ERPProperty[] = data.data || [];
    
    return properties.map(transformProperty);
  } catch (error) {
    console.error('Error fetching properties from ERPNext:', error);
    return [];
  }
}

// Fetch single property
export async function fetchProperty(id: string): Promise<Property | null> {
  try {
    const url = `${ERPNEXT_URL}/api/resource/Property/${id}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return transformProperty(data.data);
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}
