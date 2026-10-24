// Building blocks of the RealtorX website design (see src/index.css for the tokens).
import React, { useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Words } from './motion';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/** The crossing lines of the logo's X: blue and flame. The brand's one decorative mark. */
export function XMark({ className = 'h-3 w-3', draw, delay = 0 }: { className?: string; draw?: boolean; delay?: number }) {
  return (
    <svg viewBox="0 0 12 12" className={cx(className, draw && 'rx-draw')} style={draw ? ({ ['--d' as string]: `${delay}ms` } as React.CSSProperties) : undefined} aria-hidden="true">
      <path d="M1 1 L11 11" pathLength={1} stroke="var(--color-blue)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 1 L1 11" pathLength={1} stroke="var(--color-flame)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Container({ children, className, narrow }: { children: React.ReactNode; className?: string; narrow?: boolean }) {
  return <div className={cx('mx-auto w-full px-5 sm:px-8', narrow ? 'max-w-4xl' : 'max-w-[1240px]', className)}>{children}</div>;
}

export function Section({ children, className, tone = 'ink', id }: { children: React.ReactNode; className?: string; tone?: 'ink' | 'ink-2'; id?: string }) {
  return (
    <section id={id} className={cx('py-20 md:py-28', tone === 'ink-2' ? 'bg-ink-2' : 'bg-ink', className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cx('flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.24em] text-fg-3', className)}>
      <XMark className="h-2.5 w-2.5" /> {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow, title, intro, action, center,
}: { eyebrow?: string; title: React.ReactNode; intro?: React.ReactNode; action?: React.ReactNode; center?: boolean }) {
  return (
    <div className={cx('mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16', center && 'flex-col items-center text-center')}>
      <div className={cx('max-w-2xl', center && 'mx-auto')}>
        {eyebrow && <Eyebrow className={cx('mb-5', center && 'justify-center')}>{eyebrow}</Eyebrow>}
        <h2 className="text-balance text-3xl font-medium leading-[1.08] tracking-[-0.03em] text-fg md:text-[44px]"><Words onScroll>{title}</Words></h2>
        {intro && <p className="mt-5 text-pretty text-[15px] leading-relaxed text-fg-2 md:text-base">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

/** Top of an inner page: eyebrow, big title, short intro; optional photo band below. */
export function PageIntro({ eyebrow, title, intro, image, children }: { eyebrow: string; title: React.ReactNode; intro?: React.ReactNode; image?: string; children?: React.ReactNode }) {
  return (
    <header className="relative border-b border-line bg-ink">
      <Container className="pb-14 pt-16 md:pb-20 md:pt-24">
        <Eyebrow className="mb-6 animate-fade">{eyebrow}</Eyebrow>
        <h1 className="max-w-4xl text-balance text-[40px] font-medium leading-[1.02] tracking-[-0.035em] text-fg md:text-[68px]"><Words delay={40}>{title}</Words></h1>
        {intro && <p style={{ animationDelay: '150ms' }} className="mt-6 max-w-2xl animate-rise text-pretty text-base leading-relaxed text-fg-2 md:text-lg">{intro}</p>}
        {children && <div className="mt-8">{children}</div>}
      </Container>
      {image && (
        <Container className="pb-4">
          <div className="relative aspect-[21/8] overflow-hidden rounded-2xl">
            <img src={image} alt="" className="rx-kenburns h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
          </div>
        </Container>
      )}
    </header>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'gradient';
const buttonClass = (variant: ButtonVariant, size: 'sm' | 'md' | 'lg', className?: string, arrow?: boolean) =>
  cx(
    'rx-btn inline-flex select-none items-center justify-center gap-2 rounded-full font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
    size === 'sm' ? 'h-9 px-4 text-[13px]' : size === 'lg' ? 'h-[52px] px-7 text-[15px]' : 'h-11 px-5 text-sm',
    variant === 'primary' && 'bg-fg text-ink hover:bg-white',
    arrow && 'magnetic',
    variant === 'secondary' && 'border border-line-2 text-fg hover:border-fg/40 hover:bg-white/[0.04]',
    variant === 'ghost' && 'text-fg-2 hover:text-fg',
    variant === 'accent' && 'bg-blue text-white hover:bg-[#3c78ff]',
    variant === 'gradient' && 'rx-shine bg-gradient-to-r from-blue to-flame text-white hover:shadow-[0_8px_30px_-6px_rgb(255_122_26/0.55)]',
    (variant === 'primary' || variant === 'accent') && 'rx-shine',
    className
  );

export function Button({
  variant = 'primary', size = 'md', busy, arrow, className, children, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg'; busy?: boolean; arrow?: boolean }) {
  return (
    <button {...props} disabled={busy || props.disabled} className={buttonClass(variant, size, className, arrow)}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
      {arrow && !busy && <ArrowRight className="h-4 w-4" strokeWidth={1.75} />}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary', size = 'md', arrow, className, children, ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg'; arrow?: boolean }) {
  return (
    <a {...props} className={buttonClass(variant, size, className, arrow)}>
      {children}
      {arrow && <ArrowRight className="h-4 w-4" strokeWidth={1.75} />}
    </a>
  );
}

/** Quiet text link with an arrow that moves on hover. */
export function TextLink({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={cx('tap group inline-flex items-center gap-2 text-sm font-medium text-fg', className)}>
      <span className="border-b border-line-2 pb-0.5 transition-colors group-hover:border-fg">{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} />
    </button>
  );
}

export function Tag({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'good' | 'blue' }) {
  return (
    <span className={cx(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
      tone === 'good' ? 'bg-good/10 text-good' : tone === 'blue' ? 'bg-blue/15 text-blue-2' : 'bg-white/[0.06] text-fg-2'
    )}>
      {children}
    </span>
  );
}

// ── Forms ────────────────────────────────────────────────────────────────

export const inputClass =
  'h-12 w-full rounded-xl border border-line bg-panel px-4 text-[15px] text-fg placeholder:text-fg-3 outline-none transition-colors focus:border-blue-2/70 focus:bg-panel-2';
export const textareaClass =
  'w-full rounded-xl border border-line bg-panel px-4 py-3 text-[15px] leading-relaxed text-fg placeholder:text-fg-3 outline-none transition-colors focus:border-blue-2/70 focus:bg-panel-2';

export function Field({ label, htmlFor, hint, error, children, className }: { label: string; htmlFor: string; hint?: string; error?: string | null; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block text-[13px] font-medium text-fg-2">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-bad">{error}</p> : hint ? <p className="mt-1.5 text-xs text-fg-3">{hint}</p> : null}
    </div>
  );
}

export function Checkbox({ checked, onChange, children, id }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; id?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-fg-2">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#2d6cf6]" />
      <span>{children}</span>
    </label>
  );
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx(
      'rounded-xl border px-4 py-3 text-sm leading-relaxed',
      tone === 'error' ? 'border-bad/25 bg-bad/[0.06] text-[#fecaca]' : tone === 'success' ? 'border-good/25 bg-good/[0.06] text-[#bbf7d0]' : 'border-line bg-panel text-fg-2'
    )}>
      {children}
    </div>
  );
}

/** Fade sections in as they scroll into view (elements with class "reveal"). */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
