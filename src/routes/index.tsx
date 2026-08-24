import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import Article from '../components/Article'
import Header from '../components/Header'
import Footer from '#/components/Footer'
import SocialIcons from '../components/SocialIcons'
import { getArticles } from "#/functions/articles"
import Loader from '#/components/Loader'

export const Route = createFileRoute('/')({
  component: Home,
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData({
        queryKey: ["articles", "latest"],
        queryFn: () => getArticles({ data: { page: 1, limit: 5 } }),
      }),
    ])
  },
})

function Home() {

  const { data: articlesData, isLoading: isLoadingArticles } = useQuery({
    queryKey: ["articles", "latest"],
    queryFn: () => getArticles({ data: { page: 1, limit: 5 } }),
  })

  if (isLoadingArticles)
    return <Loader/>

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="w-[90%] sm:w-[90%] md:w-[70%] lg:w-[50%] mx-auto sm:mt-25 mt-32 flex flex-col gap-y-15 mb-10 flex-1">

        <div className='flex flex-col gap-y-10'>
          <div className='flex flex-col sm:flex-row gap-8'>
            <span className='w-50 h-50 rounded-full shrink-0 bg-white/10 overflow-hidden flex items-center justify-center text-4xl font-bold mx-auto sm:mx-0'>
              <img src="/pfp2.jpg" className='w-full h-full object-cover' />
            </span>
            <div className='flex flex-col gap-y-5 justify-center'>
              <div className='flex flex-col gap-y-3'>
                <h2 className='text-2xl font-extrabold'>Chi sono</h2>
                <p>Ciao, mi chiamo Riccardo, sono uno studente di Ingegneria Informatica appassionato di tecnologia. Da poco gestisco questo blog, sviluppato da me (eh si, niente WordPress), dove parlerò di qualsiasi cosa mi sembri interessante.</p>
              </div>
              <SocialIcons/>
            </div>
          </div>
        </div>
        {articlesData && articlesData?.articles.length > 0 && <div className='flex flex-col gap-y-5'>
          <h2 className='text-3xl font-bold'>Latest articles</h2>
          <div className='flex flex-col gap-y-5'>
            {
              articlesData?.articles.map((article) => <Article key={article.slug} article={article} />)
            }
          </div>
        </div>}
      </div>
      <Footer/>
    </div>
  )
}
