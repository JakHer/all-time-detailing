import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import App from './App';
import { queryClient } from './lib/queryClient';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SkeletonTheme baseColor="#161719" highlightColor="#222428">
        <App />
      </SkeletonTheme>
    </QueryClientProvider>
  </React.StrictMode>,
);
