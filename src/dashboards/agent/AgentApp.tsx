// RealtorX Agent dashboard (/agent/): key figures, today's work list, inventory to sell with commission estimates and share links,
// buyers, deals with payment statements, commission, client cases, profile, notifications and security.
import React, { useState } from 'react';
import { Bell, Briefcase, Building2, CalendarCheck, Home, LifeBuoy, Lock, UserRound, Users, Wallet } from 'lucide-react';
import DashboardRoot from '../DashboardRoot';
import { DashboardSession } from '../session';
import { NavItem, PortalShell, useApi } from '../kit/kit';
import { NotificationsSection, SecuritySection, useUnreadCount } from '../kit/shared';
import { useSection } from '../useSection';
import { Welcome } from '../common';
import { AgentProfile, AgentStats, InventorySection, ProfileSection } from './sections';
import { BuyersSection, DealsSection } from './buyers';
import { CommissionSection } from './commission';
import { CasesSection } from './cases';
import { AgentKpiCards } from './overview';
import { TodaySection } from './today';

const NAV: NavItem[] = [
  { section: 'overview', label: 'Overview', icon: Home },
  { section: 'today', label: 'Today', icon: CalendarCheck },
  { section: 'inventory', label: 'Inventory to sell', icon: Building2 },
  { section: 'leads', label: 'My buyers', icon: Users },
  { section: 'deals', label: 'Deals', icon: Briefcase },
  { section: 'commission', label: 'Commission', icon: Wallet },
  { section: 'cases', label: 'Client cases', icon: LifeBuoy },
  { section: 'profile', label: 'My profile', icon: UserRound },
  { section: 'notifications', label: 'Notifications', icon: Bell },
  { section: 'security', label: 'Security', icon: Lock },
];

function AgentDashboard({ session, logout }: { session: DashboardSession; logout: () => void }) {
  const [section, go] = useSection('agent', 'overview', NAV.map((n) => n.section));
  const [visit, setVisit] = useState(0); // a menu click always opens the section's first screen (e.g. the list, not an open record)
  const select = (next: string) => {
    setVisit((v) => v + 1);
    go(next);
  };
  const unread = useUnreadCount(section);
  const profile = useApi<AgentProfile>('realtor_x.api.portal.agent_profile', undefined, ['profile', 'commission'].includes(section) ? section : 'o');
  return (
    <div className="min-h-screen bg-ink text-fg">
      <PortalShell title="RealtorX Agent" subtitle={session.full_name || session.user || ''} nav={NAV} active={section} onSelect={select} onLogout={logout} badges={{ notifications: unread }}>
        <React.Fragment key={visit}>
        {section === 'overview' && <AgentStats profile={profile.data} />}
        {section === 'overview' && profile.data?.agent && <AgentKpiCards onOpen={go} />}
        {section === 'overview' && (
          <Welcome
            name={session.full_name}
            lines={[
              'You sell RealtorX inventory from contracted developers. RealtorX handles the paperwork, payments, installments and possession for your buyers.',
              'Commission is set for each project; your share is shown with every unit and deal.',
            ]}
            next={['Today', 'Inventory to sell', 'My buyers', 'Deals', 'Commission', 'Client cases']}
            onOpen={(label) => go(NAV.find((n) => n.label === label)?.section || 'overview')}
          />
        )}
        {section === 'today' && <TodaySection onOpen={go} />}
        {section === 'inventory' && <InventorySection />}
        {section === 'profile' && <ProfileSection state={profile} />}
        {section === 'leads' && <BuyersSection />}
        {section === 'deals' && <DealsSection />}
        {section === 'cases' && <CasesSection />}
        {section === 'commission' && <CommissionSection profile={profile.data} onProfile={profile.reload} />}
        {section === 'notifications' && <NotificationsSection openLink={() => undefined} />}
        {section === 'security' && <SecuritySection email={session.user || ''} />}
        </React.Fragment>
      </PortalShell>
    </div>
  );
}

export default function AgentApp() {
  return <DashboardRoot app="agent">{(session, logout) => <AgentDashboard session={session} logout={logout} />}</DashboardRoot>;
}
