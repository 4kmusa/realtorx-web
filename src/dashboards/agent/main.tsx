import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AgentApp from './AgentApp';
import '../../index.css';
import AppErrorBoundary, { watchForNewBuild } from '../../components/AppErrorBoundary';

watchForNewBuild();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <AgentApp />
    </AppErrorBoundary>
  </StrictMode>,
);
