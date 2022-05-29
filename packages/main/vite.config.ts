import { builtinModules } from 'module'
import { defineConfig } from 'vite'
import pkg from '../../package.json'
import path from "path";

export default defineConfig({
  root: __dirname,
  base: "./",
  build: {
    outDir: '../../dist/main',
    emptyOutDir: true,
    minify: process.env./* from mode option */NODE_ENV === 'production',
    sourcemap: true,
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
      fileName: () => '[name].cjs',
    },
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        // @ts-ignore
        ...Object.keys(pkg.dependencies || {}),
      ],
    },
  },
  publicDir:"../../public",
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "../../assets"),
      "@interfaces": path.resolve(__dirname, "../interfaces"),
    },
  },
})
