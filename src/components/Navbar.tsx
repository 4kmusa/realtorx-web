// Site header: logo, five sections, "Become an agent" and "Sign in" (or "My account" for a signed-in buyer). Transparent over the home hero, solid after scrolling.
import React, { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PageId } from '../types';
import { RealtorXLogo } from './RealtorXLogo';
import { Button, ButtonLink } from './site/ui';
import { PageLink } from './site/PageLink';
import { useDialogFocus } from './site/useDialogFocus';
import { DASHBOARDS, useBuyer } from '../features/buyer/session';

const NAV: { id: PageId; label: string }[] = [
  { id: 'properties', label: 'Properties' },
  { id: 'projects', label: 'Projects' },
  { id: 'developer-program', label: 'Developers' },
  { id: 'solutions', label: 'Client services' },
  { id: 'about', label: 'About' },
];

export function Navbar({ currentPage, onNavigate }: { currentPage: PageId; onNavigate: (page: PageId, id?: string) => void }) {
  const [open, setOpen] = useState(false);
  const { buyer, dashboards } = useBuyer();
  // An agent or developer signed in on this browser goes back to their dashboard from here (no "Sign in" again).
  const dashboardLinks = buyer ? [] : dashboards.map((d) => DASHBOARDS[d]);
  const [scrolled, setScrolled] = useState(false);
  const overHero = currentPage === 'home' && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (id: PageId) => {
    setOpen(false);
    onNavigate(id);
  };
  const active = (id: PageId) =>
    id === 'properties' ? ['properties', 'property-detail'].includes(currentPage)
      : id === 'projects' ? ['projects', 'project-details', 'project-3d'].includes(currentPage)
      : currentPage === id;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ${overHero ? 'border-b border-transparent bg-transparent' : 'border-b border-line bg-ink/85 backdrop-blur-xl'}`}>
        <span id="rx-progress" className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-px bg-gradient-to-r from-blue to-flame" aria-hidden="true" />
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <PageLink page="home" onNavigate={go} aria-label="RealtorX home" className="shrink-0">
            <RealtorXLogo height={36} />
          </PageLink>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <PageLink
                key={item.id}
                page={item.id}
                onNavigate={go}
                aria-current={active(item.id) ? 'page' : undefined}
                className={`relative rounded-full px-4 py-2 text-[14px] transition-colors ${active(item.id) ? 'text-fg' : 'text-fg-2 hover:text-fg'}`}
              >
                {item.label}
                {active(item.id) && <span className="absolute inset-x-4 -bottom-[3px] h-px bg-gradient-to-r from-blue to-flame" />}
              </PageLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            {dashboardLinks.length ? (
              dashboardLinks.map((d) => <ButtonLink key={d.href} href={d.href} variant="secondary" size="sm">{d.label}</ButtonLink>)
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => go(buyer ? 'account' : 'login')}>{buyer ? 'My account' : 'Sign in'}</Button>
                <Button variant="secondary" size="sm" onClick={() => go('become-agent')}>Become an agent</Button>
              </>
            )}
          </div>
          <button onClick={() => setOpen(true)} className="-mr-2 rounded-full p-2 text-fg lg:hidden" aria-label="Open menu" aria-expanded={open}>
            <Menu className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {open && <PhoneMenu onClose={() => setOpen(false)}>
          <div className="flex h-[72px] items-center justify-between px-5">
            <RealtorXLogo height={34} />
            <button onClick={() => setOpen(false)} className="-mr-2 rounded-full p-2 text-fg" aria-label="Close menu">
              <X className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>
          <nav aria-label="Main" className="flex-1 px-5 pt-6">
            {[{ id: 'home' as PageId, label: 'Home' }, ...NAV, { id: 'contact' as PageId, label: 'Contact' }].map((item, i) => (
              <PageLink key={item.id} page={item.id} onNavigate={go} style={{ animationDelay: `${i * 40}ms` }}
                className={`flex w-full animate-rise items-center justify-between border-b border-line py-4 text-left text-2xl tracking-[-0.02em] ${active(item.id) ? 'text-fg' : 'text-fg-2'}`}>
                {item.label}
              </PageLink>
            ))}
          </nav>
          <div className="grid gap-3 px-5 pb-8">
            {dashboardLinks.length ? (
              dashboardLinks.map((d) => <ButtonLink key={d.href} href={d.href} size="lg">{d.label}</ButtonLink>)
            ) : (
              <>
                <Button size="lg" onClick={() => go('become-agent')}>Become an agent</Button>
                <Button size="lg" variant="secondary" onClick={() => go(buyer ? 'account' : 'login')}>{buyer ? 'My account' : 'Sign in'}</Button>
              </>
            )}
          </div>
      </PhoneMenu>}
    </>
  );
}

/** The full-screen menu on phones: focus stays inside while it is open and Escape closes it. */
function PhoneMenu({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  useDialogFocus(box, onClose);
  return (
    <div ref={box} className="fixed inset-0 z-[60] flex flex-col bg-ink animate-fade lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      {children}
    </div>
  );
}
