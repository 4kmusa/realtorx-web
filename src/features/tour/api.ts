// 360° virtual tour data (realtor_x.api.v1.get_virtual_tour): rooms (equirectangular photos) and the
// arrows between them. Angles are degrees: yaw 0 = photo centre, positive = to the right; pitch up = positive.
import { callGet } from '../../services/api/client';

export interface TourArrow {
  to: string;
  yaw: number;
  pitch: number;
  label: string;
}

export interface TourScene {
  id: string;
  title: string;
  floor: string | null;
  url: string;
  yaw: number;
  pitch: number;
  hotspots: TourArrow[];
}

export interface VirtualTour {
  id: string;
  title: string;
  subject: string;
  start: string | null;
  illustrative: boolean;
  auto_rotate: boolean;
  scenes: TourScene[];
  preview: boolean;
  status: string;
}

export type TourOwner = { kind: 'property' | 'project'; id: string };

/** Route id for the tour page: "property/<id>" or "project/<id>". */
export const tourRouteId = (owner: TourOwner) => `${owner.kind}/${owner.id}`;

export function parseTourRouteId(routeId: string | null): TourOwner | null {
  if (!routeId) return null;
  const [kind, ...rest] = routeId.split('/');
  const id = rest.join('/');
  return (kind === 'property' || kind === 'project') && id ? { kind, id } : null;
}

export const getVirtualTour = (owner: TourOwner, preview: boolean) =>
  callGet<VirtualTour>('realtor_x.api.v1.get_virtual_tour', {
    [owner.kind]: owner.id,
    preview: preview ? 1 : undefined,
  });
