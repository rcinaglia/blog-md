import { createFileRoute } from '@tanstack/react-router'
import fs from 'node:fs/promises'
import path from 'node:path'

// Static assets that live alongside the markdown content (images, pdfs, ...),
// served at /content/<path>. Kept separate from src/routes/articles/$slug.tsx,
// which reads the .md files themselves rather than raw files.
const SERVE_DIR = path.resolve(process.cwd(), 'content/serve')

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

export const Route = createFileRoute('/content/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const requested = params._splat ?? ''

        // Resolve against SERVE_DIR and make sure we land back inside it,
        // so "../../../etc/passwd"-style traversal can't escape the folder.
        const filePath = path.resolve(SERVE_DIR, requested)
        if (filePath !== SERVE_DIR && !filePath.startsWith(SERVE_DIR + path.sep)) {
          return new Response('Not Found', { status: 404 })
        }

        let stat: Awaited<ReturnType<typeof fs.stat>>
        try {
          stat = await fs.stat(filePath)
        } catch {
          return new Response('Not Found', { status: 404 })
        }

        if (!stat.isFile()) {
          return new Response('Not Found', { status: 404 })
        }

        const data = await fs.readFile(filePath)
        const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream'

        return new Response(data, {
          headers: {
            'Content-Type': contentType,
            'Content-Length': String(stat.size),
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
