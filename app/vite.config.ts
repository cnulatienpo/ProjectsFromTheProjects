import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'react',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@sigil': path.resolve(__dirname, 'src/sigil-syntax'),
        },
    },
});
