import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  assetsInclude: ['**/*.PNG', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      REACT_APP_TELEGRAM_WEBAPP: process.env.REACT_APP_TELEGRAM_WEBAPP || true,
      REACT_APP_API_URL: JSON.stringify('https://app.geohod.ru/api/v1'),
    },
    global: 'window',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 8080,
    https: {},
    proxy: {
      '/api/v1': {
        target: 'https://app.geohod.ru',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.removeHeader('Origin');
          });
        },
      },
    },
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Requested-With, Telegram-Data, X-Test-Header',
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 8080,
    https: {},
  },
  build: {
    sourcemap: true,
    outDir: 'build',
    assetsDir: 'assets',
  },
});
