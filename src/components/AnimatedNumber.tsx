import React, { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  /** Duration in ms — default 1200 */
  duration?: number;
  /** Formatter function — default just locale string */
  format?: (n: number) => string;
  /** Class name for wrapper span */
  className?: string;
  /** Skip animation and just show value */
  instant?: boolean;
}

/**
 * Animates a number from 0 to `value` using requestAnimationFrame
 * with an ease-out cubic curve. Respects prefers-reduced-motion.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1200,
  format,
  className,
  instant = false,
}) => {
  const [display, setDisplay] = useState(instant ? value : 0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  // Respect reduced motion
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (instant || prefersReduced) {
      setDisplay(value);
      return;
    }

    // Cancel any in-flight animation
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    // Start from current display value (handles value changes mid-anim)
    fromRef.current = display;
    startRef.current = null;

    const from = fromRef.current;
    const delta = value - from;

    // Nothing to animate
    if (Math.abs(delta) < 0.5) {
      setDisplay(value);
      return;
    }

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const next = from + delta * eased;

      setDisplay(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, instant, prefersReduced]);

  const text = format ? format(display) : Math.round(display).toLocaleString('en-PK');

  return <span className={className}>{text}</span>;
};

export default AnimatedNumber;
