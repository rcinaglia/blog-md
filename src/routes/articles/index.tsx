import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import Header from '#/components/Header'
import Footer from '#/components/Footer'
import Article from '#/components/Article'
import Loader from '#/components/Loader'
import { getArticles } from '#/functions/articles'
import { Search, X } from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PER_PAGE = 10

type Filters = {
  searchQuery: string
  tags: string[]
  dateFrom?: string
  dateTo?: string
}

const EMPTY_FILTERS: Filters = { searchQuery: '', tags: [] }

// Pulls `tag:a,b` and `from:DD-MM-YYYY to:DD-MM-YYYY` tokens out of the raw
// search box text, leaving whatever's left as the free-text query.
function parseSearchInput(raw: string): Filters {
  let text = raw
  const tags: string[] = []
  let dateFrom: string | undefined
  let dateTo: string | undefined

  text = text.replace(/tag:(\S+)/gi, (_, value: string) => {
    tags.push(...value.split(',').map((t) => t.trim()).filter(Boolean))
    return ''
  })
  text = text.replace(/from:(\S+)/gi, (_, value: string) => {
    dateFrom = value
    return ''
  })
  text = text.replace(/to:(\S+)/gi, (_, value: string) => {
    dateTo = value
    return ''
  })

  return { searchQuery: text.replace(/\s+/g, ' ').trim(), tags, dateFrom, dateTo }
}

function articlesQueryOptions(page: number, filters: Filters) {
  return {
    queryKey: ['articles', 'public', page, filters.searchQuery, filters.tags, filters.dateFrom, filters.dateTo],
    queryFn: () => getArticles({
      data: {
        page,
        perPage: PER_PAGE,
        searchQuery: filters.searchQuery,
        tags: filters.tags,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      },
    }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  }
}

export const Route = createFileRoute('/articles/')({
  head: () => ({
    meta: [
      {
        title: 'Articles | cinaglia.dev',
      },
    ]
  }),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(articlesQueryOptions(1, EMPTY_FILTERS)),
  component: RouteComponent,
})

function RouteComponent() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  // debounce: parse `tag:`/`from:`/`to:` and apply 350ms after typing stops
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters(parseSearchInput(searchInput))
      setPage(1)
    }, 350)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const hasActiveFilters = filters.tags.length > 0 || !!filters.dateFrom || !!filters.dateTo

  const { data, isLoading, isFetching, error } = useQuery(articlesQueryOptions(page, filters))

  return <div className="min-h-screen flex flex-col">

    <Header />
    <div className='w-[90%] sm:w-[70%] lg:w-[50%] mx-auto sm:mt-25 mt-32 flex flex-col gap-y-5 mb-10 flex-1'>
      <h2 className='font-bold text-4xl'>Articles</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search..."
          className="w-full h-10 pl-10 pr-4 border border-white/10 hover:border-white/15 focus:border-white/15 bg-black/25 hover:bg-black/10 focus:bg-black/15 text-white placeholder:text-white/50 outline-none transition-all"
        />
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/50">
          {filters.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 border border-white/10 bg-black/25">
              tag: {tag}
            </span>
          ))}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="px-2 py-0.5 border border-white/10 bg-black/25">
              {filters.dateFrom ?? '…'} → {filters.dateTo ?? '…'}
            </span>
          )}
          <button
            onClick={() => { setSearchInput(''); setFilters(EMPTY_FILTERS); setPage(1) }}
            className="flex items-center gap-x-1 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
          >
            <X size={14} />Clear
          </button>
        </div>
      )}


      {isLoading ? (
        <Loader />
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <div className={`flex flex-col gap-y-5 transition-opacity ${isFetching ? 'opacity-50' : ''}`}>
          {(data?.articles.length ?? 0) === 0 ? (
            <p className='text-white/40 text-sm'>No articles found.</p>
          ) : (
            data?.articles.map((article) => <Article key={article.slug} article={article} />)
          )}
        </div>
      )}
      <div className='w-full flex justify-between items-center'>
        {page > 1 && (
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="bg-black/25 border border-white/10 py-3 px-4 cursor-pointer flex gap-x-2 hover:bg-black/10 hover:border-white/15 transition-all"
          >
            <ChevronLeft />Previous
          </button>
        )}

        {!data?.isLastPage && (
          <button
            onClick={() => setPage(p => p + 1)}
            className="bg-black/25 border border-white/10 py-2 px-3 cursor-pointer flex gap-x-2 hover:bg-black/10 hover:border-white/15 transition-all"
          >
            Next<ChevronRight />
          </button>
        )}
      </div>
    </div>
    <Footer />
  </div>

}
