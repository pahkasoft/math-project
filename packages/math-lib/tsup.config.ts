import { defineConfig } from 'tsup'
import pkg from './package.json' assert { type: 'json' }
import { cpSync } from 'fs'

const bannerText = `/* MathLib v${pkg.version} | (c) 2025 PahkaSoft | MIT License */`;

export default defineConfig([
    // ESM bundle
    {
        entry: {
            'bigmath/index': 'src/bigmath/index.ts',
            'engine/index': 'src/engine/index.ts',
            'eval/index': 'src/eval/index.ts',
            'parser/index': 'src/parser/index.ts'
        },
        outDir: 'dist',
        target: 'es2015',
        format: ['esm'],
        dts: true,
        sourcemap: true,
        clean: true,
        external: ['react', '@tspro/math-lib'],
        banner: {
            js: bannerText
        },
        define: {
            __LIB_INFO__: JSON.stringify(`MathLib v${pkg.version} (esm)`)
        },
        async onSuccess() {
            cpSync('src/styles', 'dist/styles', { recursive: true })
        },
    },

    // CJS bundle
    {
        entry: {
            'bigmath/index': 'src/bigmath/index.ts',
            'engine/index': 'src/engine/index.ts',
            'eval/index': 'src/eval/index.ts',
            'parser/index': 'src/parser/index.ts'
        },
        outDir: 'dist',
        target: 'es2015',
        format: ['cjs'],
        dts: true,
        sourcemap: true,
        clean: false, // Don't wipe dist from the previous build
        external: ['react', '@tspro/math-lib'],
        banner: {
            js: bannerText
        },
        define: {
            __LIB_INFO__: JSON.stringify(`MathLib v${pkg.version} (cjs)`)
        }
    },

    // IIFE bundle
    {
        entry: {
            'iife/index': 'src/index.iife.ts'
        },
        outDir: 'dist',
        target: 'es2015',
        format: ['iife'],
        globalName: 'MathLib',
        sourcemap: true,
        minify: true,
        clean: false, // Don't wipe dist from the previous build
        banner: {
            js: bannerText
        },
        define: {
            __LIB_INFO__: JSON.stringify(`MathLib v${pkg.version} (iife)`)
        }
    }
]);
