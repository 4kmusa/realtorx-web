import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import DeveloperApp from './DeveloperApp';
import '../../index.css';
import AppErrorBoundary, { watchForNewBuild } from '../../components/AppErrorBoundary';

watchForNewBuild();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <DeveloperApp />
    </AppErrorBoundary>
  </StrictMode>,
);
