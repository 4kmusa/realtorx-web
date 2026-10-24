// Agent dashboard overview: key figures for the agent's buyers, deals, collections and commission.
import React from 'react';
import { StatCard, formatMoneyList, useApi, type MoneyAmount } from '../kit/kit';
import { tf, tn } from '../i18n';

export interface AgentKpis {
  buyers_open: number;
  buyers_new_this_month: number;
  followups_due: number;
  deals_open: number;
  deals_transferred: number;
  deals_this_month: number;
  conversion: number;
  sales_value: MoneyAmount[];
  overdue: MoneyAmount[];
  overdue_deals: number;
  commission: { pending: MoneyAmount[]; earned: MoneyAmount[]; paid: MoneyAmount[] };
  open_cases: number;
}

export function AgentKpiCards({ onOpen }: { onOpen: (section: string) => void }) {
  const state = useApi<AgentKpis>('realtor_x.api.portal.agent_overview', undefined, 'overview');
  const k = state.data;
  if (!k) return null;
  const card = (section: string, el: React.ReactNode) => (
    <button type="button" onClick={() => onOpen(section)} className="h-full text-start transition hover:opacity-90">{el}</button>
  );
  return (
    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {card('leads', <StatCard label="Open buyers" value={k.buyers_open} hint={tf('{0} new this month', k.buyers_new_this_month)} />)}
      {card('today', <StatCard label="Follow-ups due" value={k.followups_due} tone={k.followups_due ? 'warn' : 'default'} hint="Today or earlier" />)}
      {card('deals', <StatCard label="Open deals" value={k.deals_open} hint={tf('{0} transferred', k.deals_transferred) + (k.buyers_open || k.conversion ? ` · ${tf('{0}% of buyers booked', k.conversion)}` : '')} />)}
      {card('deals', <StatCard label="Sales value" value={formatMoneyList(k.sales_value)} hint={tn(k.deals_this_month, '{0} deal this month', '{0} deals this month')} />)}
      {card('today', <StatCard label="Buyer payments overdue" value={formatMoneyList(k.overdue)} tone={k.overdue_deals ? 'warn' : 'default'} hint={tn(k.overdue_deals, '{0} deal', '{0} deals')} />)}
      {card('commission', <StatCard label="Commission expected" value={formatMoneyList(k.commission.pending)} hint="Deals not yet at the earning point" />)}
      {card('commission', <StatCard label="Commission earned" value={formatMoneyList(k.commission.earned)} tone="good" hint="Waiting for the developer / payout" />)}
      {card('commission', <StatCard label="Commission paid to you" value={formatMoneyList(k.commission.paid)} tone="good" hint={k.open_cases ? tn(k.open_cases, '{0} open client case', '{0} open client cases') : undefined} />)}
    </div>
  );
}
