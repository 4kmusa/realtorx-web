// RealtorX motion: a small, light set of animations in the logo's colours (blue and flame).
// - Words: headlines rise word by word out of a mask (at once, or when scrolled into view).
// - useMotion (once, in App): reveals .reveal / .reveal-img / .rx-words-scroll elements as they enter the screen,
//   the cursor spotlight on .spotlight cards, the pull of .magnetic buttons and the page progress hairline.
// - useScrollProgress: 0..1 progress of an element through the screen (the home page deal journey).
// - CountUp: numbers count up when they come into view.
// Everything uses transform / opacity / clip-path only, and is switched off for "reduce motion" users.
import React, { useEffect, useRef, useState } from 'react';

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

// ── Headlines word by word ─────────────────────────────────────────────────

/** Splits text children into words that rise out of a mask; elements (e.g. the italic <span className="em">) rise as one word. */
export function Words({ children, delay = 0, onScroll = false }: { children: React.ReactNode; delay?: number; onScroll?: boolean }) {
  let i = 0;
  const word = (content: React.ReactNode, key: string) => (
    <span key={key} className="w"><span style={{ ['--i' as string]: i++ }}>{content}</span></span>
  );
  const flat = (nodes: React.ReactNode): React.ReactNode[] => React.Children.toArray(nodes).flatMap((n) =>
    React.isValidElement(n) && n.type === React.Fragment ? flat((n.props as { children?: React.ReactNode }).children) : [n]);
  const parts: React.ReactNode[] = [];
  flat(children).forEach((child, c) => {
    if (typeof child === 'string' || typeof child === 'number') {
      String(child).split(/(\s+)/).forEach((piece, p) => {
        if (!piece) return;
        parts.push(/^\s+$/.test(piece) ? ' ' : word(piece, `${c}-${p}`));
      });
    } else {
      parts.push(word(child, `${c}-el`));
    }
  });
  const step = Math.min(35, Math.round(500 / Math.max(1, i))); // long sentences finish in about half a second
  return <span className={onScroll ? 'rx-words rx-words-scroll' : 'rx-words'} style={{ ['--d' as string]: `${delay}ms`, ['--step' as string]: `${step}ms` }}>{parts}</span>;
}

// ── App-wide motion ─────────────────────────────────────────────────────────

const REVEAL = '.reveal:not(.is-visible), .reveal-img:not(.is-visible), .rx-words-scroll:not(.is-visible)';

export function useMotion(pageKey: string) {
  // Scroll reveals, also for content that arrives later (search results, lazy pages).
  useEffect(() => {
    const show = (el: Element) => el.classList.add('is-visible');
    if (!('IntersectionObserver' in window) || reducedMotion()) {
      const all = () => document.querySelectorAll(REVEAL).forEach(show);
      all();
      const mo = new MutationObserver(all);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        show(e.target);
        io.unobserve(e.target);
      }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    const watched = new WeakSet<Element>();
    const scan = () => document.querySelectorAll(REVEAL).forEach((el) => {
      if (!watched.has(el)) {
        watched.add(el);
        io.observe(el);
      }
    });
    scan();
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  // Cursor spotlight on cards and the pull of call-to-action buttons (mouse and trackpad only).
  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    let magnet: HTMLElement | null = null;
    const release = () => {
      if (magnet) magnet.style.transform = '';
      magnet = null;
    };
    const onMove = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const card = target?.closest?.('.spotlight') as HTMLElement | null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
      const button = target?.closest?.('.magnetic') as HTMLElement | null;
      if (button !== magnet) release();
      if (button) {
        magnet = button;
        const r = button.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        button.style.transform = `translate(${dx * 3}px, ${dy * 2}px)`;
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', release);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', release);
      release();
    };
  }, []);

  // Page progress hairline (blue to flame) under the header.
  useEffect(() => {
    const bar = document.getElementById('rx-progress');
    if (!bar) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pageKey]);
}

// ── Scroll-linked progress ─────────────────────────────────────────────────

/** Calls `onProgress(0..1)` as the element moves from the lower part of the screen to the upper part. */
export function useScrollProgress(ref: React.RefObject<HTMLElement | null>, onProgress: (p: number) => void, deps: unknown[] = []) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      onProgress(1);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = Math.max(vh * 0.45, r.height * 0.9);
      onProgress(Math.min(1, Math.max(0, (vh * 0.82 - r.top) / span)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ── Numbers ──────────────────────────────────────────────────────────────

/** "80%" counts 0 → 80 when it comes into view; text without a number is shown as it is. */
export function CountUp({ value, duration = 900, className }: { value: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const match = value.match(/^(\D*)(\d+)(.*)$/);
  useEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    const [, pre, num, post] = match;
    const target = Number(num);
    if (reducedMotion() || target === 0) return;
    el.textContent = `${pre}0${post}`;
    let raf = 0;
    const start = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - k, 4);
        el.textContent = `${pre}${Math.round(target * eased)}${post}`;
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect();
        start();
      }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span ref={ref} className={className} aria-label={value}>{value}</span>;
}
