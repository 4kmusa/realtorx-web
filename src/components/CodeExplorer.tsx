import React, { useState } from 'react';
import { CodeTenet, Language } from '../types';
import {
  Shield,
  Users,
  Lightbulb,
  Handshake,
  BookOpen,
  Gift,
  Heart,
  TrendingUp,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

interface CodeExplorerProps {
  tenets: CodeTenet[];
  language: Language;
}

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

const ICON_MAP: Record<string, IconComponent> = {
  shield: Shield,
  users: Users,
  lightbulb: Lightbulb,
  handshake: Handshake,
  book: BookOpen,
  gift: Gift,
  heart: Heart,
  trending: TrendingUp,
};

const DEFAULT_COLOR = '#2490EF';

// Safe icon getter — handles undefined icon name
function getIcon(iconName: string | undefined): IconComponent {
  if (!iconName) return Shield;
  return ICON_MAP[iconName] || Shield;
}

// Safe color getter
function getColor(color: string | undefined): string {
  return color || DEFAULT_COLOR;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({ tenets, language }) => {
  const [activeId, setActiveId] = useState<string>(tenets[0]?.id || '');
  const activeTenet = tenets.find((t) => t.id === activeId) || tenets[0];

  if (!activeTenet) {
    return (
      <div className="text-center py-12 text-slate-400">
        No code tenets available.
      </div>
    );
  }

  const ActiveIcon = getIcon(activeTenet.icon);
  const activeColor = getColor(activeTenet.color);
  const isUrdu = language === 'ur';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT SIDEBAR */}
      <div className="lg:col-span-4 space-y-2">
        {tenets.map((tenet) => {
          const Icon = getIcon(tenet.icon);
          const color = getColor(tenet.color);
          const isActive = tenet.id === activeId;

          return (
            <button
              key={tenet.id}
              onClick={() => setActiveId(tenet.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                isActive
                  ? 'bg-[#2490EF]/10 border-[#2490EF]/50 shadow-lg'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform"
                style={{
                  backgroundColor: `${color}15`,
                  border: `1.5px solid ${color}40`,
                }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    #{tenet.number}
                  </span>
                </div>
                <h3
                  className={`font-heading font-bold text-sm leading-snug ${
                    isActive ? 'text-white' : 'text-slate-200'
                  }`}
                >
                  {isUrdu && tenet.titleUrdu ? tenet.titleUrdu : tenet.title}
                </h3>
                <p
                  className="text-xs italic mt-1 line-clamp-1"
                  style={{ color: isActive ? color : '#64748b' }}
                >
                  "{isUrdu && tenet.mottoUrdu ? tenet.mottoUrdu : tenet.motto}"
                </p>
              </div>

              <ChevronRight
                className={`w-4 h-4 shrink-0 mt-2 transition-transform ${
                  isActive ? 'text-[#2490EF] translate-x-0' : 'text-slate-600'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* RIGHT: Active Detail */}
      <div className="lg:col-span-8">
        <div
          className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border-2 sticky top-24"
          style={{ borderColor: `${activeColor}40` }}
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${activeColor}15`,
                border: `2px solid ${activeColor}50`,
              }}
            >
              <ActiveIcon className="w-8 h-8" style={{ color: activeColor }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Principle #{activeTenet.number}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading leading-tight">
                {isUrdu && activeTenet.titleUrdu
                  ? activeTenet.titleUrdu
                  : activeTenet.title}
              </h2>
            </div>
          </div>

          {/* Motto */}
          <div
            className="mb-6 p-4 rounded-xl border-l-4"
            style={{
              borderColor: activeColor,
              backgroundColor: `${activeColor}08`,
            }}
          >
            <p
              className="text-lg font-semibold italic"
              style={{ color: activeColor }}
            >
              "{isUrdu && activeTenet.mottoUrdu ? activeTenet.mottoUrdu : activeTenet.motto}"
            </p>
          </div>

          {/* Description */}
          {activeTenet.description && (
            <div className="mb-6">
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {activeTenet.description}
              </p>
            </div>
          )}

          {/* In Practice */}
          <div className="mb-6 p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#28A745]" />
              <span className="text-xs font-bold text-[#28A745] uppercase tracking-wider font-mono">
                In Practice
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {activeTenet.inPractice}
            </p>
          </div>

          {/* Dilemma */}
          {activeTenet.dilemma && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-[#F5A623]" />
                <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider font-mono">
                  Real Dilemma
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                  Situation
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeTenet.dilemma.situation}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                      Unethical Move
                    </span>
                  </div>
                  <p className="text-sm text-red-300/90 leading-relaxed">
                    {activeTenet.dilemma.unethicalMove}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#28A745]/5 border border-[#28A745]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#28A745]" />
                    <span className="text-xs font-bold text-[#28A745] uppercase tracking-wider font-mono">
                      RealtorX Way
                    </span>
                  </div>
                  <p className="text-sm text-[#28A745] leading-relaxed">
                    {activeTenet.dilemma.realtorxWay}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
