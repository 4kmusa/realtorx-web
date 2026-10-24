import React, { Suspense, useEffect, useRef, useState } from 'react';
import { PageId } from './types';
import { FEATURES } from './config/site';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { useMotion } from './components/site/motion';
import { Route, parseLegacyHash, parsePath, pathFor } from './app/routes';
import { HomePage } from './pages/HomePage';
import { captureAgentRef } from './utils/agentRef';
import { BuyerProvider } from './features/buyer/session';

captureAgentRef();

const MarketplacePage = React.lazy(() => import('./features/marketplace/MarketplacePage'));
const ListingDetailPage = React.lazy(() => import('./features/marketplace/ListingDetailPage'));
const SolutionsPage = React.lazy(() => import('./features/community/SolutionsPage'));
const DeveloperProgramPage = React.lazy(() => import('./features/community/DeveloperProgramPage'));
const BecomeAgentPage = React.lazy(() => import('./pages/BecomeAgentPage'));
const SignInPage = React.lazy(() => import('./pages/SignInPage'));
const MyApplicationPage = React.lazy(() => import('./features/agents/MyApplicationPage'));
const AccountPage = React.lazy(() => import('./pages/AccountPage'));
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = React.lazy(() => import('./pages/ProjectDetailPage'));
const Project3DPage = React.lazy(() => import('./features/viewer3d/Project3DPage'));
const VirtualTourPage = React.lazy(() => import('./features/tour/VirtualTourPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const FaqPage = React.lazy(() => import('./pages/InfoPages').then((m) => ({ default: m.FaqPage })));
const LegalHubPage = React.lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.LegalHubPage })));
const TermsPage = React.lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.TermsPage })));
const PrivacyPage = React.lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.PrivacyPage })));
const CookiePage = React.lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.CookiePage })));
const BookingPolicyPage = React.lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.BookingPolicyPage })));
const AgentTermsPage = React.lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.AgentTermsPage })));
const DeveloperTermsPage = React.lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.DeveloperTermsPage })));
const DisclaimerPage = React.lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.DisclaimerPage })));
const ComplaintsPage = React.lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.ComplaintsPage })));
const BuyerStatementPage = React.lazy(() => import('./features/statement/BuyerStatementPage'));
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
    <div className="h-8 w-8 animate-spin rounded-full border border-line-2 border-t-fg" />
    <span className="sr-only">Loading</span>
  </div>
);

function AppContent() {
  const [route, setRoute] = useState<Route>(() => initialRoute());
  const navigated = useRef(false); // the first page paints at once; later page changes fade in
  const { id } = route;
  // 3D models and 360° tours are switched off on the website for now (config/site.ts).
  const page: PageId = !FEATURES.tours3d && (route.page === 'project-3d' || route.page === 'virtual-tour') ? 'not-found' : route.page;

  useEffect(() => {
    const onPopState = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (target: PageId, targetId?: string) => {
    navigated.current = true;
    const url = pathFor(target, targetId);
    if (url !== window.location.pathname + window.location.search) window.history.pushState(null, '', url);
    setRoute({ page: target, id: (targetId || '').split('?')[0] || null });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const pageKey = `${page}:${id || ''}`;
  useMotion(pageKey);

  const render = () => {
    switch (page) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'properties':
        return <MarketplacePage onNavigate={navigate} />;
      case 'property-detail':
        return <ListingDetailPage key={id || ''} propertyId={id || ''} onNavigate={navigate} />;
      case 'projects':
        return <ProjectsPage onNavigate={navigate} />;
      case 'project-details':
        return <ProjectDetailPage key={id || ''} projectId={id || ''} onNavigate={navigate} />; // key: a new project starts empty, never shows the last one
      case 'project-3d':
        return <Project3DPage key={id || ''} projectId={id || ''} onNavigate={navigate} />;
      case 'virtual-tour':
        return <VirtualTourPage key={id || ''} routeId={id || ''} onNavigate={navigate} />;
      case 'become-agent':
        return <BecomeAgentPage onNavigate={navigate} />;
      case 'solutions':
        return <SolutionsPage onNavigate={navigate} />;
      case 'developer-program':
        return <DeveloperProgramPage onNavigate={navigate} />;
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage onNavigate={navigate} />;
      case 'my-application':
        return <MyApplicationPage onNavigate={navigate} />;
      case 'account':
        return <AccountPage onNavigate={navigate} />;
      case 'login':
        return <SignInPage onNavigate={navigate} />;
      case 'faq':
        return <FaqPage onNavigate={navigate} />;
      case 'legal':
        return <LegalHubPage onNavigate={navigate} />;
      case 'privacy':
        return <PrivacyPage onNavigate={navigate} />;
      case 'terms':
        return <TermsPage onNavigate={navigate} />;
      case 'cookies':
        return <CookiePage onNavigate={navigate} />;
      case 'booking-policy':
        return <BookingPolicyPage onNavigate={navigate} />;
      case 'agent-terms':
        return <AgentTermsPage onNavigate={navigate} />;
      case 'developer-terms':
        return <DeveloperTermsPage onNavigate={navigate} />;
      case 'disclaimer':
        return <DisclaimerPage onNavigate={navigate} />;
      case 'complaints':
        return <ComplaintsPage onNavigate={navigate} />;
      case 'buyer-statement':
        return <BuyerStatementPage dealId={id || ''} />;
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink font-sans text-fg">
      <SEO pageId={page} />
      <Navbar currentPage={page} onNavigate={navigate} />
      <main className={`flex-1 ${page === 'home' ? '' : 'pt-[72px]'}`}>
        <Suspense fallback={<PageLoader />}><div key={pageKey} className={navigated.current ? 'rx-page' : undefined}>{render()}</div></Suspense>
      </main>
      <Footer onNavigate={navigate} />
      <WhatsAppWidget />
    </div>
  );
}

export default function App() {
  return <BuyerProvider><AppContent /></BuyerProvider>;
}
