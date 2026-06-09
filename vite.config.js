/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  assetsInclude: ['**/*.png'],
  server: {
    // if you place certs at ./certs/localhost.key and ./certs/localhost.crt,
    // vite will use them for HTTPS. Otherwise HTTPS is disabled.
    https: (() => {
      try {
        const certDir = path.resolve(process.cwd(), 'certs')
        const keyPath = path.join(certDir, 'localhost.key')
        const certPath = path.join(certDir, 'localhost.crt')
        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
          return {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
          }
        }
      } catch (e) {}
      return false
    })(),
    host: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
})
