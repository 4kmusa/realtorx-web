// ═══════════════════════════════════════════════════════
// src/components/Navbar.tsx
// Premium glassmorphism navbar with scroll effects
// ═══════════════════════════════════════════════════════
import React, { useState, useRef, useEffect } from 'react';
import { PageId, Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { RealtorXLogo } from './RealtorXLogo';
import {
  Globe,
  UserPlus,
  Menu,
  X,
  ChevronDown,
  LogIn,
  LogOut,
  User,
  Briefcase,
} from 'lucide-react';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  language,
  onToggleLanguage,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  // Scroll detection for glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNav = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate('home');
  };

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'properties', label: 'Properties' },
    { id: 'projects', label: 'Projects' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const isActive = (id: PageId) => {
    if (id === 'properties') return currentPage === 'properties' || currentPage === 'property-detail';
    return currentPage === id;
  };

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* MAIN NAVBAR */}
        <div
          className={`transition-all duration-500 ease-out-expo ${
            scrolled
              ? 'bg-[#0A1628]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl shadow-black/20'
              : 'bg-[#0A1628]/95 backdrop-blur-md border-b border-slate-800'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`flex items-center justify-between transition-all duration-500 ${
                scrolled ? 'h-[68px]' : 'h-20'
              }`}
            >
              {/* Logo */}
              <button
                onClick={() => handleNav('home')}
                className="flex items-center text-left transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <RealtorXLogo size="xl" showSubtitle={false} />
              </button>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-300">
                {navItems.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`relative px-3.5 py-2 rounded-lg transition-all duration-300 group ${
                      isActive(item.id)
                        ? 'text-[#2490EF]'
                        : 'hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive(item.id) && (
                      <span className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#2490EF] to-transparent" />
                    )}
                  </button>
                ))}

                {/* Become a Dealer — highlighted CTA */}
                <button
                  onClick={() => handleNav('become-dealer')}
                  className={`ml-2 transition-all duration-300 py-2 px-4 rounded-xl flex items-center gap-1.5 font-semibold text-[13px] relative overflow-hidden group ${
                    currentPage === 'become-dealer'
                      ? 'bg-gradient-to-r from-[#F5A623] to-[#FFA500] text-slate-950 shadow-lg shadow-[#F5A623]/30'
                      : 'text-[#F5A623] bg-[#F5A623]/[0.08] border border-[#F5A623]/30 hover:bg-[#F5A623]/15 hover:border-[#F5A623]/50 hover:shadow-lg hover:shadow-[#F5A623]/10'
                  }`}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Briefcase className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">Become a Dealer</span>
                </button>

                {navItems.slice(5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`relative px-3.5 py-2 rounded-lg transition-all duration-300 ${
                      isActive(item.id)
                        ? 'text-[#2490EF]'
                        : 'hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive(item.id) && (
                      <span className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#2490EF] to-transparent" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Right Buttons */}
              <div className="flex items-center gap-2.5">
                {/* Language toggle */}
                <button
                  onClick={onToggleLanguage}
                  className="hidden sm:flex items-center gap-1.5 text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-3 py-2 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group"
                  title="Toggle language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#F5A623] group-hover:rotate-12 transition-transform duration-500" />
                  <span className="font-mono text-[11px] font-semibold tracking-wider">
                    {language === 'en' ? 'EN' : 'اردو'}
                  </span>
                </button>

                {!isAuthenticated && (
                  <>
                    <button
                      onClick={() => handleNav('login')}
                      className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#2490EF] border border-[#2490EF]/30 hover:border-[#2490EF]/60 hover:bg-[#2490EF]/10 rounded-xl transition-all duration-300 whitespace-nowrap"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Login</span>
                    </button>

                    <button
                      onClick={() => handleNav('signup')}
                      className="relative px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 rounded-xl shadow-lg shadow-[#F5A623]/25 hover:shadow-[#F5A623]/40 transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap overflow-hidden group active:scale-[0.97]"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <UserPlus className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Sign Up</span>
                    </button>
                  </>
                )}

                {isAuthenticated && user && (
                  <div className="relative" ref={userRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${
                        userDropdownOpen
                          ? 'bg-[#2490EF]/10 border-[#2490EF]/40'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2490EF]/30 to-[#2490EF]/10 border border-[#2490EF]/40 flex items-center justify-center text-[#2490EF] text-xs font-bold">
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="hidden sm:inline text-xs font-medium text-white truncate max-w-[100px]">
                        {user.first_name}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${
                          userDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute top-full right-0 mt-3 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 p-2 z-50 space-y-1 animate-scale-in">
                        <div className="px-3 py-3 border-b border-white/[0.06]">
                          <div className="text-sm font-semibold text-white truncate">
                            {user.full_name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {user.email}
                          </div>
                        </div>

                        <button
                          onClick={() => handleNav('profile')}
                          className="w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2.5 text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                        >
                          <User className="w-4 h-4 text-[#2490EF]" />
                          <span>My Profile</span>
                        </button>

                        {user.is_customer && (
                          <button
                            onClick={() => handleNav('portal')}
                            className="w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2.5 text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                          >
                            <User className="w-4 h-4 text-[#2490EF]" />
                            <span>Customer Dashboard</span>
                          </button>
                        )}

                        {user.is_dealer && (
                          <button
                            onClick={() => handleNav('dealer')}
                            className="w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2.5 text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                          >
                            <Briefcase className="w-4 h-4 text-[#F5A623]" />
                            <span>Dealer Dashboard</span>
                          </button>
                        )}

                        <div className="h-[1px] bg-white/[0.06] my-1" />

                        <button
                          onClick={handleLogout}
                          className="w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2.5 text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-300"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-full max-w-sm bg-[#0A1628] border-l border-white/[0.06] shadow-2xl z-50 transform transition-transform duration-500 ease-out-expo ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-5 border-b border-white/[0.06]">
          <RealtorXLogo size="lg" showSubtitle={false} />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-5rem)] px-5 py-6 space-y-1">
          {navItems.slice(0, 5).map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              style={{ animationDelay: `${idx * 40}ms` }}
              className={`w-full text-left py-3 px-4 rounded-xl text-base font-medium transition-all duration-300 ${
                isActive(item.id)
                  ? 'bg-[#2490EF]/10 text-[#2490EF]'
                  : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
              } ${mobileMenuOpen ? 'animate-slide-in-right' : ''}`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => handleNav('become-dealer')}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] flex items-center justify-center gap-2 shadow-lg shadow-[#F5A623]/20 mt-3"
          >
            <Briefcase className="w-4 h-4" />
            <span>Become a Dealer</span>
          </button>

          {navItems.slice(5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full text-left py-3 px-4 rounded-xl text-base font-medium transition-all duration-300 ${
                isActive(item.id)
                  ? 'bg-[#2490EF]/10 text-[#2490EF]'
                  : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={onToggleLanguage}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/[0.04] border border-white/[0.06] mt-3"
          >
            <Globe className="w-4 h-4 text-[#F5A623]" />
            <span>Language: {language === 'en' ? 'English' : 'اردو'}</span>
          </button>

          <div className="pt-4 mt-4 border-t border-white/[0.06] flex flex-col gap-2.5">
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => handleNav('login')}
                  className="w-full py-3 px-4 text-sm font-semibold text-[#2490EF] border border-[#2490EF]/30 rounded-xl text-center flex items-center justify-center gap-2 hover:bg-[#2490EF]/10 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => handleNav('signup')}
                  className="w-full py-3 px-4 text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#F5A623]/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </>
            )}

            {isAuthenticated && user && (
              <>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2490EF]/30 to-[#2490EF]/10 border border-[#2490EF]/40 flex items-center justify-center text-[#2490EF] text-sm font-bold">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white truncate">
                      {user.full_name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleNav('profile')}
                  className="w-full py-3 px-4 text-sm font-semibold text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-left flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4 text-[#2490EF]" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 text-sm font-medium text-red-300 bg-red-500/10 hover:bg-red-500/15 rounded-xl text-left flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
