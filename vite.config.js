import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 1. Icon Library (Lucide React) - dipisah agar tidak masuk ke React bundle
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // 2. Animation Engine (Framer Motion)
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }
            // 3. HTTP Client (Axios)
            if (id.includes('axios')) {
              return 'axios-vendor';
            }
            // 4. Security & Sanitizer (DOMPurify)
            if (id.includes('dompurify')) {
              return 'security-vendor';
            }
            // 5. Core React Framework & Router
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router/') ||
              id.includes('/react-router-dom/') ||
              id.includes('scheduler') ||
              id.includes('\\react\\') ||
              id.includes('\\react-dom\\') ||
              id.includes('\\react-router\\') ||
              id.includes('\\react-router-dom\\')
            ) {
              return 'react-core';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
