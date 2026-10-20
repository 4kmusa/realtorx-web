// Post / edit a listing (/post-listing[/<id>]). Any signed-in website user can list: members,
// developers and property owners. RealtorX staff review every listing before it goes live.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck, Camera, Check, Crosshair, Home, Image as ImageIcon, Info, Loader2, MapPin, Phone, Plus, Star, Tag, Trash2, Users, Video, X,
} from 'lucide-react';
import { PageId } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  FormOptions, ListingImage, LISTING_STATUS_LABEL, LISTING_STATUS_TONE, MyListing, RealtorChoice, formatPrice, getFormOptions, getMyListing,
  getRealtorChoices, imageUrl, mapEmbedUrl, removeListingImage, saveListing, setListingCover, submitListing, uploadListingImage, youtubeId,
} from './api';

type Nav = (page: PageId, id?: string) => void;

interface FormState {
  purpose: string;
  group: string;
  category: string;
  city: string;
  location_area: string;
  address_line: string;
  map_link: string;
  latitude: string;
  longitude: string;
  size: string;
  size_unit: string;
  price: string;
  installment_available: boolean;
  ready_for_possession: boolean;
  is_studio: boolean;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  title: string;
  description: string;
  videos: string[];
  contact_email: string;
  contact_mobile: string;
  contact_landline: string;
  realtor_preference: string;
  requested_realtor: string;
  project: string;
}

