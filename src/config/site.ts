// Company details and feature switches used across the website. One place to change them.

export const SITE = {
  name: 'RealtorX',
  /** Public address used for canonical links and share previews (the same site is also served on vercel.app). */
  url: 'https://www.realtorxglobal.com',
  phoneDisplay: '+92 304 9383785',
  phoneTel: '+923049383785',
  whatsapp: '923049383785',
  email: 'info@realtorx.co',
  salesEmail: 'sales@realtorx.co',
  address: 'Suite 402, Opal Mall, Main Jinnah Avenue, Bahria Town Karachi, Pakistan',
  hours: 'Monday to Saturday, 10:00 to 20:00 (Friday break 13:00 to 15:00)',
};

/** Features that exist in the system but are switched off on the website for now. */
export const FEATURES = {
  /** 3D building models and 360° tours (paused by the owner; turn on when the first real project is ready). */
  tours3d: true,
};

export const whatsappUrl = (text = 'Hello RealtorX, I would like some help with a property.') =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
