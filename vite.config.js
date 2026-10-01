import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const apiTarget = 'http://localhost:8080'

// /expenses is BOTH a client-side route (page) and a backend API prefix.
// A browser page load / refresh of this route sends Accept: text/html and can
// never carry the JWT, so it must be served by Vite's SPA fallback (index.html).
// API calls from the frontend send Accept: */* and are proxied to the backend.
const spaCompatibleProxy = {
  target: apiTarget,
  changeOrigin: true,
  bypass(req) {
    if ((req.headers.accept || '').includes('text/html')) return '/index.html'
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: apiTarget, changeOrigin: true },
      '/users': { target: apiTarget, changeOrigin: true },
      '/expenses': spaCompatibleProxy,
      '/incomes': { target: apiTarget, changeOrigin: true },
      '/goals': { target: apiTarget, changeOrigin: true },
      '/budgets': { target: apiTarget, changeOrigin: true },
      '/notifications': { target: apiTarget, changeOrigin: true },
    },
  },
})