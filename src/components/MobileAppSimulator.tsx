import React from 'react';
import { ViewMode, Language } from '../types';
import { BookOpen, Shield, Award, Quote, Users, Wifi, Battery, Signal } from 'lucide-react';

interface MobileAppSimulatorProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  language: Language;
  children: React.ReactNode;
  onExitMobileSim: () => void;
}

export const MobileAppSimulator: React.FC<MobileAppSimulatorProps> = ({
  currentView,
  onSelectView,
  language,
  children,
  onExitMobileSim
}) => {
  return (
    <div className="min-h-screen bg-stone-950 py-8 px-4 flex flex-col items-center justify-center">
      {/* Device Mode Notice Bar */}
      <div className="mb-4 flex items-center justify-between w-full max-w-sm px-2 text-xs font-mono text-stone-400">
        <span className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          RealtorX Mobile App (iOS / Android Simulator)
        </span>
        <button
          onClick={onExitMobileSim}
          className="text-stone-300 hover:text-white underline"
        >
          Exit to Full Web
        </button>
      </div>

      {/* Realistic Mobile Device Frame */}
      <div className="relative w-full max-w-[390px] h-[820px] bg-stone-900 rounded-[50px] p-3 shadow-2xl border-4 border-stone-800 ring-1 ring-stone-700/50 flex flex-col overflow-hidden">

        {/* Dynamic Island / Top Camera Notch */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-800" />
          <div className="w-2 h-2 rounded-full bg-blue-950/80" />
        </div>

        {/* Mobile Status Bar */}
        <div className="pt-2 px-6 pb-1 flex items-center justify-between text-[11px] font-mono text-stone-300 z-40 bg-stone-950">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-stone-300" />
            <Wifi className="w-3 h-3 text-stone-300" />
            <Battery className="w-3.5 h-3.5 text-stone-300" />
          </div>
        </div>

        {/* Inner Mobile App Screen with Scroll */}
        <div className="flex-1 bg-stone-950 text-stone-100 overflow-y-auto rounded-[38px] pb-20 no-scrollbar">
          {children}
        </div>

        {/* Native Mobile Bottom Navigation Bar */}
        <div className="absolute bottom-3 left-3 right-3 bg-stone-950/95 backdrop-blur-md border-t border-stone-800/80 py-2 px-3 rounded-b-[40px] z-40 flex items-center justify-around">
          <button
            onClick={() => onSelectView('manifesto')}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
              currentView === 'manifesto' ? 'text-amber-400 font-semibold' : 'text-stone-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Charter</span>
          </button>

          <button
            onClick={() => onSelectView('philosophy')}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
              currentView === 'philosophy' ? 'text-amber-400 font-semibold' : 'text-stone-400'
            }`}
          >
            <Quote className="w-4 h-4" />
            <span>Hub Wall</span>
          </button>

          <button
            onClick={() => onSelectView('oath')}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
              currentView === 'oath' ? 'text-amber-400 font-semibold' : 'text-stone-400'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Oath</span>
          </button>

          <button
            onClick={() => onSelectView('code')}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
              currentView === 'code' ? 'text-amber-400 font-semibold' : 'text-stone-400'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Code</span>
          </button>

          <button
            onClick={() => onSelectView('members')}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono transition-colors ${
              currentView === 'members' ? 'text-amber-400 font-semibold' : 'text-stone-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Custodians</span>
          </button>
        </div>

        {/* Home indicator line */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-stone-600 rounded-full z-50 pointer-events-none" />
      </div>
    </div>
  );
};
