import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  server: {
    // Diakses publik via Cloudflare Tunnel (nova.kitsulabs.xyz -> localhost:5173)
    allowedHosts: ['nova.kitsulabs.xyz'],
    // Jangan simpan cache di origin; Cloudflare masih bisa meng-cache di edge,
    // jadi ganti aset tetap wajib menaikkan ?v= di src/config/assets.js.
    headers: { 'Cache-Control': 'no-store' },
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
