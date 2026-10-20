import React, { Suspense, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Language, PageId } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { Route, parseLegacyHash, parsePath, pathFor } from './app/routes';
import { HomePage } from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const MarketplacePage = React.lazy(() => import('./features/marketplace/MarketplacePage'));
const ListingDetailPage = React.lazy(() => import('./features/marketplace/ListingDetailPage'));
const PostListingPage = React.lazy(() => import('./features/marketplace/PostListingPage'));
const MyListingsPage = React.lazy(() => import('./features/marketplace/MyListingsPage'));
const JoinPage = React.lazy(() => import('./features/membership/JoinPage'));
const MemberPortal = React.lazy(() => import('./features/member-portal/MemberPortal'));
const MembersPage = React.lazy(() => import('./features/community/MembersPage'));
const SolutionsPage = React.lazy(() => import('./features/community/SolutionsPage'));
const HubPage = React.lazy(() => import('./features/community/HubPage'));
const DeveloperProgramPage = React.lazy(() => import('./features/community/DeveloperProgramPage'));
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = React.lazy(() => import('./pages/ProjectDetailPage'));
const Project3DPage = React.lazy(() => import('./features/viewer3d/Project3DPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const AboutPage = React.lazy(() => import('./pages/CulturePages').then((m) => ({ default: m.AboutPage })));
const ManifestoPage = React.lazy(() => import('./pages/CulturePages').then((m) => ({ default: m.ManifestoPage })));
const CodePage = React.lazy(() => import('./pages/CulturePages').then((m) => ({ default: m.CodePage })));
const FaqPage = React.lazy(() => import('./pages/InfoPages').then((m) => ({ default: m.FaqPage })));
const PrivacyPage = React.lazy(() => import('./pages/InfoPages').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/InfoPages').then((m) => ({ default: m.TermsPage })));
const NotFoundPage = React.lazy(() => import('./pages/InfoPages').then((m) => ({ default: m.NotFoundPage })));

/** Initial route from the URL; legacy "#page/id" links and old paths are rewritten to clean paths. */
function initialRoute(): Route {
  const legacy = parseLegacyHash(window.location.hash);
  if (legacy) {
    window.history.replaceState(null, '', pathFor(legacy.page, legacy.id) + window.location.search);
    return legacy;
  }
  const route = parsePath(window.location.pathname);
  const canonical = pathFor(route.page, route.id);
  if (route.page !== 'not-found' && canonical !== (window.location.pathname.replace(/\/+$/, '') || '/')) {
    window.history.replaceState(null, '', canonical + window.location.search); // old URL -> new home
  }
  return route;
}

const PageLoader: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F5A623]/20 border-t-[#F5A623]" />
    <span className="sr-only">Loading</span>
  </div>
);

function BackOffice() {
  const { user } = useAuth();
  const desk = user?.desk_url || (import.meta.env.VITE_ERP_DESK_URL as string | undefined) || '/app';
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5A623]">Community Team</p>
      <h1 className="mt-3 text-3xl font-bold text-white">RealtorX back office</h1>
      <p className="mt-4 text-slate-400">
        Members, listings, buyer leads, Solution Desk cases, Hub bookings, events, subscriptions and reports are managed in the back office.
      </p>
      <a href={desk} target="_blank" rel="noopener noreferrer" className="mt-8 inline-block rounded-xl bg-[#F5A623] px-6 py-3 text-sm font-bold text-slate-950 hover:brightness-110">
        Open back office
      </a>
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [route, setRoute] = useState<Route>(() => initialRoute());
  const [language, setLanguage] = useState<Language>('en');
  const { page, id } = route;

  useEffect(() => {
    const onPopState = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (target: PageId, targetId?: string) => {
    const url = pathFor(target, targetId);
    if (url !== window.location.pathname) window.history.pushState(null, '', url);
    setRoute({ page: target, id: targetId || null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const render = () => {
    switch (page) {
      case 'home':
        return <HomePage onNavigate={navigate} language={language} />;
      case 'properties':
        return <MarketplacePage onNavigate={navigate} />;
      case 'property-detail':
        return <ListingDetailPage key={id || ''} propertyId={id || ''} onNavigate={navigate} />;
      case 'projects':
        return <ProjectsPage onNavigate={navigate} />;
      case 'project-details':
        return <ProjectDetailPage projectId={id || ''} onNavigate={navigate} />;
      case 'project-3d':
        return <Project3DPage key={id || ''} projectId={id || ''} onNavigate={navigate} />;
      case 'post-listing':
        return <PostListingPage key={id || 'new'} listingId={id} onNavigate={navigate} />;
      case 'my-listings':
        return id ? <PostListingPage key={id} listingId={id} onNavigate={navigate} /> : <MyListingsPage onNavigate={navigate} />;
      case 'join':
        return <JoinPage onNavigate={navigate} />;
      case 'member':
        return <MemberPortal section={id} onNavigate={navigate} />;
      case 'members':
        return <MembersPage memberId={id} onNavigate={navigate} />;
      case 'solutions':
        return <SolutionsPage onNavigate={navigate} />;
      case 'hub':
        return <HubPage onNavigate={navigate} />;
      case 'developer-program':
        return <DeveloperProgramPage onNavigate={navigate} />;
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'manifesto':
        return <ManifestoPage onNavigate={navigate} />;
      case 'code':
        return <CodePage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage onNavigate={navigate} language={language} />;
      case 'admin':
        return user?.is_staff ? <BackOffice /> : <HomePage onNavigate={navigate} language={language} />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'signup':
        return <SignupPage onNavigate={navigate} />;
      case 'faq':
        return <FaqPage onNavigate={navigate} />;
      case 'privacy':
        return <PrivacyPage />;
      case 'terms':
        return <TermsPage onNavigate={navigate} />;
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0A1628] font-sans text-slate-100">
      <SEO pageId={page} />
      <Navbar currentPage={page} onNavigate={navigate} language={language} onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'ur' : 'en'))} />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>{render()}</Suspense>
      </main>
      <Footer onNavigate={navigate} language={language} />
      <WhatsAppWidget aboveBottomBar={false} />
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
