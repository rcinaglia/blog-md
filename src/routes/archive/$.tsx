import { createFileRoute } from '@tanstack/react-router'
import {
  File, FileText, FileImage, FileVideo, FileAudio, FileArchive,
  FileCode, FileJson, FileSpreadsheet, Presentation, Database,
  Terminal, Type, Disc, Settings, FileKey, BookOpen, Box, Folder, ChevronLeft,
  type LucideIcon,
} from "lucide-react"; import { Link } from '@tanstack/react-router'
import { listObjects } from '#/functions/s3-functions'
import { queryOptions, useQuery } from '@tanstack/react-query'
import Loader from '#/components/Loader'

function objectsQueryOptions(prefix: string) {
  return queryOptions({
    queryKey: ['s3-objects', prefix],
    queryFn: () => listObjects({ data: prefix })
  })
}


export const Route = createFileRoute('/archive/$')({
  loader: ({ context: { queryClient }, params }) => {
    const prefix = params._splat ? params._splat + '/' : params._splat
    queryClient.query(objectsQueryOptions(prefix ?? ''))
  },
  head: () => ({
    meta: [
      {
        title: 'Archive - cinaglia.dev',
      },
    ]
  }),
  component: RouteComponent,
})

const iconMap: Record<string, LucideIcon> = {
  // testo e documenti
  txt: FileText, log: FileText, md: FileText, doc: FileText,
  docx: FileText, odt: FileText, rtf: FileText, pdf: FileText,
  // immagini
  png: FileImage, jpg: FileImage, jpeg: FileImage, gif: FileImage,
  webp: FileImage, bmp: FileImage, svg: FileImage,
  // media
  mp4: FileVideo, mkv: FileVideo, mov: FileVideo, avi: FileVideo, webm: FileVideo,
  mp3: FileAudio, wav: FileAudio, flac: FileAudio, ogg: FileAudio, m4a: FileAudio,
  // archivi
  zip: FileArchive, rar: FileArchive, "7z": FileArchive, tar: FileArchive, gz: FileArchive,
  // codice
  js: FileCode, ts: FileCode, tsx: FileCode, jsx: FileCode, py: FileCode,
  java: FileCode, c: FileCode, cpp: FileCode, go: FileCode, rs: FileCode,
  php: FileCode, html: FileCode, css: FileCode,
  // dati
  json: FileJson, xml: FileJson, yaml: FileJson, yml: FileJson, toml: FileJson,
  xls: FileSpreadsheet, xlsx: FileSpreadsheet, ods: FileSpreadsheet,
  csv: FileSpreadsheet, tsv: FileSpreadsheet,
  ppt: Presentation, pptx: Presentation, odp: Presentation,
  sql: Database, db: Database, sqlite: Database,
  // sistema
  exe: Terminal, msi: Terminal, sh: Terminal, bat: Terminal,
  ttf: Type, otf: Type, woff: Type, woff2: Type,
  iso: Disc, img: Disc, dmg: Disc,
  ini: Settings, conf: Settings, env: Settings, cfg: Settings,
  pem: FileKey, key: FileKey, crt: FileKey,
  epub: BookOpen, mobi: BookOpen,
  obj: Box, stl: Box, fbx: Box, glb: Box,
};

function getFileIcon(name: string, isDirectory = false): LucideIcon {
  if (isDirectory) return Folder;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return iconMap[ext] ?? File;
}

const COL = {
  icon: 'w-10',
  name: 'flex-1 min-w-0 truncate',
  weight: 'w-24',
  date: 'w-28',
  options: 'w-14 flex justify-end',
}

