import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],

    build: {
        // Content-hashed filenames for aggressive caching
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Split React into its own chunk
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) {
                        return 'vendor-react';
                    }
                    // Split UI libraries (radix, shadcn dependencies)
                    if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/class-variance-authority') || id.includes('node_modules/clsx')) {
                        return 'vendor-ui';
                    }
                    // Split Inertia into its own chunk
                    if (id.includes('node_modules/@inertiajs')) {
                        return 'vendor-inertia';
                    }
                },
                // Ensure hashed filenames for cache-busting
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
            },
        },
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Target modern browsers for smaller output
        target: 'es2020',
        // Enable source maps for production debugging (optional)
        sourcemap: false,
    },
});
