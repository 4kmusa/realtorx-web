import PropertyDetailPage from './pages/PropertyDetailPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import React, { useState, useEffect, Suspense } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { PageId, Language, MemberRecord } from './types';
import { fetchPublicMembers } from './services/memberService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import { SocialShareModal } from './components/SocialShareModal';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { ShieldCheck } from 'lucide-react';
import { Route, canonicalPage, parseLegacyHash, parsePath, pathFor } from './app/routes';

import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import ProjectsPage from './pages/ProjectsPage';

const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const CustomerPortal = React.lazy(() => import('./features/customer-portal/CustomerPortal'));
const DealerPortal = React.lazy(() => import('./features/dealer-portal/DealerPortal'));
const OathPage = React.lazy(() => import('./pages/OathPage').then(m => ({ default: m.OathPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const ServicesPage = React.lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ManifestoPage = React.lazy(() => import('./pages/ManifestoPage').then(m => ({ default: m.ManifestoPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const CodePage = React.lazy(() => import('./pages/CodePage').then(m => ({ default: m.CodePage })));
const SiteVisitPage = React.lazy(() => import('./pages/SiteVisitPage'));
const DevelopersPage = React.lazy(() => import('./pages/DevelopersPage'));
const FaqPage = React.lazy(() => import('./pages/InfoPages').then(m => ({ default: m.FaqPage })));
const PrivacyPage = React.lazy(() => import('./pages/InfoPages').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/InfoPages').then(m => ({ default: m.TermsPage })));
const NotFoundPage = React.lazy(() => import('./pages/InfoPages').then(m => ({ default: m.NotFoundPage })));

import { MembersDirectory } from './components/MembersDirectory';
import { CertificateModal } from './components/CertificateModal';
import DealerApplyPage from './pages/DealerApplyPage';

/** Initial route from the URL; legacy "#page/id" links are rewritten to clean paths. */
function initialRoute(): Route {
  const legacy = parseLegacyHash(window.location.hash);
  if (legacy) {
    window.history.replaceState(null, '', pathFor(legacy.page, legacy.id) + window.location.search);
    return legacy;
  }
  return parsePath(window.location.pathname);
}

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-[#F5A623]/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#F5A623] animate-spin" />
      </div>
      <span className="text-sm text-slate-500 font-medium">Loading…</span>
    </div>
  </div>
);

function AppContent() {
  const { user } = useAuth();
  
  const [route, setRoute] = useState<Route>(() => initialRoute());
  const currentPage = route.page;
  const selectedPropertyId = route.id;

  const [language, setLanguage] = useState<Language>('en');
  const [socialModalOpen, setSocialModalOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const [members, setMembers] = useState<MemberRecord[]>([]);
  useEffect(() => {
    if (currentPage !== 'community' || members.length) return;
    fetchPublicMembers()
      .then(setMembers)
      .catch(() => setMembers([]));
  }, [currentPage, members.length]);

  const [certificateMember, setCertificateMember] = useState<MemberRecord | null>(null);


  
  const handleDealerApplyClick = () => handleNavigate('become-dealer');

  const handleNavigate = (page: PageId, extraId?: string) => {
    const target = canonicalPage(page);
    const url = pathFor(target, extraId);
    if (url !== window.location.pathname) window.history.pushState(null, '', url);
    setRoute({ page: target, id: extraId || null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} language={language} />;
      case 'properties':
        return <PropertiesPage onNavigate={handleNavigate} language={language} />;
      case 'property-detail':
        return (
          <PropertyDetailPage propertyId={selectedPropertyId || ''} onNavigate={handleNavigate} />
        );
      case 'projects':
        return <ProjectsPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'signup':
        return <SignupPage onNavigate={handleNavigate} />;
      case 'project-details':
        return <ProjectDetailPage projectId={selectedPropertyId || ''} onNavigate={handleNavigate} />;
      case 'property-details':
        return <PropertyDetailPage propertyId={selectedPropertyId || ''} onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} language={language} />;
      
      
      
      
      case 'admin':
        if (!user?.is_staff) {
          return <HomePage onNavigate={handleNavigate} language={language} />;
        }
        return (
          <div className="py-20 max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Administration</h2>
            <p className="text-slate-400 mb-8">
              CRM, inventory, bookings and finance are managed in the RealtorX back office.
            </p>
            <a
              href="/app"
              className="inline-block px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-[#F5A623] hover:brightness-110"
            >
              Open back office
            </a>
          </div>
        );

      case 'oath': {
        const cameFromDealerFlow = sessionStorage.getItem('realtorx_dealer_flow') === 'true';
        if (!cameFromDealerFlow) {
          return (
            <div className="py-20 max-w-2xl mx-auto px-4 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-[#F5A623]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">The Oath is for Dealers</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                The Founding Member Oath is a personal commitment taken by Realtor X dealers. If you want to become a dealer, please start the application process.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button onClick={handleDealerApplyClick} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 transition-all shadow-md">
                  Apply to Become a Dealer
                </button>
                <button onClick={() => handleNavigate('manifesto')} className="px-6 py-3 rounded-xl text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-all">
                  Read the Manifesto
                </button>
              </div>
            </div>
          );
        }
        return <OathPage onNavigate={handleNavigate} language={language} />;
      }
      
      case 'portal':
        return <CustomerPortal section={selectedPropertyId} onNavigate={handleNavigate} />;
      case 'dealer':
        return <DealerPortal section={selectedPropertyId} onNavigate={handleNavigate} />;

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
      case 'become-dealer':
        return <DealerApplyPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} language={language} />;
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} language={language} />;
      case 'manifesto':
        return <ManifestoPage onNavigate={handleNavigate} language={language} />;
      case 'code':
        return <CodePage onNavigate={handleNavigate} language={language} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} language={language} />;
      case 'site-visit':
        return <SiteVisitPage propertyId={selectedPropertyId} onNavigate={handleNavigate} />;
      case 'developers':
        return <DevelopersPage onNavigate={handleNavigate} />;
      case 'faq':
        return <FaqPage onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPage />;
      case 'terms':
        return <TermsPage onNavigate={handleNavigate} />;
      case 'not-found':
        return <NotFoundPage onNavigate={handleNavigate} />;
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

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>{renderCurrentPage()}</Suspense>
      </main>

      <Footer onNavigate={handleNavigate} language={language} />

      <CertificateModal member={certificateMember} onClose={() => setCertificateMember(null)} language={language} />
      <SocialShareModal isOpen={socialModalOpen} onClose={() => setSocialModalOpen(false)} currentPage={currentPage} property={undefined} />
      
      <WhatsAppWidget aboveBottomBar={currentPage === 'property-detail'} />
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
