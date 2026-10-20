// Developer Program (/developer-program): what developers get, who is already on board, and the
// packages RealtorX offers (prices come from the back office; nothing is charged online).
import React, { useEffect, useState } from 'react';
import { BarChart3, Building2, FileText, Handshake, Loader2, MapPin, Users, Warehouse } from 'lucide-react';
import { PageId } from '../../types';
import { callGet } from '../../services/api/client';
import { imageUrl } from '../marketplace/api';

type Nav = (page: PageId, id?: string) => void;

interface Developer {
  name: string;
  company_owner_name: string;
  about: string | null;
  website: string | null;
  logo: string | null;
  projects: { name: string; project_name: string; city: string | null; status: string }[];
}
interface Plan { name: string; plan_name: string; audience: string; price: number; period_months: number; benefits: string | null }

const BENEFITS: [React.ElementType, string, string][] = [
  [Building2, 'Project showcase', 'Your projects, units and brochures on the RealtorX marketplace, verified by RealtorX.'],
  [Users, 'Assigned realtors', 'A network of oath-bound RealtorX member realtors assigned to sell your projects.'],
  [BarChart3, 'Developer Center', 'Live unit status, listings under review and buyer-interest numbers for every project.'],
  [Warehouse, 'Dedicated desk', 'A developer pod or desk at the RealtorX Hub for client meetings and sales teams.'],
  [Handshake, 'Solution Desk', 'Help with delays, liquidation of inventory, partnerships and documentation.'],
  [FileText, 'Launch events', 'Developer launches and trainings for realtors at the Hub.'],
];

export default function DeveloperProgramPage({ onNavigate }: { onNavigate: Nav }) {
  const [developers, setDevelopers] = useState<Developer[] | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    callGet<Developer[]>('realtor_x.api.v1.get_public_developers').then(setDevelopers).catch(() => setDevelopers([]));
    callGet<Plan[]>('realtor_x.api.community.get_subscription_plans', { member_type: 'Developer' }).then((p) => setPlans(p || [])).catch(() => setPlans([]));
  }, []);

  const apply = () => {
    sessionStorage.setItem('realtorx_join_type', 'Developer');
    onNavigate('join');
  };

  return (
    <div className="min-h-screen bg-[#0B1A30] pb-20">
      <section className="border-b border-white/[0.06] bg-gradient-to-b from-[#081221] to-[#0B1A30]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5A623]">RealtorX Developer Program</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold text-white sm:text-5xl">Build with a community behind you</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
            Developers join RealtorX as members. Once verified, you get a Developer Center, assigned realtors and a home at the Hub.
          </p>
          <button onClick={apply} className="mt-8 rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950 hover:brightness-110">Apply as a developer</button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(([Icon, title, text]) => (
            <li key={title} className="rounded-2xl border border-white/10 bg-[#081221] p-6">
              <Icon className="h-6 w-6 text-[#F5A623]" />
              <p className="mt-3 font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm text-slate-400">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {plans.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
          <h2 className="text-2xl font-bold text-white">Developer packages</h2>
          <p className="mt-1 text-sm text-slate-400">Packages are arranged with the RealtorX Community Team; no payment is taken online.</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <li key={p.name} className="rounded-2xl border border-white/10 bg-[#081221] p-6">
                <p className="font-semibold text-white">{p.plan_name}</p>
                <p className="mt-2 text-2xl font-bold text-[#F5A623]">PKR {Math.round(p.price).toLocaleString('en-PK')}</p>
                <p className="text-xs text-slate-400">for {p.period_months} months</p>
                {p.benefits && <ul className="mt-4 space-y-1 text-sm text-slate-300">{p.benefits.split('\n').filter(Boolean).map((b) => <li key={b}>• {b}</li>)}</ul>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <h2 className="text-2xl font-bold text-white">Developers on RealtorX</h2>
        {!developers ? (
          <Loader2 className="mt-6 h-6 w-6 animate-spin text-slate-500" aria-label="Loading" />
        ) : developers.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">The first developer members will appear here.</p>
        ) : (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {developers.map((d) => (
              <li key={d.name} className="rounded-2xl border border-white/10 bg-[#081221] p-6">
                <div className="flex items-center gap-3">
                  {d.logo ? <img src={imageUrl(d.logo) || ''} alt="" className="h-12 w-12 rounded-lg bg-white object-contain p-1" /> : <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F5A623]/15 font-bold text-[#F5A623]">{d.company_owner_name.charAt(0)}</span>}
                  <p className="text-lg font-semibold text-white">{d.company_owner_name}</p>
                </div>
                {d.about && <p className="mt-3 text-sm text-slate-400">{d.about}</p>}
                <ul className="mt-4 space-y-2">
                  {d.projects.map((p) => (
                    <li key={p.name}>
                      <button onClick={() => onNavigate('project-details', p.name)} className="flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-left text-sm text-white hover:bg-white/10">
                        <span>{p.project_name}</span>
                        <span className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3.5 w-3.5" /> {p.city || '—'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
