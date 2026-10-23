import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import DeveloperApp from './DeveloperApp';
import '../../index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DeveloperApp />
  </StrictMode>,
);
