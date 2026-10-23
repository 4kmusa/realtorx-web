// RealtorX Developer dashboard (/developer/): key figures, projects and unit availability live from ERPNext,
// inventory map, contract, inventory updates, sales with buyer statements, payments, commission invoices and cash flow.
import React, { useState } from 'react';
import { Bell, Briefcase, Building2, FileSignature, Home, LineChart, Lock, Wallet } from 'lucide-react';
import DashboardRoot from '../DashboardRoot';
import { DashboardSession } from '../session';
import { DataTable, DataView, NavItem, PortalShell, SectionHeader, StatCard, formatMoneyList, useApi, type MoneyAmount } from '../kit/kit';
import { t, tf, tn } from '../i18n';
import { NotificationsSection, SecuritySection, useUnreadCount } from '../kit/shared';
import { useSection } from '../useSection';
import { ContractSection, PaymentsSection, ProjectDetail, SalesSection } from './sections';
import { CashflowSection } from './insights';

interface ProjectRow {
  name: string;
  project_name: string;
  city: string | null;
  country: string | null;
  status: string;
  publish_on_website: number;
  on_website: boolean;
  currency?: string | null;
  units: Record<'Available' | 'Reserved' | 'Booked' | 'Sold' | 'Blocked' | 'total' | 'live', number>;
}
interface Overview {
  projects: ProjectRow[];
  totals: ProjectRow['units'];
  developers: number;
  kpis: {
    deals_open: number;
    deals_transferred: number;
    sales_value: MoneyAmount[];
    collected: MoneyAmount[];
    balance: MoneyAmount[];
    overdue: MoneyAmount[];
    overdue_deals: number;
    payments_to_confirm: number;
    commission_due: MoneyAmount[];
  };
}

const NAV: NavItem[] = [
  { section: 'overview', label: 'Overview', icon: Home },
  { section: 'projects', label: 'Projects & inventory', icon: Building2 },
  { section: 'contract', label: 'Contract', icon: FileSignature },
  { section: 'sales', label: 'Sales', icon: Briefcase },
  { section: 'payments', label: 'Payments', icon: Wallet },
  { section: 'cashflow', label: 'Cash flow', icon: LineChart },
  { section: 'notifications', label: 'Notifications', icon: Bell },
  { section: 'security', label: 'Security', icon: Lock },
];

function Projects({ rows, onOpen }: { rows: ProjectRow[]; onOpen?: (name: string) => void }) {
  return (
    <DataTable
      rows={rows}
      rowKey={(r) => r.name}
      onRowClick={onOpen ? (r) => onOpen(r.name) : undefined}
      columns={[
        { header: 'Project', cell: (r) => <span className="font-semibold text-fg">{r.project_name}</span> },
        { header: 'Location', cell: (r) => [r.city, r.country].filter(Boolean).join(', ') || '—' },
        { header: 'Status', cell: (r) => <>{r.status}{r.on_website ? '' : <span className="ms-2 rounded bg-white/10 px-1.5 text-[11px] text-fg-2">{t('not on website')}</span>}</> },
        { header: 'Units', cell: (r) => r.units.total },
        { header: 'Available', cell: (r) => r.units.Available },
        { header: 'Reserved / Booked', cell: (r) => r.units.Reserved + r.units.Booked },
        { header: 'Sold', cell: (r) => r.units.Sold },
        { header: 'Live listings', cell: (r) => r.units.live },
      ]}
    />
  );
}

