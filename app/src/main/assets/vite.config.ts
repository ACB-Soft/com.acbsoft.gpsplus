import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Android WebView (APK) uyumluluğu için kritik: Göreceli yollar kullanır
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      // Bileşenlere erişimi kolaylaştırmak için opsiyonel alias
      '@': '/src',
    },
  },
});