const formatSize = (bytes: number) =>
  bytes > 1024 ** 2
    ? `${(bytes / 1024 ** 2).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT')

function RouteComponent() {
  const { _splat } = Route.useParams();
  let prefix = (_splat ?? "");
  if (prefix != '')
    prefix += '/'

  const { data, error, isPending } = useQuery(objectsQueryOptions(prefix))

  const backPrefix = '/' + prefix.split('/').filter(Boolean).slice(0, -1).join('/')

  if (error)
    return <div className='text-red-500 mx-auto'>
      {error.message}
    </div>

  return (
    <div className="flex flex-col gap-y-5 w-[90%] sm:w-[90%] md:w-[70%] lg:w-[50%] mx-auto my-10">
      <div className="w-full items-start flex mb-5">
        <div className='items-center flex sm:flex sm:flex-row flex-col sm:justify-between justify-center gap-y-5 w-full'>
          <div className="font-mono font-bold text-xl text-white/60 ">
            <Link to='/' className='hover:underline'>cinaglia.dev</Link><span className="text-white">/archive</span>
          </div>
          <div className='flex gap-x-3 justify-start'>
            <Link to='/' className="text-white flex gap-x-1 cursor-pointer border rounded-lg border-white/10 p-1 px-2  hover:bg-white/5 transition-all duration-300">
              <ChevronLeft className="w-4" />
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>

      <div className="text-sm text-white/70 flex gap-x-1 truncate text-nowrap">
        <Link href='/archive' to='/archive/$' className="hover:underline cursor-pointer">Home</Link>
        {
          prefix.split('/').map((p) => {
            return <>
              <span>/</span>
              <Link href={`/archive/${p}`} to='/archive/$' className="hover:underline cursor-pointer">{p}</Link>
            </>
          })
        }
      </div>

      <div className="w-full overflow-hidden rounded-lg bg-white/5">
        {/* Header: solo desktop */}
        <div
          role="row"
          className="hidden sm:flex items-center h-10 px-3 text-xs sm:text-sm border-b border-white/15"
        >
          <div className={COL.icon}>#</div>
          <div className={COL.name}>Name</div>
          <div className={COL.weight}>Size</div>
          <div className={COL.date}>Last Modified</div>
        </div>

        {

          prefix && !isPending && <Link to='/'
            href={`/archive/${backPrefix}`}
            className="flex items-center min-h-12 sm:min-h-10 px-3 py-1.5 text-xs cursor-pointer hover:bg-white/5"
          >
            <div className={`${COL.icon} shrink-0`}><Folder className="w-4" /></div>

            <div className="flex-1 min-w-0">
              <div className="truncate text-sm sm:text-xs">../</div>
            </div>
          </Link>

        }

        {/* rows */}
        {isPending ? <Loader /> : data?.map((o: any, key) => {
          const Icon = getFileIcon(o.name, o.type === 'folder')
          let href = ''
          if (o.type == 'folder')
            href = `/archive/${prefix ? `${prefix}/` : ''}${o.name}`
          else
            href = o.directUrl

          return (
            <Link to='/'
              key={o.name}
              href={href}
              className={`flex items-center min-h-12 sm:min-h-10 px-3 py-1.5 text-xs cursor-pointer hover:bg-white/5 sm:border-none ${(key != 0 || prefix) && 'border-t'} border-white/10`}
            >
              <div className={`${COL.icon} shrink-0`}><Icon className="w-4" /></div>

              <div className="flex-1 min-w-0">
                <div className="truncate text-sm sm:text-xs">{o.name}</div>
                {/* solo mobile */}
                <div className="sm:hidden text-[11px] text-white/50">
                  {o.type == 'folder' ? 'Folder' : `${formatSize(o.size)} · ${formatDate(o.date)}`}
                </div>
              </div>

              {/* solo desktop */}
              <div className={`hidden sm:block shrink-0 ${COL.weight} text-white/60`}>
                {o.type == 'folder' ? '-' : formatSize(o.size)}
              </div>
              <div className={`hidden sm:block shrink-0 ${COL.date} text-white/60`}>
                {o.type == 'folder' ? '-' : formatDate(o.date)}
              </div>
            </Link>
          )
        })}

        {!isPending && data?.length === 0 && (
          <div className="mx-auto text-white/70 text-sm my-6 text-center">
            There's nothing here.
          </div>
        )}


      </div>
    </div>
  )
}