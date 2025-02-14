import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              // Ajustar las exclusiones
              external: [
                'puppeteer',
                'puppeteer-core',
                'puppeteer-extra',
                'sharp',
                'pdfkit',
                'svg-to-pdfkit'
              ],
              output: {
                // Esto ayuda con módulos nativos
                format: 'cjs'
              }
            },
            // Configuración importante para electrón
            commonjsOptions: {
              dynamicRequireTargets: [
                // Incluir paquetes nativos necesarios
                'node_modules/{puppeteer,puppeteer-core,puppeteer-extra,sharp,pdfkit}/**/*'
              ]
            }
          }
        }
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: {}
    })
  ],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true  // Necesario para algunos módulos
    }
  }
})