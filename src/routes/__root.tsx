import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'

import NoCookieBanner from '#/components/NoCookieBanner'
import ProgressBar from '#/components/ProgressBar'
import NotFound from '#/components/NotFound'

import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'cinaglia.dev',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=block',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  
  

  return (
    <html lang="en">
      <head>
        <HeadContent />
        {process.env.VITE_UMAMI_SCRIPT_URL && process.env.VITE_UMAMI_WEBSITE_ID && <script defer src={process.env.VITE_UMAMI_SCRIPT_URL} data-website-id={process.env.VITE_UMAMI_WEBSITE_ID}></script>}
        {process.env.VITE_UMAMI_RECORDER_URL && process.env.VITE_UMAMI_WEBSITE_ID && <script defer src={process.env.VITE_UMAMI_RECORDER_URL} data-website-id={process.env.VITE_UMAMI_WEBSITE_ID}></script>}
      </head>
      <body>
        <ProgressBar />
        {children}
        <NoCookieBanner />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
