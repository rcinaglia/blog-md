import { createFileRoute, notFound } from '@tanstack/react-router'
import Header from '#/components/Header'
import Footer from '#/components/Footer'
import Author from '#/components/Author'
import ArticleBody from '#/components/ArticleBody'
import { getArticleBySlug } from '#/functions/articles'
import { SITE_NAME, SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/articles/$slug')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const article = await getArticleBySlug({ data: params.slug })
    if (!article) throw notFound()
    return article
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {}

    const { meta } = loaderData
    const title = `${meta.title} | ${SITE_NAME}`
    const url = `${SITE_URL}/articles/${params.slug}`
    const ogImage = `${SITE_URL}/og/${params.slug}`

    return {
      meta: [
        { title },
        { name: 'description', content: meta.summary },

        { property: 'og:type', content: 'article' },
        { property: 'og:site_name', content: SITE_NAME },
        { property: 'og:title', content: meta.title },
        { property: 'og:description', content: meta.summary },
        { property: 'og:url', content: url },
        { property: 'og:image', content: ogImage },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '1200' },
        { property: 'og:image:type', content: 'image/png' },

        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: meta.title },
        { name: 'twitter:description', content: meta.summary },
        { name: 'twitter:image', content: ogImage },
      ],
    }
  },
})

function RouteComponent() {
  const article = Route.useLoaderData()

  const date = new Date(article.meta.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
  return <div className="min-h-screen flex flex-col">

    <Header />
    <div className='sm:mt-25 mt-32 w-[90%] sm:w-[70%] lg:w-[50%] mx-auto mb-5 flex flex-col gap-y-12 flex-1'>
      <div className='relative overflow-hidden'>
        <img
          src={article.meta.cover_image}
          alt="Article Cover Image"
          className='w-full h-105 object-cover'
        />
        <div className='absolute inset-0 bg-linear-to-t from-black via-black/55 to-transparent' />
        <div className='absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-y-3'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-white leading-tight'>
            {article.meta.title}
          </h2>
          <div className='gap-x-3 flex text-white/70 text-sm'>
            <span>{date}</span>
            <div className='flex flex-row gap-x-2'>
              {article.meta.tags?.map((t) => {
                return <div key={t} className='py-0.5 px-1 border-white/10 bg-black/10 border uppercase text-xs'>
                  {t}
                </div>
              })}
            </div>
          </div>
        </div>
      </div>

      <div className='prose prose-invert max-w-none marker:text-white/30'>
        <ArticleBody html={article.html} />
      </div>

      <Author />
    </div>
    <Footer />
  </div>
}
