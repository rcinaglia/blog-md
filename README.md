# blog-md

Personal blog and public file archive for [cinaglia.dev](https://cinaglia.dev), built with React, TanStack Start, and Markdown-based article publishing.

## Project Structure

```text
content/
├── articles/       Markdown articles
└── serve/          Static files served through /content/*

public/             Static public assets

src/
├── components/     Shared React components
├── functions/      Server functions and content processing
├── lib/            Shared configuration and integrations
└── routes/         TanStack file-based routes
```

## Routes

- `/` — Homepage and latest articles
- `/articles` — Searchable and filterable article index
- `/articles/:slug` — Individual article
- `/archive/*` — S3-backed file archive
- `/content/*` — Static files from `content/serve`
- `/og/:slug` — Generated article preview image
- `/privacy-policy` — Privacy policy


# Getting Started

## Writing Articles

Create a Markdown file in `content/articles/`. The filename becomes the article slug. For example, `content/articles/my-first-post.md` is available at `/articles/my-first-post`.

Articles use frontmatter similar to:

```md
---
title: My First Post
cover_image: /content/images/my-first-post.jpg
date: 2026-01-15
tags:
  - programming
  - web
summary: A short description of the article.
draft: false
---

Article content goes here.
```

Articles support tables, raw HTML, syntax highlighting, sanitized HTML output, and copy buttons for code blocks. Set `draft: true` to exclude an article from the public index and article pages.
To include images, videos etc.., upload them in `content/serve`, then refer to them with `/content/filename.format`.  For example `/content/image.png`.

## Environment Variables

Refer to `.env.example` for an example env file. 

### Content

Directories for articles and other files to be served by the server.

```  
ARTICLES_DIR=./content/articles
SERVE_DIR=./content/serve
```

### S3 Archive

The archive uses an S3-compatible storage provider:

```env
S3_REGION=
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_ACCESS_KEY_SECRET=
S3_BUCKET=
S3_PUBLIC_BUCKET_URL=
```

### Umami Analytics

Analytics environment variables are optional:

```env
VITE_UMAMI_SCRIPT_URL=
VITE_UMAMI_RECORDER_URL=
VITE_UMAMI_WEBSITE_ID=
```

Analytics scripts are only added when the corresponding variables are configured.

## Docker

Build and start the application with Docker Compose:

```bash
docker compose up --build
```

The application will be available at [http://localhost:3000](http://localhost:3000).

Docker Compose mounts `content/articles`, `content/serve`, and `.env.local` into the container. To run it in the background:

```bash
docker compose up --build -d
```

## Production Build

Build the application:

```bash
npm run build
```

The production output is generated in `.output/`. The Nitro server can be started with:

```bash
node --env-file=.env.local .output/server/index.mjs
```

## Development Server

### Requirements

- Node.js 22 or newer
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The application is available at [http://localhost:3000](http://localhost:3000).

## License

See [LICENSE](LICENSE) for licensing information.
