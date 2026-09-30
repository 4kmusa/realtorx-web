import React from 'react';
import { PageId, Language } from '../types';
import {
  Shield,
  Users,
  Lightbulb,
  Handshake,
  BookOpen,
  Gift,
  Heart,
  TrendingUp,
  ArrowRight,
  Printer,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { RealtorXLogo } from '../components/RealtorXLogo';

interface CodePageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

interface Principle {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  motto: string;
  description: string;
  inPractice: string;
  color: string;
}

const PRINCIPLES: Principle[] = [
  {
    number: '01',
    icon: Shield,
    title: 'Integrity First',
    motto: 'Always tell the truth.',
    description:
      'Transparency in property documentation, realistic timelines, and disclosure of material facts. No false promises to close a sale.',
    inPractice:
      'Never conceal litigation, pending dues, or non-approved status of land. Tell the client the exact state before they hand over a cheque.',
    color: '#2490EF',
  },
  {
    number: '02',
    icon: Users,
    title: 'Collaboration Before Competition',
    motto: 'We grow together.',
    description:
      "Real estate deals are won through shared networks, co-broking with honor, and celebrating another agent's genuine breakthrough.",
    inPractice:
      'Respect commission splits instantly without delays or disputes. Share verified inventories with fellow custodians.',
    color: '#F5A623',
  },
  {
    number: '03',
    icon: Lightbulb,
    title: 'Solutions Over Excuses',
    motto: 'Every problem deserves an honest attempt at a solution.',
    description:
      'When delays, disputes, or documentation issues arise, we become problem-solvers, not blame-shifters. We own the outcome.',
    inPractice:
      'When Bahria Town transfer is delayed, actively follow up with the office daily. Do not leave the client alone with "system issue" excuses.',
    color: '#28A745',
  },
  {
    number: '04',
    icon: Handshake,
    title: 'Respect Every Professional',
    motto: 'Everyone has value.',
    description:
      'Whether a junior agent, senior developer, or a first-time buyer — every person in the transaction deserves dignity and respect.',
    inPractice:
      'Never undermine another agent in front of a client. Speak respectfully about competitors and colleagues.',
    color: '#2490EF',
  },
  {
    number: '05',
    icon: BookOpen,
    title: 'Learn Continuously',
    motto: 'Knowledge creates opportunity.',
    description:
      'Real estate laws, market trends, and technology evolve. We commit to staying informed so our clients benefit from expert guidance.',
    inPractice:
      'Attend Realtor X training sessions. Read Bahria Town circulars. Learn about new financing and legal frameworks.',
    color: '#F5A623',
  },
  {
    number: '06',
    icon: Gift,
    title: 'Give Before You Receive',
    motto: 'The strongest communities are built by those who contribute.',
    description:
      'Share knowledge, refer clients, mentor juniors, and contribute to the community — before expecting anything back.',
    inPractice:
      'Refer a deal to a fellow member without asking for a split. Mentor a new dealer for their first Bahria deal.',
    color: '#28A745',
  },
  {
    number: '07',
    icon: Heart,
    title: 'Protect the Community',
    motto: 'Trust takes years to build and moments to lose.',
    description:
      'One bad actor can damage the entire community. We protect Realtor X reputation through our individual actions.',
    inPractice:
      'Report fraud, fake listings, and unethical behavior — even if it is a friend. Never participate in price manipulation.',
    color: '#2490EF',
  },
  {
    number: '08',
    icon: TrendingUp,
    title: 'Leave the Industry Better Than You Found It',
    motto: 'Every action should improve the profession.',
    description:
      'Real estate in Pakistan has a mixed reputation. We are here to change that — one honest transaction at a time.',
    inPractice:
      'When you retire or leave this industry, the next generation should have a better environment because of your work.',
    color: '#F5A623',
  },
];

export const CodePage: React.FC<CodePageProps> = ({ onNavigate, language }) => {
  const handleTakeOath = () => {
    // Set flag so Oath page allows access
    sessionStorage.setItem('realtorx_dealer_flow', 'true');
    onNavigate('oath');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print(); // Browser's print → Save as PDF
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* HERO */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <div className="flex justify-center mb-6">
          <RealtorXLogo size="lg" showSubtitle={false} />
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3.5 py-1.5 rounded-full mb-6">
          <Shield className="w-3.5 h-3.5" />
          <span>Foundational Charter 03 · The 8 Principles</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white font-heading leading-tight mb-5">
          THE REALTORX CODE
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Eight cardinal principles of ethical practice, collaboration, and client duty that
          govern every Realtor X member, dealer, and custodian.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4 text-[#2490EF]" />
            Print-Friendly Version
          </button>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-[#2490EF]" />
            Download PDF
          </button>

          <button
            onClick={handleTakeOath}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 rounded-lg shadow-md transition-all"
          >
            Take the Oath
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PRINCIPLES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
        {PRINCIPLES.map((principle) => {
          const Icon = principle.icon;
          return (
            <div
              key={principle.number}
              className="group p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${principle.color}15`,
                    border: `1.5px solid ${principle.color}40`,
                  }}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  Rule #{principle.number}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white font-heading mb-2">
                {parseInt(principle.number)}. {principle.title}
              </h3>

              {/* Motto */}
              <p
                className="text-sm font-semibold italic mb-4"
                style={{ color: principle.color }}
              >
                "{principle.motto}"
              </p>

              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                {principle.description}
              </p>

              {/* In Practice */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#28A745]" />
                  <span className="text-xs font-bold text-[#28A745] uppercase tracking-wider font-mono">
                    In Practice:
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  {principle.inPractice}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM CTA */}
      <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#0E2849] via-[#0B1A30] to-[#0E2849] border border-[#2490EF]/30 text-center space-y-5 shadow-2xl">
        <Shield className="w-12 h-12 mx-auto text-[#F5A623]" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
          Ready to Live by This Code?
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Taking the Realtor X Oath is a personal commitment to uphold these eight principles
          in every transaction, every relationship, and every interaction.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleTakeOath}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 rounded-xl shadow-md transition-all"
          >
            Take the Oath
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('manifesto')}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            Read the Manifesto
          </button>
        </div>
      </div>
    </div>
  );
};
