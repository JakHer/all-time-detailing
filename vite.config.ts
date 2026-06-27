import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router-dom/')
          ) {
            return 'react';
          }

          if (id.includes('/@tanstack/react-query/')) {
            return 'query';
          }

          if (
            id.includes('/react-hook-form/') ||
            id.includes('/@hookform/resolvers/') ||
            id.includes('/zod/')
          ) {
            return 'forms';
          }

          if (
            id.includes('/@radix-ui/react-dialog/') ||
            id.includes('/react-aria-components/') ||
            id.includes('/react-loading-skeleton/') ||
            id.includes('/sonner/')
          ) {
            return 'ui';
          }

          if (id.includes('/lucide-react/')) {
            return 'icons';
          }

          return 'vendor';
        },
      },
    },
  },
});
