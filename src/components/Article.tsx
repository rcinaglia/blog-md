import { Link } from '@tanstack/react-router'


export interface ArticleSummary {
  slug: string;
  title: string;
  date: string;
  cover_image: string;
  tags?: string[] | undefined;
  summary: string;
}

interface ArticleProps {
  article: ArticleSummary;
}


export default function Article({ article }: ArticleProps) {
  const date = new Date(article.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  
  /*
  const categoryLabel = article.tags.length > 0
    ? article.tags.map((c) => c).join(', ')
    : 'nessuna categoria';
  */ 

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/articles/$slug"
        params={{ slug: article.slug }}
        className="group border border-white/10 w-full bg-black/25 flex flex-col sm:flex-row overflow-hidden transition-colors duration-200 hover:border-white/15 hover:bg-black/15"
      >
        <div className="sm:w-1/4 shrink-0 overflow-hidden">
          <img
            src={article.cover_image}
            alt="article-cover"
            className="w-full h-40 sm:h-full object-cover transition-transform duration-300"
          />
        </div>
        <div className="flex-1 gap-y-1 p-5 flex flex-col justify-center min-w-0">
          <div className="text-xs text-white/40 mb-2 flex flex-row gap-x-3 items-center">
            {date}
            <div className='flex flex-row gap-x-2'>
              {article.tags?.map((t) => {
                return <div key={t} className='line-clamp-1 py-0.5 px-1 border-white/10 bg-black/10 border uppercase text-xs'>
                    {t}
                </div>
              })}
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 group-hover:text-white/90">
            {article.title}
          </h2>
          <p className="text-[11pt] text-white/60 leading-relaxed line-clamp-5">
            {article.summary}
          </p>
        </div>
      </Link>
    </div>
  )
}
