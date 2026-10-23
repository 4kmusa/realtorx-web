// Small pieces shared by the Agent and Developer dashboards.
import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { SectionHeader } from './kit/kit';
import { t } from './i18n';

export function Welcome({ name, lines, next, onOpen }: { name?: string; lines: string[]; next: string[]; onOpen: (label: string) => void }) {
  return (
    <>
      <SectionHeader title={`${t('Welcome')}${name ? `, ${name.split(' ')[0]}` : ''}`} />
      <div className="space-y-2 rounded-xl border border-line bg-panel p-5 text-sm leading-relaxed text-fg-2">
        {lines.map((l) => <p key={l}>{t(l)}</p>)}
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {next.map((label) => (
          <li key={label}>
            <button onClick={() => onOpen(label)} className="flex w-full items-center justify-between rounded-xl border border-line bg-panel px-4 py-3 text-start text-sm text-fg hover:border-fg/40">
              {t(label)} <ArrowRight className="h-4 w-4 text-fg rtl:rotate-180" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ComingSoon({ title, phase, text }: { title: string; phase: string; text: string }) {
  return (
    <>
      <SectionHeader title={title} />
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-line-2 bg-panel p-6 text-sm text-fg-2">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-fg" />
        <div>
          <p className="font-semibold text-fg">Coming in {phase}</p>
          <p className="mt-1 text-fg-2">{text}</p>
        </div>
      </div>
    </>
  );
}
