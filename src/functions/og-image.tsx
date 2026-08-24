import fs from 'node:fs/promises'
import path from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const CONTENT_SERVE_DIR = path.join(process.cwd(), 'content/serve')
const PUBLIC_DIR = path.join(process.cwd(), 'public')
const SIZE = 1200

type FontSpec = { name: string; family: string; weight: 400 | 700 | 800; style: 'normal' }

// Google's css2 endpoint picks the font format to serve based on the
// requesting User-Agent (woff2 for modern browsers, ttf/otf as a fallback
// for anything it doesn't recognize). Node's fetch sends no browser UA, so
// it falls into the fallback bucket and gets a format satori (opentype.js)
// can actually parse - satori doesn't support woff2.
async function fetchGoogleFont({ family, weight }: FontSpec): Promise<Buffer> {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`
    const cssRes = await fetch(cssUrl)
    if (!cssRes.ok) throw new Error(`failed to fetch Google Fonts CSS for ${family} ${weight}: ${cssRes.status}`)
    const css = await cssRes.text()

    const match = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/)
    if (!match) throw new Error(`no truetype/opentype source in Google Fonts CSS for ${family} ${weight}`)

    const fontRes = await fetch(match[1])
    if (!fontRes.ok) throw new Error(`failed to fetch font file for ${family} ${weight}: ${fontRes.status}`)
    return Buffer.from(await fontRes.arrayBuffer())
}

const FONT_SPECS: FontSpec[] = [
    { name: 'DM Sans', family: 'DM Sans', weight: 800, style: 'normal' },
    { name: 'JetBrains Mono', family: 'JetBrains Mono', weight: 700, style: 'normal' },
]

let fontsPromise: Promise<{ name: string; data: Buffer; weight: 400 | 700 | 800; style: 'normal' }[]> | null = null

function loadFonts() {
    if (!fontsPromise) {
        fontsPromise = Promise.all(FONT_SPECS.map(fetchGoogleFont))
            .then((buffers) => buffers.map((data, i) => ({ ...FONT_SPECS[i], data })))
            .catch((err) => {
                // don't cache a failed fetch - let the next request retry
                fontsPromise = null
                throw err
            })
    }
    return fontsPromise
}

const MIME_BY_EXT: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.gif': 'image/gif',
}

// satori doesn't fetch images itself: any <img src> has to already be a data
// URI (or an in-memory buffer) by the time we hand it the JSX. cover_image
// is authored trusted frontmatter, either "/content/..." (served from
// content/serve/) or another root-relative path served from public/.
async function resolveCoverImageDataUri(coverImage: string): Promise<string | null> {
    const mime = MIME_BY_EXT[path.extname(coverImage).toLowerCase()]
    if (!mime) return null

    try {
        let bytes: Buffer

        if (/^https?:\/\//.test(coverImage)) {
            const res = await fetch(coverImage)
            if (!res.ok) return null
            bytes = Buffer.from(await res.arrayBuffer())
        } else {
            const baseDir = coverImage.startsWith('/content/') ? CONTENT_SERVE_DIR : PUBLIC_DIR
            const relative = coverImage.startsWith('/content/') ? coverImage.slice('/content/'.length) : coverImage
            const filePath = path.resolve(baseDir, `.${path.sep}${relative}`)

            // keep resolution inside the expected directory
            if (filePath !== baseDir && !filePath.startsWith(baseDir + path.sep)) return null

            bytes = await fs.readFile(filePath)
        }

        return `data:${mime};base64,${bytes.toString('base64')}`
    } catch {
        return null
    }
}

// slug -> rendered PNG buffer. Rebuilding the image (satori + resvg, plus
// reading the cover off disk) is noticeably heavier than a plain file read,
// so we keep generated images around for a while; articles change rarely
// once published.
const CACHE_TTL_MS = 60 * 60_000 // 1h
const cache = new Map<string, { buffer: Buffer; builtAt: number }>()

export async function getOgImage(slug: string, title: string, coverImage?: string): Promise<Buffer> {
    const cached = cache.get(slug)
    if (cached && Date.now() - cached.builtAt < CACHE_TTL_MS) {
        return cached.buffer
    }

    const [fonts, coverDataUri] = await Promise.all([
        loadFonts(),
        coverImage ? resolveCoverImageDataUri(coverImage) : Promise.resolve(null),
    ])

    const markup = (
        <div
            style={{
                position: 'relative',
                width: SIZE,
                height: SIZE,
                display: 'flex',
                backgroundColor: '#0f0f0f',
                fontFamily: 'DM Sans',
                overflow: 'hidden',
            }}
        >
            {coverDataUri && (
                <img
                    src={coverDataUri}
                    width={SIZE}
                    height={SIZE}
                    style={{ display: 'flex', position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
                />
            )}

            {coverDataUri && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        // satori doesn't size an absolutely-positioned,
                        // childless div from `inset: 0` alone — it needs
                        // explicit dimensions or it collapses to 0x0
                        width: SIZE,
                        height: SIZE,
                        display: 'flex',
                        // scrim over the photo so the caption stays legible.
                        // Many evenly-paced stops (not just 2-3) so the
                        // falloff reads as one smooth fade instead of a
                        // visible seam where the rate of change jumps
                        backgroundImage:
                            'linear-gradient(to top, rgba(15,15,15,0.94) 0%, rgba(15,15,15,0.88) 12%, rgba(15,15,15,0.78) 24%, rgba(15,15,15,0.64) 36%, rgba(15,15,15,0.49) 48%, rgba(15,15,15,0.35) 60%, rgba(15,15,15,0.22) 72%, rgba(15,15,15,0.12) 82%, rgba(15,15,15,0.05) 91%, rgba(15,15,15,0) 100%)',
                    }}
                />
            )}

            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    // with a cover photo the title+footer sit as a caption
                    // pinned to the bottom, over the gradient; with no
                    // photo the title is vertically centered instead so a
                    // short title doesn't leave a huge gap up top
                    // (satori chokes on style values that are explicitly
                    // `undefined`, so these are branched, not ternaried)
                    ...(coverDataUri ? { justifyContent: 'flex-end' } : {}),
                    width: '100%',
                    height: '100%',
                    padding: '96px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        ...(coverDataUri ? {} : { flex: 1, alignItems: 'center' }),
                    }}
                >
                    <div
                        style={{
                            // '-webkit-box' + line-clamp is how satori truncates
                            // overly long titles instead of overflowing the canvas
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: coverDataUri ? 4 : 6,
                            overflow: 'hidden',
                            fontSize: 72,
                            fontWeight: 800,
                            lineHeight: 1.15,
                            letterSpacing: '-0.02em',
                            color: '#ffffff',
                        } as any}
                    >
                        {title}
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '48px',
                        paddingTop: '32px',
                        borderTop: '1px solid rgba(255,255,255,0.15)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            fontFamily: 'JetBrains Mono',
                            fontWeight: 700,
                            fontSize: 30,
                            letterSpacing: '-0.02em',
                            color: 'rgba(255,255,255,0.6)',
                        }}
                    >
                        rs.cinaglia.dev
                    </div>
                </div>
            </div>
        </div>
    )

    const svg = await satori(markup, { width: SIZE, height: SIZE, fonts })
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: SIZE } }).render().asPng()
    const buffer = Buffer.from(png)

    cache.set(slug, { buffer, builtAt: Date.now() })
    return buffer
}
