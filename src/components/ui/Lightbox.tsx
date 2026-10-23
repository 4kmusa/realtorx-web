// Full-screen image viewer (gallery photos, floor plans): previous / next, arrow keys, Esc closes.
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxImage { src: string; caption?: string | null }

export default function Lightbox({ images, start, onClose }: { images: LightboxImage[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const go = (d: number) => setI((x) => (x + d + images.length) % images.length);
  useEffect(() => {
    const key = (e: KeyboardEvent) => (e.key === 'Escape' ? onClose() : e.key === 'ArrowRight' ? go(1) : e.key === 'ArrowLeft' ? go(-1) : undefined);
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  const img = images[i];
  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label="Photos">
      <div className="flex items-center justify-between px-4 py-3 text-sm text-fg-2">
        <span>{i + 1} / {images.length}{img.caption ? ` · ${img.caption}` : ''}</span>
        <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close"><X className="h-5 w-5" /></button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-2 pb-6">
        <img src={img.src} alt={img.caption || ''} className="max-h-full max-w-full object-contain" />
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} className="absolute left-3 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Previous"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => go(1)} className="absolute right-3 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Next"><ChevronRight className="h-5 w-5" /></button>
          </>
        )}
      </div>
    </div>
  );
}
