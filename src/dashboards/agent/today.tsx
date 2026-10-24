// Agent dashboard: "Today" — the work for the day in one list. Follow-ups due (late ones first), the next few
// days' follow-ups, new buyers not yet contacted, and buyers' installments overdue or due this week, each with a
// call and a WhatsApp button (the WhatsApp text is a polite draft the agent can change before sending).
import React from 'react';
import { CalendarCheck, MessageCircle, Phone } from 'lucide-react';
import { DataView, SectionHeader, formatDate, formatMoney, useApi } from '../kit/kit';
import { t, tf } from '../i18n';

interface LeadItem {
  name: string;
  lead_name: string;
  phone: string | null;
  status: string;
  next_followup_date: string | null;
  property_title: string | null;
  days_late: number;
}
interface InstallmentItem {
  deal: string;
  buyer_name: string;
  buyer_phone: string | null;
  unit_title: string | null;
  currency: string;
  label: string;
  due_date: string;
  outstanding: number;
  overdue: boolean;
  days: number;
}
interface Today {
  date: string;
  agent: { full_name: string; agent_id: string };
  followups: LeadItem[];
  upcoming: LeadItem[];
  new_buyers: LeadItem[];
  installments: InstallmentItem[];
}

const digits = (phone: string | null) => (phone || '').replace(/[^\d]/g, '');

function Actions({ phone, text }: { phone: string | null; text: string }) {
  if (!phone) return <span className="text-xs text-fg-3">{t('No number')}</span>;
  const cls = 'inline-flex h-9 items-center gap-1.5 rounded-full border border-line-2 px-3 text-xs text-fg hover:bg-white/5';
  return (
    <div className="flex shrink-0 gap-2">
      <a href={`tel:${phone}`} className={cls} aria-label={t('Call')}><Phone className="h-3.5 w-3.5" /> {t('Call')}</a>
      <a href={`https://wa.me/${digits(phone)}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className={cls} aria-label="WhatsApp">
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </a>
    </div>
  );
}

function Group({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (!count) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-fg-3">{t(title)} · {count}</h3>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">{children}</ul>
    </section>
  );
}

function Row({ title, detail, tone, children }: { title: string; detail: React.ReactNode; tone?: 'bad' | 'warn'; children: React.ReactNode }) {
  const dot = tone === 'bad' ? 'bg-rose-400' : tone === 'warn' ? 'bg-amber-300' : 'bg-blue-2';
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <div className="min-w-0">
          <p className="font-medium text-fg">{title}</p>
          <p className="text-xs text-fg-2">{detail}</p>
        </div>
      </div>
      {children}
    </li>
  );
}

export function TodaySection({ onOpen }: { onOpen: (section: string) => void }) {
  const state = useApi<Today>('realtor_x.api.portal.agent_today', undefined, 'today');
  return (
    <>
      <SectionHeader title="Today" description="Calls, follow-ups and payment reminders for today, in one place." />
      <DataView
        state={state}
        isEmpty={(d) => !d.followups.length && !d.upcoming.length && !d.new_buyers.length && !d.installments.length}
        empty={{ icon: CalendarCheck, title: 'Nothing due today', description: 'No follow-ups or payment reminders. A good day to share new units with buyers.' }}
      >
        {(d) => {
          const me = `${d.agent.full_name} (RealtorX Agent ${d.agent.agent_id})`;
          const late = d.installments.filter((i) => i.overdue);
          const soon = d.installments.filter((i) => !i.overdue);
          const reminder = (i: InstallmentItem) =>
            `Assalam-o-Alaikum ${i.buyer_name}, this is ${me}. A reminder that "${i.label}" of ${formatMoney(i.outstanding, i.currency)} for ${i.unit_title || 'your unit'} ` +
            (i.overdue ? `was due on ${formatDate(i.due_date)}.` : `is due on ${formatDate(i.due_date)}.`) +
            ' Please pay into the account on your RealtorX booking documents and send me the receipt. Thank you.';
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Follow-ups due', d.followups.length, d.followups.some((f) => f.days_late > 0)],
                  ['New buyers to call', d.new_buyers.length, false],
                  ['Installments overdue', late.length, late.length > 0],
                  ['Due this week', soon.length, false],
                ].map(([label, n, bad]) => (
                  <div key={label as string} className="rounded-2xl border border-line bg-panel p-4">
                    <p className="text-xs text-fg-2">{t(label as string)}</p>
                    <p className={`mt-1 text-2xl font-medium tabular-nums ${bad ? 'text-rose-400' : 'text-fg'}`}>{n as number}</p>
                  </div>
                ))}
              </div>

              <Group title="Follow-ups due" count={d.followups.length}>
                {d.followups.map((f) => (
                  <Row key={f.name} title={f.lead_name} tone={f.days_late > 0 ? 'bad' : 'warn'}
                    detail={<>{f.status}{f.property_title ? ` · ${f.property_title}` : ''} · {f.days_late > 0 ? tf('{0} days late', f.days_late) : t('today')}</>}>
                    <Actions phone={f.phone} text={`Assalam-o-Alaikum ${f.lead_name}, this is ${me}. Following up on ${f.property_title || 'the property you asked about'}. Is now a good time to talk?`} />
                  </Row>
                ))}
              </Group>

              <Group title="New buyers to call" count={d.new_buyers.length}>
                {d.new_buyers.map((f) => (
                  <Row key={f.name} title={f.lead_name} detail={<>{t('Not contacted yet')}{f.property_title ? ` · ${f.property_title}` : ''}</>}>
                    <Actions phone={f.phone} text={`Assalam-o-Alaikum ${f.lead_name}, this is ${me}. Thank you for your interest${f.property_title ? ` in ${f.property_title}` : ''}. When can I call you with the details and payment plan?`} />
                  </Row>
                ))}
              </Group>

              <Group title="Installments overdue" count={late.length}>
                {late.map((i) => (
                  <Row key={`${i.deal}-${i.label}`} title={i.buyer_name} tone="bad"
                    detail={<>{i.label} · <span dir="ltr">{formatMoney(i.outstanding, i.currency)}</span> · {t('was due')} {formatDate(i.due_date)} · {i.unit_title}</>}>
                    <Actions phone={i.buyer_phone} text={reminder(i)} />
                  </Row>
                ))}
              </Group>

              <Group title="Due this week" count={soon.length}>
                {soon.map((i) => (
                  <Row key={`${i.deal}-${i.label}`} title={i.buyer_name}
                    detail={<>{i.label} · <span dir="ltr">{formatMoney(i.outstanding, i.currency)}</span> · {t('due')} {formatDate(i.due_date)} · {i.unit_title}</>}>
                    <Actions phone={i.buyer_phone} text={reminder(i)} />
                  </Row>
                ))}
              </Group>

              <Group title="Coming up" count={d.upcoming.length}>
                {d.upcoming.map((f) => (
                  <Row key={f.name} title={f.lead_name} detail={<>{f.status}{f.property_title ? ` · ${f.property_title}` : ''} · {formatDate(f.next_followup_date)}</>}>
                    <button onClick={() => onOpen('leads')} className="text-xs text-fg-2 underline underline-offset-4 hover:text-fg">{t('Open my buyers')}</button>
                  </Row>
                ))}
              </Group>
              <p className="text-xs text-fg-3">{t('Record what happened on each call in My buyers, so the next follow-up date is set.')}</p>
            </div>
          );
        }}
      </DataView>
    </>
  );
}
