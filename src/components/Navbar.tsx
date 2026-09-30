import React, { useState, useRef, useEffect } from 'react';
import { PageId, Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { RealtorXLogo } from './RealtorXLogo';
import {
  Globe,
  UserPlus,
  BookOpen,
  Menu,
  X,
  ChevronDown,
  MapPin,
  MessageCircle,
  FileCheck,
  LogIn,
  LogOut,
  User,
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
  const [cultureDropdownOpen, setCultureDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const cultureRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cultureRef.current && !cultureRef.current.contains(event.target as Node)) {
        setCultureDropdownOpen(false);
      }
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
    setCultureDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate('home');
  };

  const isCultureActive = ['manifesto', 'code'].includes(currentPage);

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* TOP UTILITY BAR */}
      <div className="bg-[#050C16] border-b border-slate-800/80 text-slate-400 text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="text-slate-300">Bahria Town Karachi, Pakistan</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <a
              href="https://wa.me/923008472910?text=Hello%20Realtor%20X"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp:</span>
              <span className="font-mono">+92 300 8472910</span>
            </a>

            <span className="text-slate-700">|</span>

            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 transition-colors"
            >
              <Globe className="w-3 h-3 text-[#F5A623]" />
              <span className="font-mono text-[11px] font-semibold">
                {language === 'en' ? 'EN' : 'اردو'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <div className="bg-[#0A1628]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              onClick={() => handleNav('home')}
              className="flex items-center text-left transition-transform hover:scale-[1.01]"
            >
              <RealtorXLogo size="md" showSubtitle={false} />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
              <button
                onClick={() => handleNav('home')}
                className={`hover:text-white transition-colors py-1 ${
                  currentPage === 'home' ? 'text-[#2490EF] font-bold' : ''
                }`}
              >
                Home
              </button>

              <button
                onClick={() => handleNav('properties')}
                className={`hover:text-white transition-colors py-1 ${
                  currentPage === 'properties' || currentPage === 'property-detail'
                    ? 'text-[#2490EF] font-bold'
                    : ''
                }`}
              >
                Properties
              </button>

              <button
                onClick={() => handleNav('projects')}
                className={`hover:text-white transition-colors py-1 ${
                  currentPage === 'projects' ? 'text-[#2490EF] font-bold' : ''
                }`}
              >
                Projects
              </button>

              {/* Culture Dropdown */}
              <div className="relative" ref={cultureRef}>
                <button
                  onClick={() => setCultureDropdownOpen(!cultureDropdownOpen)}
                  className={`hover:text-white transition-colors py-1 flex items-center gap-1 ${
                    isCultureActive ? 'text-[#F5A623] font-bold' : ''
                  }`}
                >
                  <span>Culture & Trust</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {cultureDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                    <button
                      onClick={() => handleNav('manifesto')}
                      className="w-full text-left p-2 rounded-lg text-xs flex items-center gap-2.5 text-slate-300 hover:bg-slate-800"
                    >
                      <BookOpen className="w-4 h-4 text-[#F5A623] shrink-0" />
                      <div>
                        <div className="font-medium">The RealtorX Manifesto</div>
                        <div className="text-[10px] text-slate-400">Why we exist</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleNav('code')}
                      className="w-full text-left p-2 rounded-lg text-xs flex items-center gap-2.5 text-slate-300 hover:bg-slate-800"
                    >
                      <FileCheck className="w-4 h-4 text-[#2490EF] shrink-0" />
                      <div>
                        <div className="font-medium">The RealtorX Code</div>
                        <div className="text-[10px] text-slate-400">8 principles</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNav('services')}
                className={`hover:text-white transition-colors py-1 ${
                  currentPage === 'services' ? 'text-[#2490EF] font-bold' : ''
                }`}
              >
                Services
              </button>

              <button
                onClick={() => handleNav('about')}
                className={`hover:text-white transition-colors py-1 ${
                  currentPage === 'about' ? 'text-[#2490EF] font-bold' : ''
                }`}
              >
                About
              </button>

              <button
                onClick={() => handleNav('contact')}
                className={`hover:text-white transition-colors py-1 ${
                  currentPage === 'contact' ? 'text-[#2490EF] font-bold' : ''
                }`}
              >
                Contact
              </button>
            </nav>

            {/* Right Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Logged Out — Show Login + Signup */}
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
                    onClick={() => handleNav('become-dealer')}
                    className="px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 rounded-lg shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </>
              )}

              {/* Logged In — User Menu */}
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
                        <div className="text-[10px] text-slate-400 truncate">
                          {user.email}
                        </div>
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
                          <User className="w-4 h-4 text-[#F5A623]" />
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
          <button
            onClick={() => handleNav('home')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-300"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('properties')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-300"
          >
            Properties
          </button>
          <button
            onClick={() => handleNav('projects')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-300"
          >
            Projects
          </button>

          <div className="py-2 border-y border-slate-800/80 my-2 space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-widest text-[#F5A623] px-3 font-semibold">
              Culture & Trust
            </div>
            <button
              onClick={() => handleNav('manifesto')}
              className="w-full text-left py-2 px-3 rounded-lg text-xs text-slate-300"
            >
              The RealtorX Manifesto
            </button>
            <button
              onClick={() => handleNav('code')}
              className="w-full text-left py-2 px-3 rounded-lg text-xs text-slate-300"
            >
              The RealtorX Code
            </button>
          </div>

          <button
            onClick={() => handleNav('services')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-300"
          >
            Services
          </button>
          <button
            onClick={() => handleNav('about')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-300"
          >
            About
          </button>
          <button
            onClick={() => handleNav('contact')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-slate-300"
          >
            Contact
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
                  onClick={() => handleNav('become-dealer')}
                  className="w-full py-2.5 px-3 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] rounded-lg text-left flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up / Become a Dealer</span>
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
