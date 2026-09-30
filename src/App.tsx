import React, { useState, useEffect } from 'react';
import { PageId, Language, MemberRecord, ERPNextConfig } from './types';
import { INITIAL_MEMBERS } from './data/cultureData';
import { DEFAULT_ERPNEXT_CONFIG } from './services/erpnextService';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import { SocialShareModal } from './components/SocialShareModal';
import { ShieldCheck } from 'lucide-react';

// Pages
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ContactPage } from './pages/ContactPage';
import { ManifestoPage } from './pages/ManifestoPage';
import { BecomeDealerPage } from './pages/BecomeDealerPage';
import { OathPage } from './pages/OathPage';
import { CodePage } from './pages/CodePage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';
import { DealerPortalPage } from './pages/DealerPortalPage';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';

// Culture components
import { MembersDirectory } from './components/MembersDirectory';
import { CertificateModal } from './components/CertificateModal';

const VALID_PAGES: PageId[] = [
  'home',
  'properties',
  'property-detail',
  'projects',
  'about',
  'services',
  'contact',
  'manifesto',
  'oath',
  'code',
  'portal',
  'dealer',
  'become-dealer',
  'community',
  'signup',
  'login',
  'profile',
];

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '').split('/')[0] as PageId;
      if (VALID_PAGES.includes(hash)) {
        return hash;
      }
    }
    return 'home';
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const parts = window.location.hash.replace('#', '').split('/');
      if (parts[0] === 'property-detail' && parts[1]) {
        return parts[1];
      }
    }
    return 'PROP-2026-00001';
  });

  const [language, setLanguage] = useState<Language>('en');
  const [socialModalOpen, setSocialModalOpen] = useState(false);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) {
        setCurrentPage('home');
        return;
      }
      const parts = hash.split('/');
      const pageId = parts[0] as PageId;
      if (VALID_PAGES.includes(pageId)) {
        setCurrentPage(pageId);
        if (pageId === 'property-detail' && parts[1]) {
          setSelectedPropertyId(parts[1]);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Members state (for community directory)
  const [members, setMembers] = useState<MemberRecord[]>(() => {
    const saved = localStorage.getItem('realtorx_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MEMBERS;
      }
    }
    return INITIAL_MEMBERS;
  });

  const [erpConfig] = useState<ERPNextConfig>(() => {
    const saved = localStorage.getItem('realtorx_erp_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ERPNEXT_CONFIG;
      }
    }
    return DEFAULT_ERPNEXT_CONFIG;
  });

  const [certificateMember, setCertificateMember] = useState<MemberRecord | null>(null);

  useEffect(() => {
    localStorage.setItem('realtorx_members', JSON.stringify(members));
  }, [members]);

  const handleNavigate = (page: PageId, extraId?: string) => {
    if (extraId) {
      setSelectedPropertyId(extraId);
      window.location.hash = `#${page}/${extraId}`;
    } else {
      window.location.hash = page === 'home' ? '' : `#${page}`;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMemberCreated = (newMember: MemberRecord) => {
    setMembers((prev) => [newMember, ...prev]);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} language={language} />;
      case 'properties':
        return <PropertiesPage onNavigate={handleNavigate} language={language} />;
      case 'property-detail':
        return (
          <PropertyDetailPage
            propertyId={selectedPropertyId}
            onNavigate={handleNavigate}
            language={language}
            onOpenSocialModal={() => setSocialModalOpen(true)}
          />
        );
      case 'projects':
        return <ProjectsPage onNavigate={handleNavigate} language={language} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} language={language} />;
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} language={language} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} language={language} />;
      case 'manifesto':
        return <ManifestoPage onNavigate={handleNavigate} language={language} />;
      case 'become-dealer':
        return <BecomeDealerPage onNavigate={handleNavigate} language={language} />;
      case 'oath': {
        const cameFromDealerFlow =
          sessionStorage.getItem('realtorx_dealer_flow') === 'true';

        if (!cameFromDealerFlow) {
          return (
            <div className="py-20 max-w-2xl mx-auto px-4 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-[#F5A623]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                The Oath is for Dealers
              </h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                The Founding Member Oath is a personal commitment taken by Realtor X
                dealers. If you want to become a dealer, please start the application
                process.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => handleNavigate('become-dealer')}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 transition-all shadow-md"
                >
                  Apply to Become a Dealer
                </button>
                <button
                  onClick={() => handleNavigate('manifesto')}
                  className="px-6 py-3 rounded-xl text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-all"
                >
                  Read the Manifesto
                </button>
              </div>
            </div>
          );
        }

        return <OathPage onNavigate={handleNavigate} language={language} />;
      }
      case 'code':
        return <CodePage onNavigate={handleNavigate} language={language} />;
      case 'portal':
        return <CustomerPortalPage onNavigate={handleNavigate} language={language} />;
      case 'dealer':
        return <DealerPortalPage onNavigate={handleNavigate} language={language} />;
      case 'signup':
        return <SignupPage onNavigate={handleNavigate} language={language} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} language={language} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} language={language} />;
      case 'community':
        return (
          <MembersDirectory
            members={members}
            onViewCertificate={(m: MemberRecord) => setCertificateMember(m)}
            onTakeOath={() => {
              sessionStorage.setItem('realtorx_dealer_flow', 'true');
              handleNavigate('oath');
            }}
            language={language}
          />
        );
      default:
        return <HomePage onNavigate={handleNavigate} language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-slate-100 flex flex-col font-sans">
      <SEO pageId={currentPage} property={undefined} />

      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'ur' : 'en'))}
      />

      <main className="flex-1">{renderCurrentPage()}</main>

      <Footer onNavigate={handleNavigate} language={language} />

      <CertificateModal
        member={certificateMember}
        onClose={() => setCertificateMember(null)}
        language={language}
      />

      <SocialShareModal
        isOpen={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        currentPage={currentPage}
        property={undefined}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