const BEST = 'Best for me';
const CHOOSE = 'I will choose';
const BEDS = ['Studio', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
const BATHS = ['1', '2', '3', '4', '5', '6+'];

const input = 'w-full rounded-lg border border-white/10 bg-[#081221] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F5A623]/60 focus:outline-none';
const chip = (active: boolean) =>
  `flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
    active ? 'border-[#F5A623] bg-[#F5A623]/15 text-[#F5A623]' : 'border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
  }`;

function emptyForm(email = '', phone = ''): FormState {
  return {
    purpose: 'Sell', group: 'Home', category: 'House', city: '', location_area: '', address_line: '', map_link: '', latitude: '', longitude: '',
    size: '', size_unit: 'Marla', price: '', installment_available: false, ready_for_possession: false, is_studio: false, bedrooms: 0,
    bathrooms: 0, amenities: [], title: '', description: '', videos: [], contact_email: email, contact_mobile: phone, contact_landline: '',
    realtor_preference: BEST, requested_realtor: '', project: '',
  };
}

function fromListing(l: MyListing, groups: Record<string, string[]>): FormState {
  const group = Object.keys(groups).find((g) => groups[g].includes(l.category)) || 'Home';
  return {
    purpose: l.purpose || 'Sell', group, category: l.category || '', city: l.city || '', location_area: l.location_area || '',
    address_line: l.address_line || '', map_link: l.map_link || '', latitude: l.latitude != null ? String(l.latitude) : '',
    longitude: l.longitude != null ? String(l.longitude) : '', size: l.size ? String(l.size) : '', size_unit: l.size_unit || 'Marla',
    price: l.price ? String(Math.round(l.price)) : '', installment_available: !!l.installment_available,
    ready_for_possession: !!l.ready_for_possession, is_studio: !!l.is_studio, bedrooms: l.bedrooms || 0, bathrooms: l.bathrooms || 0,
    amenities: l.amenities || [], title: l.title || '', description: l.description || '', videos: l.videos || [],
    contact_email: l.contact_email || '', contact_mobile: l.contact_mobile || '', contact_landline: l.contact_landline || '',
    realtor_preference: l.realtor_preference || BEST, requested_realtor: l.requested_realtor || '', project: l.project || '',
  };
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5 rounded-2xl border border-white/10 bg-[#0B1A30] p-5 md:grid-cols-[200px_1fr] md:p-6">
      <div className="flex items-start gap-3 md:flex-col">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5A623]/10 text-[#F5A623]"><Icon className="h-5 w-5" /></span>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Label({ children, htmlFor, hint }: { children: React.ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-200">{children}</label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function PostListingPage({ listingId, onNavigate }: { listingId: string | null; onNavigate: Nav }) {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [listing, setListing] = useState<MyListing | null>(null);
  const [name, setName] = useState<string | null>(listingId);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<'save' | 'submit' | 'upload' | null>(null);
  const [videoDraft, setVideoDraft] = useState('');
  const [realtors, setRealtors] = useState<RealtorChoice[]>([]);
  const [realtorSearch, setRealtorSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      sessionStorage.setItem('realtorx_after_login', listingId ? `post-listing/${listingId}` : 'post-listing');
    }
  }, [authLoading, isAuthenticated, listingId]);

  useEffect(() => {
    if (!isAuthenticated || user?.is_staff) return;
    let cancelled = false;
    Promise.all([getFormOptions(), listingId ? getMyListing(listingId) : Promise.resolve(null)])
      .then(([opts, mine]) => {
        if (cancelled) return;
        setOptions(opts);
        if (mine) {
          setListing(mine);
          setImages(mine.images);
          setForm(fromListing(mine, opts.category_groups));
        } else {
          setForm(emptyForm(user?.email || '', user?.phone || ''));
        }
      })
      .catch((e) => !cancelled && setLoadError(e?.message || 'Could not load the form.'));
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.is_staff, user?.email, user?.phone, listingId]);

  useEffect(() => {
    if (!options || options.is_realtor || form.realtor_preference !== CHOOSE) return;
    const t = setTimeout(() => {
      getRealtorChoices(form.city || undefined, realtorSearch || undefined).then(setRealtors).catch(() => setRealtors([]));
    }, 250);
    return () => clearTimeout(t);
  }, [options, form.realtor_preference, form.city, realtorSearch]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const groups = options?.category_groups || {};
  const isHome = form.group === 'Home';
  const pricePreview = useMemo(() => (Number(form.price) > 0 ? formatPrice(Number(form.price), form.purpose) : ''), [form.price, form.purpose]);
  const mapPreview = mapEmbedUrl({
    latitude: form.latitude ? Number(form.latitude) : null,
    longitude: form.longitude ? Number(form.longitude) : null,
    location_area: form.location_area,
    city: form.city,
  });
  const editable = !listing || listing.listing_status !== 'Withdrawn';

  if (authLoading) return <div className="mx-auto max-w-4xl px-4 py-16"><Skeleton className="h-96 rounded-2xl" /></div>;
  if (!isAuthenticated) {
    return (
      <Gate
        title="Sign in to post your property"
        text="Create a free account or sign in. Your listing is checked by RealtorX and assigned to a RealtorX realtor before it goes live."
        actions={[['Sign in', () => onNavigate('login')], ['Create account', () => onNavigate('signup')]]}
      />
    );
  }
  if (user?.is_staff) {
    return <Gate title="Staff add inventory in the back office" text="Use Desk → Property to add or approve listings." actions={[['Open back office', () => (window.location.href = '/app/property')]]} />;
  }
  if (loadError) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={loadError} /></div>;
  if (!options) return <div className="mx-auto max-w-4xl px-4 py-16"><Skeleton className="h-96 rounded-2xl" /></div>;

  const payload = () => ({
    purpose: form.purpose, category: form.category, city: form.city.trim(), location_area: form.location_area.trim(),
    address_line: form.address_line.trim(), map_link: form.map_link.trim(), latitude: form.latitude, longitude: form.longitude,
    size: form.size, size_unit: form.size_unit, price: form.price, installment_available: form.installment_available ? 1 : 0,
    ready_for_possession: form.ready_for_possession ? 1 : 0, is_studio: isHome && form.is_studio ? 1 : 0,
    bedrooms: isHome ? form.bedrooms : 0, bathrooms: isHome ? form.bathrooms : 0, amenities: form.amenities, title: form.title.trim(),
    description: form.description.trim(), videos: form.videos, contact_email: form.contact_email.trim(), contact_mobile: form.contact_mobile.trim(),
    contact_landline: form.contact_landline.trim(), realtor_preference: form.realtor_preference,
    requested_realtor: form.realtor_preference === CHOOSE ? form.requested_realtor : '', project: form.project,
  });

  const persist = async (): Promise<string> => {
    const res = await saveListing(payload(), name);
    setName(res.name);
    if (!name) window.history.replaceState(null, '', `/post-listing/${encodeURIComponent(res.name)}`);
    const fresh = await getMyListing(res.name);
    setListing(fresh);
    setImages(fresh.images);
    return res.name;
  };

  const onSave = async (submit: boolean) => {
    setError(null);
    setNotice(null);
    setBusy(submit ? 'submit' : 'save');
    try {
      const saved = await persist();
      if (submit) {
        await submitListing(saved);
        setListing(await getMyListing(saved));
        setNotice('Submitted. RealtorX will review your listing and let you know (usually within 1–2 working days).');
      } else {
        setNotice(listing?.listing_status === 'Approved' ? 'Saved. Because the listing was live, it goes back for a quick review.' : 'Draft saved.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setError(e?.message || 'Could not save. Please check the form.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBusy(null);
    }
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setBusy('upload');
    try {
      const target = name || (await persist());
      for (const file of Array.from(files)) {
        if (file.size > options.max_upload_mb * 1024 * 1024) throw new Error(`${file.name} is larger than ${options.max_upload_mb} MB.`);
        const res = await uploadListingImage(target, file);
        setImages(res.images);
      }
    } catch (e: any) {
      setError(e?.message || 'Upload failed.');
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const addVideo = () => {
    const url = videoDraft.trim();
    if (!url) return;
    if (!youtubeId(url) || !/^https:\/\//.test(url)) return setError('Please paste a YouTube link (https://youtu.be/... or https://www.youtube.com/watch?v=...).');
    if (form.videos.length >= 5) return setError('You can add up to 5 videos.');
    set('videos', [...form.videos, url]);
    setVideoDraft('');
    setError(null);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return setError('Location is not available in this browser.');
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) })),
      () => setError('Could not read your location. You can paste a Google Maps link instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const status = listing?.listing_status;
  return (
    <div className="min-h-screen bg-[#081221] pb-16">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{listing ? 'Edit listing' : 'Post a property'}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {options.listing_as === 'Developer Listed' ? 'Listing as a RealtorX developer member.' : options.listing_as === 'Member Listed' ? 'Listing as a RealtorX member.' : 'Listing as a property owner.'}{' '}
              Your contact details are never shown publicly.
            </p>
          </div>
          <button onClick={() => onNavigate('my-listings')} className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/5">My listings</button>
        </div>

        {status && (
          <div className={`mb-5 rounded-xl border p-4 text-sm ${LISTING_STATUS_TONE[status] || ''}`} role="status">
            <p className="font-semibold">Status: {LISTING_STATUS_LABEL[status] || status}</p>
            {status === 'Declined' && listing?.decline_reason && <p className="mt-1">RealtorX says: {listing.decline_reason}</p>}
            {status === 'Approved' && listing?.tagged_realtor_name && <p className="mt-1">Buyers are sent to {listing.tagged_realtor_name}.</p>}
            {status === 'Withdrawn' && <p className="mt-1">This listing was withdrawn and can no longer be edited.</p>}
          </div>
        )}
        {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">{error}</div>}
        {notice && <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200" role="status">{notice}</div>}

        <fieldset disabled={!editable || !!busy} className="space-y-5">
          <Section icon={MapPin} title="Location and purpose">
            <div>
              <Label>Purpose</Label>
              <div className="flex gap-2">
                {[['Sell', 'Sell'], ['Rent', 'Rent']].map(([v, l]) => (
                  <button key={v} type="button" className={chip(form.purpose === v)} onClick={() => set('purpose', v)}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Property type</Label>
              <div className="mb-3 flex gap-4 border-b border-white/10">
                {Object.keys(groups).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, group: g, category: groups[g][0] }))}
                    className={`-mb-px border-b-2 pb-2 text-sm font-medium ${form.group === g ? 'border-[#F5A623] text-[#F5A623]' : 'border-transparent text-slate-400 hover:text-white'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {(groups[form.group] || []).map((c) => (
                  <button key={c} type="button" className={chip(form.category === c)} onClick={() => set('category', c)}>{c}</button>
                ))}
              </div>
            </div>
            {!!options.developer_projects.length && (
              <div>
                <Label htmlFor="pl-project" hint="Optional: link this unit to one of your projects.">Project</Label>
                <select id="pl-project" className={input} value={form.project} onChange={(e) => set('project', e.target.value)}>
                  <option value="">Not in a project</option>
                  {options.developer_projects.map((p) => <option key={p.name} value={p.name}>{p.project_name}</option>)}
                </select>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pl-city">City *</Label>
                <input id="pl-city" list="pl-cities" className={input} value={form.city} maxLength={100} onChange={(e) => set('city', e.target.value)} placeholder="Select or type a city" />
                <datalist id="pl-cities">{options.cities.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <Label htmlFor="pl-location">Location *</Label>
                <input id="pl-location" className={input} value={form.location_area} maxLength={200} onChange={(e) => set('location_area', e.target.value)} placeholder="e.g. Bahria Town Karachi, Precinct 10" />
              </div>
            </div>
            <div>
              <Label htmlFor="pl-address" hint="Not shown publicly in full; helps RealtorX verify the property.">House / plot number</Label>
              <input id="pl-address" className={input} value={form.address_line} maxLength={140} onChange={(e) => set('address_line', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pl-map" hint="Paste a Google Maps link, or use your current location if you are at the property.">Google location</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input id="pl-map" className={input} value={form.map_link} maxLength={500} onChange={(e) => set('map_link', e.target.value)} placeholder="https://maps.app.goo.gl/..." />
                <button type="button" onClick={useMyLocation} className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/5">
                  <Crosshair className="h-4 w-4" /> Use my location
                </button>
              </div>
              {form.latitude && (
                <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  Pin: {form.latitude}, {form.longitude}
                  <button type="button" className="text-red-300 hover:underline" onClick={() => setForm((f) => ({ ...f, latitude: '', longitude: '' }))}>remove</button>
                </p>
              )}
              {mapPreview && (form.latitude || form.location_area) && (
                <div className="mt-3 h-48 overflow-hidden rounded-xl border border-white/10">
                  <iframe title="Map preview" src={mapPreview} className="h-full w-full" loading="lazy" />
                </div>
              )}
            </div>
          </Section>

          <Section icon={Tag} title="Price and area">
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <div>
                <Label htmlFor="pl-size">Area size *</Label>
                <input id="pl-size" inputMode="decimal" className={input} value={form.size} onChange={(e) => set('size', e.target.value.replace(/[^\d.]/g, ''))} placeholder="Enter area" />
              </div>
              <div>
                <Label htmlFor="pl-unit">Unit</Label>
                <select id="pl-unit" className={input} value={form.size_unit} onChange={(e) => set('size_unit', e.target.value)}>
                  {options.area_units.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="pl-price">{form.purpose === 'Rent' ? 'Monthly rent (PKR) *' : 'Price (PKR) *'}</Label>
              <input id="pl-price" inputMode="numeric" className={input} value={form.price} onChange={(e) => set('price', e.target.value.replace(/\D/g, ''))} placeholder="Enter price" />
              {pricePreview && <p className="mt-1 text-xs text-[#F5A623]">{pricePreview}</p>}
            </div>
            <Toggle label="Installments available" hint="Enable if this property is available on installments" checked={form.installment_available} onChange={(v) => set('installment_available', v)} />
            <Toggle label="Ready for possession" hint="Enable if the property is ready for possession" checked={form.ready_for_possession} onChange={(v) => set('ready_for_possession', v)} />
          </Section>

          <Section icon={Home} title="Features and amenities">
            {isHome && (
              <>
                <div>
                  <Label>Bedrooms</Label>
                  <div className="flex flex-wrap gap-2">
                    {BEDS.map((b) => {
                      const studio = b === 'Studio';
                      const value = studio ? 0 : Number(b.replace('+', ''));
                      const active = studio ? form.is_studio : !form.is_studio && form.bedrooms === value;
                      return (
                        <button key={b} type="button" className={chip(active)} onClick={() => setForm((f) => ({ ...f, is_studio: studio, bedrooms: value }))}>
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <div className="flex flex-wrap gap-2">
                    {BATHS.map((b) => {
                      const value = Number(b.replace('+', ''));
                      return <button key={b} type="button" className={chip(form.bathrooms === value)} onClick={() => set('bathrooms', value)}>{b}</button>;
                    })}
                  </div>
                </div>
              </>
            )}
            <div>
              <Label hint="Add features such as parking, backup electricity or nearby schools.">Features and amenities</Label>
              <div className="space-y-4">
                {Object.entries(options.amenities).map(([category, list]) => (
                  <div key={category}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {list.map((a) => {
                        const on = form.amenities.includes(a);
                        return (
                          <button key={a} type="button" className={chip(on)} aria-pressed={on} onClick={() => set('amenities', on ? form.amenities.filter((x) => x !== a) : [...form.amenities, a])}>
                            {on && <Check className="h-3.5 w-3.5" />} {a}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section icon={Info} title="Ad information">
            <div>
              <Label htmlFor="pl-title">Title *</Label>
              <input id="pl-title" className={input} value={form.title} maxLength={150} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Beautiful house in DHA Phase 5" />
            </div>
            <div>
              <Label htmlFor="pl-desc" hint="At least 20 characters.">Description *</Label>
              <textarea id="pl-desc" rows={6} className={input} value={form.description} maxLength={5000} onChange={(e) => set('description', e.target.value)} placeholder="Describe your property, its features, the area it is in, etc." />
              <p className="mt-1 text-right text-xs text-slate-500">{form.description.length} / 5000</p>
            </div>
          </Section>

          <Section icon={Camera} title="Images and videos">
            <div>
              <Label hint={`Optional. JPG, PNG or WEBP, up to ${options.max_upload_mb} MB each, ${options.max_images} images max. The first image (★) is the cover.`}>Property images</Label>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={images.length >= options.max_images} className="flex items-center gap-2 rounded-lg bg-[#F5A623] px-4 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110 disabled:opacity-50">
                {busy === 'upload' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />} Upload images
              </button>
              {!name && <p className="mt-1 text-xs text-slate-500">Uploading saves your listing as a draft first.</p>}
              {images.length > 0 && (
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {images.map((img) => (
                    <li key={img.name} className={`relative overflow-hidden rounded-xl border-2 ${img.is_cover ? 'border-[#F5A623]' : 'border-white/10'}`}>
                      <img src={imageUrl(img.image) || ''} alt="" className="aspect-[4/3] w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 p-1.5">
                        <button type="button" className="rounded p-1 text-white hover:bg-white/10" title="Make cover" aria-label="Make cover image" onClick={async () => name && setImages((await setListingCover(name, img.name)).images)}>
                          <Star className={`h-4 w-4 ${img.is_cover ? 'fill-[#F5A623] text-[#F5A623]' : ''}`} />
                        </button>
                        <button type="button" className="rounded p-1 text-red-300 hover:bg-white/10" title="Remove" aria-label="Remove image" onClick={async () => name && setImages((await removeListingImage(name, img.name)).images)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <Label htmlFor="pl-video" hint="Upload your video to YouTube and paste the link here.">Videos</Label>
              <div className="flex gap-2">
                <input id="pl-video" className={input} value={videoDraft} onChange={(e) => setVideoDraft(e.target.value)} placeholder="https://youtu.be/..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVideo())} />
                <button type="button" onClick={addVideo} className="flex items-center gap-1 rounded-lg border border-[#F5A623]/50 px-3 text-xs font-semibold text-[#F5A623] hover:bg-[#F5A623]/10">
                  <Plus className="h-4 w-4" /> Add video
                </button>
              </div>
              {form.videos.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {form.videos.map((v) => (
                    <li key={v} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300">
                      <span className="flex min-w-0 items-center gap-2"><Video className="h-4 w-4 shrink-0" /><span className="truncate">{v}</span></span>
                      <button type="button" aria-label="Remove video" onClick={() => set('videos', form.videos.filter((x) => x !== v))}><X className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Section>

          <Section icon={Phone} title="Contact information">
            <p className="text-xs text-slate-400">Only RealtorX staff and your realtor see these details. They are never published.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pl-email">Email</Label>
                <input id="pl-email" type="email" className={input} value={form.contact_email} maxLength={140} onChange={(e) => set('contact_email', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pl-mobile">Mobile *</Label>
                <input id="pl-mobile" inputMode="tel" className={input} value={form.contact_mobile} maxLength={16} onChange={(e) => set('contact_mobile', e.target.value)} placeholder="03XX XXXXXXX" />
              </div>
              <div>
                <Label htmlFor="pl-landline">Landline</Label>
                <input id="pl-landline" inputMode="tel" className={input} value={form.contact_landline} maxLength={30} onChange={(e) => set('contact_landline', e.target.value)} />
              </div>
            </div>
          </Section>

          <Section icon={Users} title="RealtorX realtor">
            {options.is_realtor ? (
              <p className="flex items-center gap-2 text-sm text-slate-300"><BadgeCheck className="h-4 w-4 text-[#F5A623]" /> You are a RealtorX realtor: interested buyers for this listing come to you.</p>
            ) : (
              <>
                <p className="text-xs text-slate-400">Every RealtorX listing is handled by a RealtorX member realtor. Interested buyers are sent to them, not shown your number.</p>
                <div className="space-y-2">
                  {[
                    [BEST, 'Best for me', 'RealtorX assigns the most suitable realtor for your area.'],
                    [CHOOSE, 'I will choose', 'Pick a realtor from the RealtorX member list.'],
                  ].map(([value, label, hint]) => (
                    <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${form.realtor_preference === value ? 'border-[#F5A623]/60 bg-[#F5A623]/5' : 'border-white/10'}`}>
                      <input type="radio" name="realtor_pref" className="mt-1 accent-[#F5A623]" checked={form.realtor_preference === value} onChange={() => set('realtor_preference', value)} />
                      <span>
                        <span className="block text-sm font-medium text-white">{label}{value === BEST && <span className="ml-2 rounded bg-[#F5A623]/15 px-1.5 py-0.5 text-[10px] text-[#F5A623]">Recommended</span>}</span>
                        <span className="text-xs text-slate-400">{hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {form.realtor_preference === CHOOSE && (
                  <div>
                    <input className={input} placeholder="Search by name, agency or member ID" value={realtorSearch} onChange={(e) => setRealtorSearch(e.target.value)} aria-label="Search realtors" />
                    <ul className="mt-2 max-h-72 space-y-2 overflow-y-auto">
                      {realtors.length === 0 && <li className="p-3 text-xs text-slate-500">No realtors found.</li>}
                      {realtors.map((r) => (
                        <li key={r.member}>
                          <button type="button" onClick={() => set('requested_realtor', r.member)} className={`w-full rounded-xl border p-3 text-left ${form.requested_realtor === r.member ? 'border-[#F5A623] bg-[#F5A623]/10' : 'border-white/10 hover:border-white/25'}`}>
                            <span className="block text-sm font-medium text-white">{r.full_name}{r.firm_name ? ` · ${r.firm_name}` : ''}</span>
                            <span className="text-xs text-slate-400">{[r.member_id, r.city, r.experience_years ? `${r.experience_years} yrs` : null, r.areas_served].filter(Boolean).join(' · ')}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </Section>
        </fieldset>

        {editable && (
          <div className="sticky bottom-0 z-10 mt-6 flex flex-wrap justify-end gap-3 border-t border-white/10 bg-[#081221]/95 py-4 backdrop-blur">
            <button onClick={() => onSave(false)} disabled={!!busy} className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-50">
              {busy === 'save' ? 'Saving…' : 'Save draft'}
            </button>
            {(!status || ['Draft', 'Declined'].includes(status)) && (
              <button onClick={() => onSave(true)} disabled={!!busy} className="rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950 hover:brightness-110 disabled:opacity-50">
                {busy === 'submit' ? 'Submitting…' : 'Submit for review'}
              </button>
            )}
            {status && ['Pending Review', 'Approved'].includes(status) && (
              <button onClick={() => onSave(false)} disabled={!!busy} className="rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950 hover:brightness-110 disabled:opacity-50">
                Save changes
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        <span className="text-xs text-slate-500">{hint}</span>
      </span>
      <input type="checkbox" role="switch" className="h-5 w-9 cursor-pointer accent-[#F5A623]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function Gate({ title, text, actions }: { title: string; text: string; actions: [string, () => void][] }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {actions.map(([label, fn], i) => (
          <button key={label} onClick={fn} className={i === 0 ? 'rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950' : 'rounded-xl border border-white/15 px-6 py-3 text-sm text-white hover:bg-white/5'}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
