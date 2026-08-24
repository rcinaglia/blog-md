import { createFileRoute } from '@tanstack/react-router'
import { getArticleFrontmatterBySlug } from '#/functions/articles'
import { getOgImage } from '#/functions/og-image'

// Generated share-preview image for an article, served at /og/<slug>.
// Referenced from the article route's <head> as og:image / twitter:image so
// links shared on WhatsApp, Reddit, etc. show a title card instead of the
// site favicon.
export const Route = createFileRoute('/og/$slug')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const meta = await getArticleFrontmatterBySlug(params.slug)
        if (!meta) {
          return new Response('Not Found', { status: 404 })
        }

        const png = await getOgImage(params.slug, meta.title, meta.cover_image)

        return new Response(png, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
