import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'CanopyNextJS',
      formats: ['es', 'cjs'],
      fileName: (format) => `canopy-nextjs.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'next/script', '@wnstn/canopy', 'effect'],
      output: {
        globals: {
          react: 'React',
          'next/script': 'nextScript',
          '@wnstn/canopy': 'Canopy',
          effect: 'Effect',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2022',
  },
});