// A small cursor in the brand colours for mouse and trackpad users: a dot that follows at once and a ring that
// follows smoothly. Over links and buttons the ring opens into a soft glow; it shrinks while pressing; over text
// fields the normal text cursor comes back. Not shown on touch screens or for "reduce motion" users.
import { useEffect, useRef } from 'react';
import { reducedMotion } from './motion';

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], label, summary, .rx-tile';
const TEXT = 'input, textarea, select, [contenteditable="true"], iframe';

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)');
    if (!fine?.matches || reducedMotion()) return;
    const root = document.documentElement;
    root.classList.add('rx-cursor-on');
    let x = -100, y = -100, rx = -100, ry = -100, frame = 0;

    const loop = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      frame = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      root.classList.add('rx-cursor-show');
      const target = e.target as Element | null;
      root.classList.toggle('rx-cursor-text', !!target?.closest?.(TEXT));
      root.classList.toggle('rx-cursor-hover', !!target?.closest?.(INTERACTIVE));
      kick();
    };
    const onDown = () => root.classList.add('rx-cursor-down');
    const onUp = () => root.classList.remove('rx-cursor-down');
    const onLeave = () => root.classList.remove('rx-cursor-show');

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      root.classList.remove('rx-cursor-on', 'rx-cursor-show', 'rx-cursor-hover', 'rx-cursor-down', 'rx-cursor-text');
    };
  }, []);

  return (
    <>
      <div ref={ring} className="rx-cursor-ring" aria-hidden="true" />
      <div ref={dot} className="rx-cursor-dot" aria-hidden="true" />
    </>
  );
}
