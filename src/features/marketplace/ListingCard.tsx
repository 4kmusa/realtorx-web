// Property card: photo first, then price, title and the few facts that matter. The whole card opens the property.
import React from 'react';
import { ArrowUpRight, Home } from 'lucide-react';
import { PublicListing, formatArea, formatPrice, imageUrl } from './api';
import { Tag } from '../../components/site/ui';
import { follow } from '../../components/site/PageLink';
import { pathFor } from '../../app/routes';

export function ListingCard({ item, onOpen, onInterest, featured }: { item: PublicListing; onOpen: () => void; onInterest?: () => void; featured?: boolean }) {
  const href = pathFor('property-detail', item.name);
  const cover = imageUrl(item.cover_image);
  const facts = [
    item.custom_property_category,
    item.is_studio ? 'Studio' : item.bedrooms ? `${item.bedrooms}${item.bedrooms >= 10 ? '+' : ''} bed` : null,
    item.bathrooms ? `${item.bathrooms} bath` : null,
    formatArea(item.size, item.size_unit) || null,
  ].filter(Boolean);
  const place = [item.location_area || item.project_name, item.city].filter(Boolean).join(', ');
  return (
    <article className="group">
      <a href={href} onClick={(e) => follow(e, onOpen)} className="zoom reveal-img relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-panel text-left" aria-label={`Open ${item.property_title}`}>
        {cover ? (
          <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-fg-3"><Home className="h-10 w-10" strokeWidth={1} /></div>
        )}
        <div className="absolute inset-x-0 top-0 flex justify-between p-3">
          <span className="flex gap-1.5">
            {featured && <span className="rounded-full bg-fg px-2.5 py-1 text-[11px] font-medium text-ink">{item.featured_badge || 'Featured'}</span>}
            {item.purpose === 'Rent' && <Tag>For rent</Tag>}
          </span>
          <span className="flex gap-1.5">
            {item.installment_available ? <span className="rounded-full bg-ink/70 px-2.5 py-1 text-[11px] text-fg backdrop-blur">Installments</span> : null}
            {item.ready_for_possession ? <span className="rounded-full bg-ink/70 px-2.5 py-1 text-[11px] text-fg backdrop-blur">Ready</span> : null}
          </span>
        </div>
        <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-fg text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </a>
      <div className="pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xl font-medium tracking-[-0.02em] text-fg">{formatPrice(item.list_price, item.purpose, item.currency)}</p>
          {onInterest && (
            <button onClick={onInterest} className="shrink-0 text-[13px] text-fg-2 underline-offset-4 transition-colors hover:text-fg hover:underline">Enquire</button>
          )}
        </div>
        <a href={href} onClick={(e) => follow(e, onOpen)} className="mt-1 line-clamp-1 block text-left text-[15px] text-fg-2 transition-colors hover:text-fg">{item.property_title}</a>
        <p className="mt-2 line-clamp-1 text-[13px] text-fg-3">{[facts.join(' · '), place].filter(Boolean).join('  —  ')}</p>
      </div>
    </article>
  );
}
