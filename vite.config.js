import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['images/mystik/logo mystik.png', 'images/mystik/logo mystik black.png'],
      manifest: {
        name: 'Mystik Admin Console',
        short_name: 'Mystik Admin',
        description: 'Console de gestion pour Mystik Beverage',
        theme_color: '#000000',
        background_color: '#fafaf9',
        display: 'standalone',
        scope: '/admin/',
        start_url: '/admin/',
        icons: [
          {
            src: '/images/mystik/logo mystik.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/images/mystik/logo mystik.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      // API routes (/api/*) are now handled by Vercel Dev automatically.
      '/cinetpay-api': {
        target: 'https://api.cinetpay.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cinetpay-api/, '')
      }
    }
  }
})
