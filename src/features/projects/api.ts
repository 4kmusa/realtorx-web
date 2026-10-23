// Public projects (developer projects published by RealtorX).
import { callGet } from '../../services/api/client';
import { PaymentPlan, PublicListing } from '../marketplace/api';

export interface UnitType {
  label: string;
  category?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  purpose?: string | null;
  units: number;
  available: number;
  size_min?: number | null;
  size_max?: number | null;
  size_unit?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  floor_plan?: string | null;
  unit_ids: string[];
}

export interface ProjectUpdate { date: string; title: string; progress?: number | null; note?: string | null; photos: string[] }

export interface ProjectPage {
  gallery: { image: string; caption?: string | null; kind?: string | null }[];
  floor_plans: { title: string; layout_code?: string | null; image: string; note?: string | null }[];
  unit_types: UnitType[];
  stats: { units: number; available: number; towers?: number | null; floors?: number | null; price_min?: number | null; price_max?: number | null };
  building: { plot_size?: string | null; approvals?: string | null };
  amenities: { group: string; items: string[] }[];
  location: { latitude?: number | null; longitude?: number | null; map_link?: string | null; address?: string | null; city?: string | null };
  nearby: { place: string; kind: string; distance?: string | null }[];
  updates: ProjectUpdate[];
  developer?: { name: string; logo?: string | null; about?: string | null; website?: string | null;
    projects: { name: string; project_name: string; city?: string | null; cover_image?: string | null; status?: string | null }[] } | null;
  payment_plan?: PaymentPlan | null;
}

export interface PublicProject extends Partial<ProjectPage> {
  name: string;
  project_name: string;
  developer_name?: string;
  project_type?: string | null;
  city?: string | null;
  address?: string | null;
  status?: string | null;
  launch_date?: string | null;
  expected_completion_date?: string | null;
  custom_tagline?: string | null;
  custom_description?: string | null;
  custom_key_highlights?: string | null;
  brochure?: string | null;
  cover_image?: string | null;
  available_units: number;
  has_3d?: boolean;
  has_tour?: boolean;
}

export const getProjects = () => callGet<PublicProject[]>('realtor_x.api.v1.get_public_projects').then((r) => r || []);
export const getProject = (id: string) => callGet<PublicProject & ProjectPage>('realtor_x.api.v1.get_public_project_details', { project_id: id });
export const getProjectUnits = (id: string) => callGet<PublicListing[]>('realtor_x.api.v1.get_project_properties', { project_id: id }).then((r) => r || []);

/** Public wording for the project status kept in ERPNext. */
export function projectStage(status?: string | null): string {
  if (!status) return '';
  if (/selling|active/i.test(status)) return 'Now selling';
  if (/launch/i.test(status)) return 'Launching soon';
  if (/complet|handover|possession/i.test(status)) return 'Ready to move in';
  if (/construct/i.test(status)) return 'Under construction';
  return status;
}
