import React, { useState } from 'react';
import { PageId, Property } from '../types';
import { applyPageSEO, PageSEOMetadata, REALTORX_PHILOSOPHY_QUOTE } from '../utils/seo';
import {
  X,
  Share2,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Quote,
  Eye,
  Code2,
  MessageCircle
} from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: PageId;
  property?: Property;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  currentPage,
  property,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'tags'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const metadata: PageSEOMetadata = applyPageSEO(currentPage, property);
  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${metadata.canonicalPath}`
    : `https://realtorx.pk${metadata.canonicalPath}`;

  const imageUrl = metadata.ogImage.startsWith('http')
    ? metadata.ogImage
    : (typeof window !== 'undefined' ? `${window.location.origin}${metadata.ogImage}` : metadata.ogImage);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `${metadata.title}\n\n"${REALTORX_PHILOSOPHY_QUOTE}"\n\n${currentUrl}`;

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `"${REALTORX_PHILOSOPHY_QUOTE}" — Realtor X Bahria Town Karachi`
    )}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank');
  };

  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank');
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0A1628] border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-[#2490EF]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <span>Social Media &amp; SEO Metadata</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  Open Graph &amp; Twitter Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Preview how this page appears on Facebook, WhatsApp, X/Twitter, and LinkedIn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Philosophy Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-[#2490EF]/10 to-transparent border-b border-slate-800/80 px-6 py-3 flex items-start gap-2.5">
          <Quote className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-amber-300">RealtorX Brand Identity Quote: </span>
            <span className="text-slate-300 italic">
              &ldquo;{REALTORX_PHILOSOPHY_QUOTE}&rdquo;
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 flex gap-2 border-b border-slate-800 bg-[#0A1628]">
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'preview'
                ? 'border-[#2490EF] text-[#2490EF]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Social Card Previews</span>
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`pb-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'tags'
                ? 'border-[#2490EF] text-[#2490EF]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Active Meta Tags (Head)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'preview' ? (
            <div className="space-y-6">
              
              {/* WhatsApp / Facebook / Open Graph Card Preview */}
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Open Graph Card (WhatsApp / Facebook / LinkedIn)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">property=&quot;og:*&quot;</span>
                </div>
                
                <div className="border border-slate-700/80 bg-slate-900 rounded-xl overflow-hidden shadow-lg group hover:border-[#2490EF]/50 transition-colors">
                  <div className="h-44 sm:h-52 w-full bg-slate-950 overflow-hidden relative">
                    <img
                      src={imageUrl}
                      alt={metadata.ogTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950/80 text-white backdrop-blur-sm">
                      realtorx.pk
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <div className="text-[11px] font-mono uppercase tracking-wide text-slate-400 mb-1">
                      REALTORX.PK · REAL ESTATE REIMAGINED
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 mb-1.5 font-heading">
                      {metadata.ogTitle}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {metadata.ogDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* Twitter / X Large Summary Card Preview */}
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#2490EF]"></span>
                    Twitter / X Card (Large Summary Image)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">name=&quot;twitter:*&quot;</span>
                </div>

                <div className="border border-slate-700/80 bg-slate-900 rounded-2xl overflow-hidden shadow-lg p-3">
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <div className="h-40 sm:h-48 w-full bg-slate-950 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={metadata.twitterTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 bg-slate-900/90 border-t border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <span>🔗</span>
                        <span>realtorx.pk</span>
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-1 mt-0.5">
                        {metadata.twitterTitle}
                      </h5>
                      <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                        {metadata.twitterDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Tags view */
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                The following live metadata tags have been injected into the application&apos;s HTML <code className="text-[#2490EF]">&lt;head&gt;</code> for page: <strong className="text-white font-mono">{currentPage}</strong>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 space-y-2.5 overflow-x-auto">
                <div className="text-slate-500 italic">// Primary &amp; Brand Description (RealtorX Philosophy)</div>
                <div>&lt;<span className="text-rose-400">title</span>&gt;{metadata.title}&lt;/<span className="text-rose-400">title</span>&gt;</div>
                <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-300">name</span>=<span className="text-emerald-400">&quot;description&quot;</span> <span className="text-amber-300">content</span>=<span className="text-emerald-300">&quot;{metadata.description}&quot;</span> /&gt;</div>

                <div className="pt-2 text-slate-500 italic">// Open Graph Protocol</div>
                <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-300">property</span>=<span className="text-emerald-400">&quot;og:site_name&quot;</span> <span className="text-amber-300">content</span>=<span className="text-emerald-300">&quot;Realtor X&quot;</span> /&gt;</div>
                <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-300">property</span>=<span className="text-emerald-400">&quot;og:type&quot;</span> <span className="text-amber-300">content</span>=<span className="text-emerald-300">&quot;{metadata.ogType}&quot;</span> /&gt;</div>
                <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-300">property</span>=<span className="text-emerald-400">&quot;og:title&quot;</span> <span className="text-amber-300">content</span>=<span className="text-emerald-300">&quot;{metadata.ogTitle}&quot;</span> /&gt;</div>
                <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-300">property</span>=<span className="text-emerald-400">&quot;og:description&quot;</span> <span className="text-amber-300">content</span>=<span className="text-emerald-300">&quot;{metadata.ogDescription}&quot;</span> /&gt;</div>
                <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-300">property</span>=<span className="text-emerald-400">&quot;og:url&quot;</span> <span className="text-amber-300">content</span>=<span className="text-emerald-300">&quot;{currentUrl}&quot;</span> /&gt;</div>
                <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-300">property</span>=<span className="text-emerald-400">&quot;og:image&quot;</span> <span className="text-amber-300">content</span>=<span className="text-emerald-300">&quot;{imageUrl}&quot;</span> /&gt;</div>

                <div className="pt-2 text-slate-500 italic">// Twitter / X Cards</div>
                <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-300">name</span>=<span className="text-emerald-400">&quot;twitter:card&quot;</span> <span className="text-amber-300">content</span>=<span className="text-emerald-300">&quot;{metadata.twitterCard}&quot;</span> /&gt;</div>
                <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-300">name</span>=<span className="text-emerald-400">&quot;twitter:title&quot;</span> <span className="text-amber-300">content</span>=<span className="text-emerald-300">&quot;{metadata.twitterTitle}&quot;</span> /&gt;</div>
                <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-300">name</span>=<span className="text-emerald-400">&quot;twitter:description&quot;</span> <span className="text-amber-300">content</span>=<span className="text-emerald-300">&quot;{metadata.twitterDescription}&quot;</span> /&gt;</div>
                <div>&lt;<span className="text-rose-400">meta</span> <span className="text-amber-300">name</span>=<span className="text-emerald-400">&quot;twitter:image&quot;</span> <span className="text-amber-300">content</span>=<span className="text-emerald-300">&quot;{imageUrl}&quot;</span> /&gt;</div>

                <div className="pt-2 text-slate-500 italic">// Canonical &amp; Schema.org</div>
                <div>&lt;<span className="text-rose-400">link</span> <span className="text-amber-300">rel</span>=<span className="text-emerald-400">&quot;canonical&quot;</span> <span className="text-amber-300">href</span>=<span className="text-emerald-300">&quot;{currentUrl}&quot;</span> /&gt;</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Share Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          
          {/* Social share shortcuts */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Share on:</span>
            
            {/* WhatsApp */}
            <button
              onClick={shareWhatsApp}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Share to WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            {/* Twitter/X */}
            <button
              onClick={shareTwitter}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Share to X"
            >
              <span>𝕏 Post</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={shareLinkedIn}
              className="px-2.5 py-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900 text-blue-300 border border-blue-800/50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Share to LinkedIn"
            >
              <span>LinkedIn</span>
            </button>

            {/* Facebook */}
            <button
              onClick={shareFacebook}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Share to Facebook"
            >
              <span>Facebook</span>
            </button>
          </div>

          {/* Copy Link */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-lg bg-[#2490EF] hover:bg-[#1B74C0] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#2490EF]/20 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Page Link</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
