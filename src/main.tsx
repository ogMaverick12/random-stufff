// Ensure window.fetch has a setter if modified by runtime environments or test runners
try {
  const currentFetch = typeof window !== 'undefined' ? window.fetch : null;
  let customFetch: typeof window.fetch | null = null;
  if (typeof window !== 'undefined' && currentFetch) {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (!desc || desc.configurable) {
      Object.defineProperty(window, 'fetch', {
        get: () => customFetch || currentFetch.bind(window),
        set: (v) => {
          customFetch = v;
        },
        configurable: true,
        enumerable: true,
      });
    }
  }
} catch {
  // safe fallback
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
