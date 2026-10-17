import { defineConfig } from 'vite';
import { resolve } from 'path';

// Standalone CDN script build — dist/script.js, served at /p.js by the dashboard.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/script.ts'),
      name: 'CanopyScript',
      formats: ['iife'],
      fileName: () => 'script.js',
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
  },
});
