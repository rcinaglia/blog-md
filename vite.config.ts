import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // OG image generation deps must never be bundled/optimized by Vite or
  // Rollup: @resvg/resvg-js ships a native .node binary, and satori pulls in
  // harfbuzzjs, which relies on `__dirname` and breaks once rolled up into
  // an ESM chunk. Both need to stay plain node_modules requires at runtime.
  optimizeDeps: { exclude: ['@resvg/resvg-js', 'satori'] },
  ssr: { external: ['@resvg/resvg-js', 'satori'] },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//, '@resvg/resvg-js', 'satori'] } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
