import { createServerFn } from "@tanstack/react-start";
import z from "zod"

import { notFound } from "@tanstack/react-router";
import fs from "node:fs/promises"
import path from "node:path";
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

// Isomorphic-by-default: this module is also pulled into the client bundle
// (its createServerFn RPC stubs are loader-reachable), so `path`/`fs` calls
// must stay lazy inside functions — never evaluated at module scope, or
// they blow up client-side (Vite stubs "node:path" for the browser and
// throws the moment something actually calls into it).
function getArticlesDir() {
    return path.join(process.cwd(), 'content/articles')
}
const INDEX_TTL_MS = 60_000 // 1 min

let indexCache: { articles: ArticleMeta[], builtAt: number } | null = null


const articleMetaSchema = z.object({
    title: z.string(),
    cover_image: z.string(),
    date: z.string(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    summary: z.string(),
})

type ArticleMeta = z.infer<typeof articleMetaSchema> & { slug: string }

async function buildIndex(): Promise<ArticleMeta[]> {

    const articlesDir = getArticlesDir()
    const files = await fs.readdir(articlesDir)
    const mdFiles = files.filter((f) => f.endsWith('.md'))


    const articles = await Promise.all(
        mdFiles.map(async (filename) => {
            const slug = filename.replace(/\.md$/, '')
            const raw = await fs.readFile(path.join(articlesDir, filename), "utf-8")
            const { data } = matter(raw)
            return { slug, ...articleMetaSchema.parse(data) }
        })
    )

    return articles
        .filter((a) => !a.draft)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

async function getIndex(): Promise<ArticleMeta[]> {
    const now = Date.now()
    if (indexCache && now - indexCache.builtAt < INDEX_TTL_MS) {
        return indexCache.articles
    }
    const articles = await buildIndex()
    indexCache = { articles, builtAt: now }
    return articles
}

// "DD-MM-YYYY" -> epoch ms, undefined if missing/invalid
function parseDMY(value?: string): number | undefined {
    if (!value) return undefined
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim())
    if (!match) return undefined
    const [, day, month, year] = match
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return Number.isNaN(date.getTime()) ? undefined : date.getTime()
}

const DAY_MS = 24 * 60 * 60 * 1000

export const getArticles = createServerFn({ method: 'GET' })
    .validator((input: unknown) => z.object({
        page: z.number().min(1).optional().default(1),
        perPage: z.number().min(10).max(100).optional().default(10),
        searchQuery: z.string().optional().default(''),
        tags: z.array(z.string()).optional().default([]),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
    }).parse(input))
    .handler(async ({ data: { page, perPage, searchQuery, tags, dateFrom, dateTo } }) => {
        const all = await getIndex()

        const query = searchQuery.trim().toLowerCase()
        const wantedTags = tags.map((t) => t.toLowerCase()).filter(Boolean)
        const fromTs = parseDMY(dateFrom)
        const toTs = parseDMY(dateTo)
        const toTsInclusive = toTs !== undefined ? toTs + DAY_MS - 1 : undefined

        const filtered = all.filter((a) => {
            if (query && !a.title.toLowerCase().includes(query) && !a.summary.toLowerCase().includes(query)) {
                return false
            }

            if (wantedTags.length > 0) {
                const articleTags = (a.tags ?? []).map((t) => t.toLowerCase())
                if (!wantedTags.some((t) => articleTags.includes(t))) return false
            }

            const articleTs = new Date(a.date).getTime()
            if (fromTs !== undefined && articleTs < fromTs) return false
            if (toTsInclusive !== undefined && articleTs > toTsInclusive) return false

            return true
        })

        const start = (page - 1) * perPage
        return {
            articles: filtered.slice(start, start + perPage),
            total: filtered.length,
            page,
            perPage,
            isLastPage: start + perPage >= filtered.length,
        }
    })


// Inserts a "Copy" <button> as the first child of every <pre>, directly in
// the hast tree. Baking it into the HTML string itself (instead of adding it
// imperatively client-side after mount) means it's always present the moment
// the article renders, on every navigation path — no effect-timing races.
function rehypeAddCopyButtons() {
    return (tree: any) => {
        function visit(node: any) {
            if (node.type === 'element' && node.tagName === 'pre') {
                node.properties = { ...node.properties, style: 'position:relative' }
                node.children = [
                    {
                        type: 'element',
                        tagName: 'button',
                        properties: {
                            type: 'button',
                            className: [
                                'copy-btn', 'absolute', 'top-2', 'right-2', 'text-xs',
                                'px-2', 'py-1', 'rounded', 'bg-white/10', 'hover:bg-white/20',
                                'text-white/70', 'cursor-pointer',
                            ],
                        },
                        children: [{ type: 'text', value: 'Copy' }],
                    },
                    ...node.children,
                ]
                return
            }
            node.children?.forEach(visit)
        }
        visit(tree)
    }
}

const sanitizeSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), 'button'],
    attributes: {
        ...defaultSchema.attributes,
        pre: [...(defaultSchema.attributes?.pre ?? []), 'style'],
        button: ['type', 'className'],
    },
}

async function markdownToHtml(md: string) {
    const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, {allowDangerousHtml: true})
        .use(rehypeRaw)
        .use(rehypeAddCopyButtons)
        .use(rehypeSanitize, sanitizeSchema)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(md)

    return String(file)
}

export const getArticleBySlug = createServerFn({ method: 'GET' })
    .validator((slug: unknown) => z.string().parse(slug))
    .handler(async ({data: slug}) => {

        // detect path traversal
        if (!/^[a-z0-9-]+$/.test(slug)) {
            throw notFound()
        }

        const filePath = path.join(getArticlesDir(), `${slug}.md`)

        let raw: string
        try {
            raw = await fs.readFile(filePath, 'utf-8')
        }
        catch {
            throw notFound()
        }

        const {data: frontmatter, content} = matter(raw)

        if (frontmatter.draft)
            throw notFound()

        const html = await markdownToHtml(content)

        return {
            slug,
            meta: frontmatter as {
                title: string,
                date: string,
                tags?: string[],
                cover_image: string,
                summary: string,
            },
            html
        }
    })

// Plain (non-RPC) helper for server-only callers, e.g. the OG image route,
// that only need the frontmatter and not the rendered HTML body.
export async function getArticleFrontmatterBySlug(slug: string) {
    if (!/^[a-z0-9-]+$/.test(slug)) {
        return null
    }

    const filePath = path.join(getArticlesDir(), `${slug}.md`)

    let raw: string
    try {
        raw = await fs.readFile(filePath, 'utf-8')
    }
    catch {
        return null
    }

    const { data: frontmatter } = matter(raw)
    if (frontmatter.draft) return null

    return articleMetaSchema.parse(frontmatter)
}
