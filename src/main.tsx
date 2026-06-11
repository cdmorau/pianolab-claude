import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';
import { useSettings, applySettings } from '@/state/settingsStore';
import './index.css';

// Apply persisted settings (language, theme, volume) before first paint.
applySettings(useSettings.getState());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
