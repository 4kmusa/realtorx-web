import { Property, ProjectInfo } from '../types';

export const BRAND_TAGLINES = {
  philosophy: "Success is not measured by the number of properties we sell, but by the number of lives, businesses and investments we help transform.",
  philosophyUrdu: "ہماری کامیابی کا پیمانہ یہ نہیں کہ ہم نے کتنی پراپرٹیز فروخت کیں—بلکہ یہ ہے کہ ہم نے کتنی زندگیوں، کاروباروں اور سرمایہ کاریوں کو محفوظ اور خوشحال بنایا۔",
  motto: "Real Estate. Reimagined.",
  mission: "Connect. Collaborate. Grow.",
  urduTagline: "اعتماد کے ساتھ پراپرٹی کا سفر",
};

export const MOCK_PROJECTS: ProjectInfo[] = [
  {
    id: "bahria-town-karachi",
    name: "Bahria Town Karachi (BTK-1)",
    shortName: "BTK Main",
    tagline: "Pakistan's premier master-planned luxury destination on Super Highway / M-9",
    location: "Super Highway (M-9), Karachi",
    description: "Spanning over 44,000 acres, Bahria Town Karachi offers an international lifestyle with uncompromised 24/7 security, uninterrupted power, world-class theme parks, Danzoo, Grand Jamia Mosque, and gated precincts.",
    heroImage: "/src/assets/images/bahria_town_karachi_1790600916751.jpg",
    totalProperties: 120,
    status: "Established",
    precincts: ["Precinct 1 (Adjacent to Gate)", "Precinct 10A (Villas)", "Precinct 19 (Apartments)", "Precinct 27", "Ali Block", "Jinnah Avenue Commercial"],
    keyHighlights: [
      "100% Underground electrification & backup power",
      "Grand Jamia Mosque (3rd largest in the world)",
      "Bahria Adventure Land & Danzoo Day & Night Safari",
      "Saudi German Hospital & Roots Millennium School",
      "400 ft wide Jinnah Avenue Commercial Boulevard"
    ]
  },
  {
    id: "bahria-town-karachi-2",
    name: "Bahria Town Karachi 2 (BTK-2)",
    shortName: "BTK 2",
    tagline: "The Next Frontier of Smart Living on M-9 Expressway",
    location: "M-9 Karachi-Hyderabad Motorway, Karachi",
    description: "BTK-2 introduces solar-integrated green urbanism, high-return residential plots, and rapid infrastructural development for visionary investors and modern families.",
    heroImage: "/src/assets/images/plot_precinct_bahria_1790600998798.jpg",
    totalProperties: 48,
    status: "Rapid Development",
    precincts: ["Sector A", "Sector B", "Commercial Central", "Lake View Villas"],
    keyHighlights: [
      "Direct interchange on M-9 Motorway",
      "Solar grid hybrid infrastructure",
      "Affordable multi-tier installment plans",
      "High capital appreciation potential"
    ]
  },
  {
    id: "bahria-heights-karachi",
    name: "Bahria Heights Karachi",
    shortName: "Bahria Heights",
    tagline: "Modern High-Rise Apartment Living with Panoramic Community Views",
    location: "Precinct 17, Bahria Town Karachi",
    description: "Iconic dual-tower apartment complexes offering 2-bedroom luxury apartments with dedicated basement parking, round-the-clock maintenance, and swift elevator access.",
    heroImage: "/src/assets/images/apartment_bahria_heights_1790600970754.jpg",
    totalProperties: 35,
    status: "Possession Handed Over",
    precincts: ["Tower A", "Tower B", "Tower C", "Commercial Courtyard"],
    keyHighlights: [
      "2-Bed Executive & Family layout apartments",
      "Dedicated resident car parking floors",
      "Commercial convenience market on ground level",
      "High rental yield (8-10% annual)"
    ]
  }
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "rx-prop-001",
    erpCode: "PRP-BTK-0101",
    title: "500 Sq Yards Modern Luxury Designer Villa",
    titleUrdu: "500 گز شاندار ماڈرن ولا، پریسنگٹ 27، بحریہ ٹاؤن",
    category: "Luxury Villa",
    project: "Bahria Town Karachi (BTK-1)",
    precinct: "Precinct 27 (Golf Facing)",
    location: "Precinct 27, Bahria Town Karachi",
    pricePkr: 52000000,
    priceFormatted: "PKR 5.20 Crore",
    size: 500,
    sizeUnit: "Sq. Yards",
    bedrooms: 5,
    bathrooms: 6,
    ownership: "Possession Available",
    status: "Hot Deal",
    isFeatured: true,
    images: [
      "/src/assets/images/villa_bahria_luxury_1790600936792.jpg",
      "/src/assets/images/bahria_town_karachi_1790600916751.jpg"
    ],
    description: "Architect-designed 500 sq yards brand new double-storey designer villa featuring imported Spanish tiles, Grohe fittings, high-ceiling drawing room, servant quarters, and front lawn with ambient lighting. Direct walking distance to neighborhood mosque and park.",
    features: [
      "5 Master Bedrooms with En-Suite Baths",
      "Dual Italian Kitchen with Built-in Appliances",
      "Solid Ash Wood Doors & Aluminum Windows",
      "Spacious Car Porch for 3 Vehicles",
      "Rooftop BBQ Pavilion with Scenic Sunset Views",
      "Underground & Overhead Water Tanks (Total 8,000 Gallons)"
    ],
    dealer: {
      name: "Tariq Mahmood Alvi",
      firm: "Alvi Capital & Associates",
      phone: "+92 300 8472910",
      whatsapp: "+923008472910",
      isVerified: true
    },
    commissionSplit: "40% Realtor X / 60% Dealer",
    dateAdded: "2026-09-20"
  },
  {
    id: "rx-prop-002",
    erpCode: "PRP-BTK-0102",
    title: "125 Sq Yards Ready Villa, Precinct 10A",
    titleUrdu: "125 گز پرتعیش فیملی ولا، پریسنگٹ 10-A",
    category: "Luxury Villa",
    project: "Bahria Town Karachi (BTK-1)",
    precinct: "Precinct 10A",
    location: "Precinct 10A, Near Imtiaz Super Market, Bahria Karachi",
    pricePkr: 16500000,
    priceFormatted: "PKR 1.65 Crore",
    size: 125,
    sizeUnit: "Sq. Yards",
    bedrooms: 3,
    bathrooms: 3,
    ownership: "Transfer Ready",
    status: "Available",
    isFeatured: true,
    images: [
      "/src/assets/images/villa_bahria_luxury_1790600936792.jpg",
      "/src/assets/images/apartment_bahria_heights_1790600970754.jpg"
    ],
    description: "Ideal compact family villa in one of the most populated and active precincts of Bahria Town Karachi. Clean paperwork, utility meters installed, ready for immediate possession and shifting.",
    features: [
      "3 Cozy Bedrooms with Attached Wardrobes",
      "Well-ventilated Open American Kitchen",
      "Covered Car Garage",
      "Walking Distance to Commercial Market & Jamia Masjid",
      "Gated Street with 24/7 Security Patrol"
    ],
    dealer: {
      name: "Ayesha S. Farooqi",
      firm: "Crescent Prime Properties",
      phone: "+92 321 9928103",
      whatsapp: "+923219928103",
      isVerified: true
    },
    commissionSplit: "40% Realtor X / 60% Dealer",
    dateAdded: "2026-09-22"
  },
  {
    id: "rx-prop-003",
    erpCode: "PRP-BTK-0103",
    title: "2-Bed Luxury Apartment in Bahria Heights",
    titleUrdu: "2 بیڈ لگژری اپارٹمنٹ، بحریہ ہائٹس ٹاور B",
    category: "Apartment",
    project: "Bahria Heights Karachi",
    precinct: "Tower B, Mid Floor",
    location: "Precinct 17, Jinnah Avenue Access, Bahria Town",
    pricePkr: 11500000,
    priceFormatted: "PKR 1.15 Crore",
    size: 1100,
    sizeUnit: "Sq. Feet",
    bedrooms: 2,
    bathrooms: 2,
    ownership: "Possession Available",
    status: "Available",
    isFeatured: true,
    images: [
      "/src/assets/images/apartment_bahria_heights_1790600970754.jpg",
      "/src/assets/images/commercial_bahria_hub_1790600954734.jpg"
    ],
    description: "Corner apartment on 6th floor with expansive balcony overlooking central landscaped park. Exceptional rental return of PKR 50,000 - 65,000 per month, making it prime investment for passive income.",
    features: [
      "Corner Unit with Natural Cross Ventilation",
      "High-Speed Otis Passenger & Cargo Lifts",
      "Dedicated Reserved Car Parking in Basement",
      "Standby Power Generators for 100% Load",
      "Security Intercom & RFID Entrance"
    ],
    dealer: {
      name: "Chaudhry Bilal Anwar",
      firm: "Indus Urban Advisory",
      phone: "+92 333 4455610",
      whatsapp: "+923334455610",
      isVerified: true
    },
    commissionSplit: "40% Realtor X / 60% Dealer",
    dateAdded: "2026-09-24"
  },
  {
    id: "rx-prop-004",
    erpCode: "PRP-BTK-0104",
    title: "250 Sq Yards Prime Residential Plot, Precinct 1",
    titleUrdu: "250 گز رہائشی پلاٹ، پریسنگٹ 1 (مین گیٹ کے قریب)",
    category: "Residential Plot",
    project: "Bahria Town Karachi (BTK-1)",
    precinct: "Precinct 1 (Main Gate)",
    location: "Precinct 1, 200m from Main Entrance Gate, Bahria Town",
    pricePkr: 24500000,
    priceFormatted: "PKR 2.45 Crore",
    size: 250,
    sizeUnit: "Sq. Yards",
    ownership: "Freehold",
    status: "Hot Deal",
    isFeatured: true,
    images: [
      "/src/assets/images/plot_precinct_bahria_1790600998798.jpg",
      "/src/assets/images/bahria_town_karachi_1790600916751.jpg"
    ],
    description: "Ultra-prime category plot in Precinct 1, immediately adjacent to the grand entrance gate and hospital. Ready for immediate construction, surrounded by inhabited luxury residences.",
    features: [
      "Level Plot, Zero Filling Required",
      "Direct Access to M-9 Highway & Main Gate",
      "All Utilities (Water, Gas, Electricity) at Plot Boundary",
      "Clear Title & Verified Transfer at Bahria Town Office",
      "High Resale & Immediate Rental Viability after Construction"
    ],
    dealer: {
      name: "Tariq Mahmood Alvi",
      firm: "Alvi Capital & Associates",
      phone: "+92 300 8472910",
      whatsapp: "+923008472910",
      isVerified: true
    },
    commissionSplit: "40% Realtor X / 60% Dealer",
    dateAdded: "2026-09-25"
  },
  {
    id: "rx-prop-005",
    erpCode: "PRP-BTK-0105",
    title: "133 Sq Yards Commercial Shop on Jinnah Avenue",
    titleUrdu: "133 گز کمرشل شاپ / آؤٹ لیٹ، جناح ایونیو",
    category: "Commercial Shop",
    project: "Bahria Town Karachi (BTK-1)",
    precinct: "Jinnah Avenue Commercial Boulevard",
    location: "Ground Floor, Opal Square, Jinnah Avenue, Bahria Karachi",
    pricePkr: 38500000,
    priceFormatted: "PKR 3.85 Crore",
    size: 1200,
    sizeUnit: "Sq. Feet",
    ownership: "Transfer Ready",
    status: "Available",
    isFeatured: true,
    images: [
      "/src/assets/images/commercial_bahria_hub_1790600954734.jpg",
      "/src/assets/images/bahria_town_karachi_1790600916751.jpg"
    ],
    description: "High-visibility ground floor commercial shop facing the 400 ft Jinnah Avenue. High footfall corridor surrounded by top banking branches, fashion outlets, and corporate offices.",
    features: [
      "Double Height Ceiling (Mezzanine Floor Approved)",
      "Wide Glass Display Facade (30 Feet Frontage)",
      "High Footfall Opposite Carnival & Theme Park",
      "Expected Monthly Rental: PKR 200,000 - 250,000",
      "Ample Public Front Parking"
    ],
    dealer: {
      name: "Ayesha S. Farooqi",
      firm: "Crescent Prime Properties",
      phone: "+92 321 9928103",
      whatsapp: "+923219928103",
      isVerified: true
    },
    commissionSplit: "40% Realtor X / 60% Dealer",
    dateAdded: "2026-09-26"
  },
  {
    id: "rx-prop-006",
    erpCode: "PRP-BTK-0106",
    title: "125 Sq Yards Prime Plot in BTK-2, Sector A",
    titleUrdu: "125 گز پرائم پلاٹ، بحریہ ٹاؤن کراچی 2، سیکٹر A",
    category: "Residential Plot",
    project: "Bahria Town Karachi 2 (BTK-2)",
    precinct: "Sector A (Near Main Boulevard)",
    location: "Sector A, Bahria Town Karachi 2, M-9 Motorway",
    pricePkr: 4800000,
    priceFormatted: "PKR 48.00 Lakh",
    size: 125,
    sizeUnit: "Sq. Yards",
    ownership: "Allotment",
    status: "Available",
    isFeatured: true,
    images: [
      "/src/assets/images/plot_precinct_bahria_1790600998798.jpg",
      "/src/assets/images/villa_bahria_luxury_1790600936792.jpg"
    ],
    description: "Early-stage high-growth investment plot in BTK-2 Sector A. Fully balloted with clear allotment letter. Rapid ground development currently ongoing with asphalt roads laid.",
    features: [
      "Prime Boulevard Facing Location",
      "Low Entry Capital with High 3-Year Growth Target",
      "Registered on Bahria Official Portal",
      "Realtor X 100% Document Verification Completed",
      "Direct Transfer Facility Available"
    ],
    dealer: {
      name: "Chaudhry Bilal Anwar",
      firm: "Indus Urban Advisory",
      phone: "+92 333 4455610",
      whatsapp: "+923334455610",
      isVerified: true
    },
    commissionSplit: "40% Realtor X / 60% Dealer",
    dateAdded: "2026-09-27"
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Discover & Verify",
    titleUrdu: "تلاش اور تصدیق",
    desc: "Browse 100% document-verified plots, villas, and commercial spaces with transparent pricing and exact location pins."
  },
  {
    step: "02",
    title: "Guided Site Visit",
    titleUrdu: "موقع کا دورہ (Site Visit)",
    desc: "Schedule a chauffeured site visit with a vetted Realtor X custodian dealer who knows every precinct and boundary."
  },
  {
    step: "03",
    title: "Token & Legal Verification",
    titleUrdu: "قانونی تصدیق و بیعانہ",
    desc: "Pay token through verified escrow or direct Bahria Town transfer office channels. Zero hidden fee guarantees."
  },
  {
    step: "04",
    title: "Seamless Ownership",
    titleUrdu: "ٹرانسفر اور انتقال ملکیت",
    desc: "Complete official transfer, receive allotment and possession certificates, and join the Realtor X community network."
  }
];

export const TESTIMONIALS = [
  {
    quote: "When our commercial plot transfer was delayed at another agency, Realtor X stepped in, protected our token money, and arranged the transfer within 4 working days. Truly living up to their philosophy.",
    author: "Kamran Zubair",
    role: "Overseas Investor (UK)",
    location: "Bought 500 Sq Yards Villa in Precinct 27"
  },
  {
    quote: "The 40/60 commission model gives dealers genuine respect and pride. We are not competitors here; we are custodians helping real families build lifelong homes.",
    author: "M. Tariq Alvi",
    role: "Verified Dealer Member",
    location: "Alvi Capital, Bahria Town Karachi"
  },
  {
    quote: "Living overseas in Dubai, transparency is everything. Realtor X provided video site tours, verified NDC certificates, and clear payment receipts through ERPNext.",
    author: "Dr. Farhana Siddiqui",
    role: "Allottee & Homeowner",
    location: "Bahria Heights Resident"
  }
];
