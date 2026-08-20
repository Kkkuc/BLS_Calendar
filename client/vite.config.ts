import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5184', // Ustaw port ze swojego uruchomionego API w Riderze
        changeOrigin: true,
        secure: false,
      },
    },
  },
});