function DeveloperDashboard({ session, logout }: { session: DashboardSession; logout: () => void }) {
  const [section, go] = useSection('developer', 'overview', NAV.map((n) => n.section));
  const unread = useUnreadCount(section);
  const overview = useApi<Overview>(section === 'overview' || section === 'projects' ? 'realtor_x.api.portal.developer_overview' : null, undefined, section);
  const companies = (session.developers || []).map((d) => d.company_owner_name).join(', ');
  const [openProject, setOpenProject] = useState<string | null>(null);
  const [visit, setVisit] = useState(0); // a menu click always opens the section's first screen
  const select = (next: string) => {
    setVisit((v) => v + 1);
    setOpenProject(null);
    go(next);
  };
  const open = (name: string) => {
    setOpenProject(name);
    go('projects');
  };
  return (
    <div className="min-h-screen bg-ink text-fg">
      <PortalShell title="RealtorX Developer" subtitle={companies || session.full_name || ''} nav={NAV} active={section} onSelect={select} onLogout={logout} badges={{ notifications: unread }}>
        {section === 'overview' && (
          <>
            <SectionHeader title="Overview" description="Live from RealtorX. Unit status is updated by RealtorX as units are reserved, booked and sold." />
            <DataView
              state={overview}
              isEmpty={(d) => d.projects.length === 0}
              empty={{ icon: Building2, title: 'No projects yet', description: 'RealtorX adds your projects and inventory after the contract is signed.' }}
            >
              {(d) => (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Projects" value={d.projects.length} />
                    <StatCard label="Units" value={d.totals.total} hint={tf('{0} live on the website', d.totals.live)} />
                    <StatCard label="Available" value={d.totals.Available} tone="good" />
                    <StatCard label="Reserved / booked / sold" value={d.totals.Reserved + d.totals.Booked + d.totals.Sold} />
                  </div>
                  {d.kpis && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <button type="button" className="h-full text-left" onClick={() => go('sales')}><StatCard label="Sales by RealtorX" value={formatMoneyList(d.kpis.sales_value)} hint={`${tf('{0} open', d.kpis.deals_open)} · ${tf('{0} transferred', d.kpis.deals_transferred)}`} /></button>
                      <button type="button" className="h-full text-left" onClick={() => go('sales')}><StatCard label="Collected (verified)" value={formatMoneyList(d.kpis.collected)} tone="good" hint={tf('Balance {0}', formatMoneyList(d.kpis.balance))} /></button>
                      <button type="button" className="h-full text-left" onClick={() => go('sales')}><StatCard label="Buyer payments overdue" value={formatMoneyList(d.kpis.overdue)} tone={d.kpis.overdue_deals ? 'warn' : 'default'} hint={`${tn(d.kpis.overdue_deals, '{0} deal', '{0} deals')} · ${t('RealtorX follows up')}`} /></button>
                      <button type="button" className="h-full text-left" onClick={() => go('payments')}><StatCard label="To confirm / invoices due" value={d.kpis.payments_to_confirm} tone={d.kpis.payments_to_confirm ? 'warn' : 'default'} hint={tf('Commission invoices due {0}', formatMoneyList(d.kpis.commission_due))} /></button>
                    </div>
                  )}
                  <div className="mt-6"><Projects rows={d.projects} onOpen={open} /></div>
                </>
              )}
            </DataView>
          </>
        )}
        {section === 'projects' &&
          (openProject ? (
            <ProjectDetail project={openProject} currency={overview.data?.projects.find((p) => p.name === openProject)?.currency} onBack={() => setOpenProject(null)} />
          ) : (
            <>
              <SectionHeader title="Projects & inventory" description="Open a project to see its units and payment plans, and to send an inventory update." />
              <DataView state={overview} isEmpty={(d) => d.projects.length === 0} empty={{ icon: Building2, title: 'No projects yet', description: 'RealtorX adds your projects after the contract is signed.' }}>
                {(d) => <Projects rows={d.projects} onOpen={setOpenProject} />}
              </DataView>
            </>
          ))}
        <React.Fragment key={visit}>
          {section === 'contract' && <ContractSection />}
          {section === 'sales' && <SalesSection />}
          {section === 'payments' && <PaymentsSection />}
          {section === 'cashflow' && <CashflowSection />}
        </React.Fragment>
        {section === 'notifications' && <NotificationsSection openLink={() => undefined} />}
        {section === 'security' && <SecuritySection email={session.user || ''} />}
      </PortalShell>
    </div>
  );
}

export default function DeveloperApp() {
  return <DashboardRoot app="developer">{(session, logout) => <DeveloperDashboard session={session} logout={logout} />}</DashboardRoot>;
}
