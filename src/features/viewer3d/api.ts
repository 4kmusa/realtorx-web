// 3D project viewer data (realtor_x.api.v1.get_project_3d). ERPNext is the source of truth for
// unit status and price; this module only renders what the server returns.
import { callGet } from '../../services/api/client';

export type UnitStatus = 'Available' | 'Reserved' | 'Sold' | 'Unavailable';

export interface Asset3D {
  id: string;
  title: string;
  type: 'Exterior Model' | 'Interior Model' | '360 Panorama' | 'Floor Plan' | 'Photo' | 'CAD/BIM Reference';
  format: string | null;
  size_mb: number | null;
  url: string;
  illustrative: boolean;
  credit?: string | null;
  version: number;
  status: string;
}

export interface Floor3D {
  id: string;
  label: string;
  level: number;
  plan: Asset3D | null;
}

export interface UnitMapping {
  unit: string;
  floor: string | null;
  object: string | null;
  hotspot: [number | null, number | null, number | null] | null;
  interior: Asset3D | null;
}

export interface Building3D {
  id: string;
  name: string;
  code: string | null;
  status: string;
  /** How the viewer opens: Model, Day or Night. */
  view?: 'Model' | 'Day' | 'Night';
  exterior: Asset3D | null;
  floors: Floor3D[];
  units: UnitMapping[];
}

export interface Unit3D {
  id: string;
  code: string;
  status: UnitStatus;
  bookable: boolean;
  listed: boolean;
  /** Block / tower name, for grouping the unit list. */
  group?: string | null;
  title?: string;
  category?: string | null;
  purpose?: string;
  size?: number | null;
  size_unit?: string | null;
  price?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  is_studio?: number;
  layout?: string | null;
}

export interface Project3D {
  project: { id: string; name: string; city: string | null; address: string | null; type: string | null; status: string };
  preview: boolean;
  buildings: Building3D[];
  units: Unit3D[];
  legend: UnitStatus[];
  large_model_mb: number;
}

export const getProject3D = (project: string, preview: boolean) =>
  callGet<Project3D>('realtor_x.api.v1.get_project_3d', { project, preview: preview ? 1 : undefined });

/** Colour + text for each status (the legend always shows the text too). */
export const STATUS_STYLE: Record<UnitStatus, { color: number; css: string; label: string }> = {
  Available: { color: 0x22c55e, css: 'bg-emerald-500', label: 'Available' },
  Reserved: { color: 0xf59e0b, css: 'bg-amber-500', label: 'Reserved' },
  Sold: { color: 0xef4444, css: 'bg-red-500', label: 'Sold' },
  Unavailable: { color: 0x64748b, css: 'bg-slate-500', label: 'Unavailable' },
};
