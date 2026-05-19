# Threads Composer Studio

A professional thread creation and publishing tool for Threads. Write, preview, organize, and publish threads efficiently.

## Features

- **Rich Thread Composer** — Drag-and-drop blocks, auto-save, undo/redo, keyboard shortcuts
- **Smart Auto-Splitter** — Intelligently splits text at paragraph/sentence boundaries (500 char limit)
- **Real Threads Preview** — Mobile & desktop preview with dark/light mode, live updates
- **Draft Management** — Auto-save, version history, search, tags, archive, local + cloud backup
- **Direct Publishing** — OAuth integration with Threads API, scheduled posting, retry on failure
- **AI Assistant** — Rewrite, expand ideas, generate hooks, tone presets (via OpenAI)
- **Templates** — Reusable thread frameworks (storytelling, listicle, CTA, etc.)
- **Idea Inbox** — Quick capture for future thread ideas
- **Analytics** — Track posts created, writing streaks, average length
- **Export** — Markdown, TXT, JSON formats
- **Screenshot Generator** — Beautiful thread screenshots for sharing
- **Offline Support** — PWA with service worker, works without internet
- **Security** — AES token encryption, CSRF, rate limiting, PIN protection, activity logs

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- TailwindCSS
- Zustand (state management)
- Supabase (auth + database)
- Threads API
- OpenAI API
- Vercel (deployment)

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project
- Threads Developer App (for publishing)
- OpenAI API key (for AI features)

### Installation

```bash
git clone <repo-url>
cd threads-composer-studio
npm install
```

### Environment Setup

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `THREADS_APP_ID` | Meta Threads app ID |
| `THREADS_APP_SECRET` | Meta Threads app secret |
| `THREADS_REDIRECT_URI` | OAuth callback URL |
| `OPENAI_API_KEY` | OpenAI API key |
| `ENCRYPTION_KEY` | 32+ char key for AES encryption |
| `JWT_SECRET` | Secret for CSRF token signing |
| `NEXT_PUBLIC_APP_URL` | App URL (http://localhost:3000 for dev) |

### Database Setup

Run the SQL schema in your Supabase SQL editor:

```bash
# File: supabase/schema.sql
```

This creates all tables, indexes, RLS policies, and triggers.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (auth, threads, ai, drafts)
│   ├── (auth)/            # Auth pages (login)
│   └── page.tsx           # Main dashboard
├── components/
│   ├── editor/            # Thread editor + blocks
│   ├── preview/           # Threads preview (mobile/desktop)
│   ├── layout/            # Sidebar, TopBar
│   ├── drafts/            # Draft management
│   ├── ai/                # AI assistant panel
│   ├── templates/         # Template panel
│   └── ui/                # Modals, analytics, ideas, etc.
├── lib/
│   ├── supabase/          # DB client, server, middleware, queries
│   ├── threads/           # Threads API client
│   ├── ai/                # OpenAI client
│   ├── security/          # Encryption, CSRF, rate-limit, headers
│   └── utils/             # Splitter, export, helpers
├── stores/                # Zustand stores (editor, drafts, ui)
├── hooks/                 # Custom hooks (auth, auto-save, offline)
├── types/                 # TypeScript types
└── config/                # App configuration
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+Enter` | Split block at cursor |
| `Backspace` (at start) | Merge with previous block |
| `Enter` (at end) | New block |

## Security Checklist

- [x] Tokens encrypted with AES (never exposed to frontend)
- [x] HTTP-only secure cookies via Supabase
- [x] CSRF protection on mutating endpoints
- [x] Rate limiting on all API routes
- [x] XSS protection headers
- [x] Content Security Policy
- [x] Input sanitization
- [x] PIN verification before publishing
- [x] Activity logging with IP/user-agent
- [x] Row Level Security on all tables
- [x] No secrets in client bundle
- [x] .env.example provided (no real values)

## Future Scaling

- Multi-account support (add account_id to schema)
- Scheduled queue with cron jobs (Vercel Cron or external)
- Real Threads analytics via API
- Collaboration mode (real-time with Supabase Realtime)
- Browser extension for quick capture
- Voice-to-thread via Whisper API
- Thread-to-carousel image generation

## License

Private / Personal Use
