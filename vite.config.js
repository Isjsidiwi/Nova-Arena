import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  server: {
    // Diakses publik via Cloudflare Tunnel (nova.kitsulabs.xyz -> localhost:5173)
    allowedHosts: ['nova.kitsulabs.xyz'],
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
