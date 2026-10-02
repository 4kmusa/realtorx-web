// ═══════════════════════════════════════════════════════
// src/components/Navbar.tsx
// Top utility bar removed · Language toggle moved to main navbar
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
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header className="sticky top-0 z-50 shadow-lg">
      {/* MAIN NAVBAR */}
      <div className="bg-[#0A1628]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              onClick={() => handleNav('home')}
              className="flex items-center text-left transition-transform hover:scale-[1.01]"
            >
              <RealtorXLogo size="xl" showSubtitle={false} />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
              {navItems.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`hover:text-white transition-colors py-1 ${
                    isActive(item.id) ? 'text-[#2490EF] font-bold' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Become a Dealer — highlighted CTA */}
              <button
                onClick={() => handleNav('become-dealer')}
                className={`transition-all py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 font-semibold ${
                  currentPage === 'become-dealer'
                    ? 'bg-[#F5A623] text-slate-950 shadow-md shadow-[#F5A623]/30'
                    : 'text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/40 hover:bg-[#F5A623]/20'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Become a Dealer</span>
              </button>

              {navItems.slice(5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`hover:text-white transition-colors py-1 ${
                    isActive(item.id) ? 'text-[#2490EF] font-bold' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Language toggle */}
              <button
                onClick={onToggleLanguage}
                className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
                title="Toggle language"
              >
                <Globe className="w-3.5 h-3.5 text-[#F5A623]" />
                <span className="font-mono text-[11px] font-semibold">
                  {language === 'en' ? 'EN' : 'اردو'}
                </span>
              </button>

              {!isAuthenticated && (
                <>
                  <button
                    onClick={() => handleNav('login')}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#2490EF] border border-[#2490EF]/40 hover:bg-[#2490EF]/10 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login</span>
                  </button>

                  <button
                    onClick={() => handleNav('signup')}
                    className="px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 rounded-lg shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </>
              )}

              {isAuthenticated && user && (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#2490EF]/20 border border-[#2490EF]/40 flex items-center justify-center text-[#2490EF] text-xs font-bold">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-medium text-white truncate max-w-[100px]">
                      {user.first_name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <div className="text-sm font-semibold text-white truncate">
                          {user.full_name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                      </div>

                      <button
                        onClick={() => handleNav('profile')}
                        className="w-full text-left p-2 rounded-lg text-xs flex items-center gap-2.5 text-slate-300 hover:bg-slate-800"
                      >
                        <User className="w-4 h-4 text-[#2490EF]" />
                        <span>My Profile</span>
                      </button>

                      {user.is_customer && (
                        <button
                          onClick={() => handleNav('portal')}
                          className="w-full text-left p-2 rounded-lg text-xs flex items-center gap-2.5 text-slate-300 hover:bg-slate-800"
                        >
                          <User className="w-4 h-4 text-[#2490EF]" />
                          <span>Customer Dashboard</span>
                        </button>
                      )}

                      {user.is_dealer && (
                        <button
                          onClick={() => handleNav('dealer')}
                          className="w-full text-left p-2 rounded-lg text-xs flex items-center gap-2.5 text-slate-300 hover:bg-slate-800"
                        >
                          <Briefcase className="w-4 h-4 text-[#F5A623]" />
                          <span>Dealer Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left p-2 rounded-lg text-xs flex items-center gap-2.5 text-red-300 hover:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0A1628] px-4 pt-3 pb-6 space-y-2">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-300"
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => handleNav('become-dealer')}
            className="w-full py-2.5 px-3 rounded-lg text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            <span>Become a Dealer</span>
          </button>

          {navItems.slice(5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-300"
            >
              {item.label}
            </button>
          ))}

          {/* Language toggle in mobile */}
          <button
            onClick={onToggleLanguage}
            className="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium text-slate-300 border border-slate-800"
          >
            <Globe className="w-4 h-4 text-[#F5A623]" />
            <span>Language: {language === 'en' ? 'English' : 'اردو'}</span>
          </button>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => handleNav('login')}
                  className="w-full py-2.5 px-3 text-xs font-semibold text-[#2490EF] border border-[#2490EF]/40 rounded-lg text-left flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => handleNav('signup')}
                  className="w-full py-2.5 px-3 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] rounded-lg text-left flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </>
            )}

            {isAuthenticated && user && (
              <>
                <button
                  onClick={() => handleNav('profile')}
                  className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-slate-800 rounded-lg text-left flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-[#2490EF]" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 text-xs font-medium text-red-300 bg-red-500/10 rounded-lg text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
