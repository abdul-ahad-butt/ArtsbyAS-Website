import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for the standalone Admin Panel build.
// Output goes to dist-admin/ so it can be deployed to a separate
// Cloudflare Pages project without touching the main Worker build.
export default defineConfig({
  plugins: [react()],
  // Use admin.html as the entry point instead of index.html
  root: '.',
  build: {
    outDir: 'dist-admin',
    rollupOptions: {
      input: './admin.html',
    },
  },
  server: {
    proxy: {
      // During local dev, proxy /api calls to the main worker dev server
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
})
