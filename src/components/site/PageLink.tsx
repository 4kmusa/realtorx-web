// A real link (<a href>) to a page of the website: search engines can follow it, and visitors can open it in a new
// tab, while a normal click still changes the page without a reload.
import React from 'react';
import { PageId } from '../../types';
import { pathFor } from '../../app/routes';

/** A plain left click goes through `go`; Ctrl/⌘/Shift/middle clicks are left to the browser (new tab or window). */
export function follow(e: React.MouseEvent, go: () => void) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  go();
}

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> & {
  page: PageId;
  id?: string;
  onNavigate: (page: PageId, id?: string) => void;
};

export function PageLink({ page, id, onNavigate, children, ...rest }: Props) {
  return (
    <a href={pathFor(page, id)} onClick={(e) => follow(e, () => onNavigate(page, id))} {...rest}>
      {children}
    </a>
  );
}
