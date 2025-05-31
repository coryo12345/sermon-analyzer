# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a **multi-service monorepo** for sermon analysis with three components:

1. **Go API Backend** (`/api/`) - PocketBase-powered REST API with SQLite database
2. **Preact Frontend** (`/ui/`) - Modern web UI with TailwindCSS and Vite
3. **Audio Fetcher Service** (`/audio-fetcher/`) - Node.js service for YouTube audio extraction (currently stubbed)

The project uses Go workspaces (`go.work`) to manage backend dependencies.

## Development Commands

### Backend API (`/api/`)
```bash
make run       # Start PocketBase server (includes admin UI)
make watch     # Hot reload development with air
make build     # Build production binary
make test      # Run Go tests
```

### Frontend UI (`/ui/`)
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run format   # Format with Prettier
```

### Audio Fetcher (`/audio-fetcher/`)
```bash
npm run dev      # Watch mode build with tsup
npm run start    # Build and run
```

## Technology Stack

- **Backend**: Go 1.24.3, PocketBase v0.28.2, SQLite
- **Frontend**: Preact 10.25.3, Vite 6.0.4, TailwindCSS 4.1.8, TypeScript
- **Audio Processing**: Node.js, puppeteer-stream (for YouTube extraction)
- **Database**: SQLite via PocketBase with auto-migrations

## Database Schema

### `sermons` Collection
- `id` (string, 15 chars, primary key)
- `title` (text, optional)
- `audio_file_path` (text, hidden field)
- `date_given` (date, optional)
- Auto-generated `created` and `updated` timestamps

PocketBase provides instant REST API at `/api/collections/sermons/records` and admin UI.

## Key Architecture Details

- **PocketBase app** configured in `api/cmd/main.go` with custom name "Sermon Analysis"
- **Auto-migrations** enabled - database schema changes via migration files in `api/migrations/`
- **Go workspace** setup allows clean module separation while sharing dependencies
- **Preact + preact-iso** for lightweight React-like experience with client-side routing
- **TailwindCSS v4** with Vite plugin for optimized styling. Find theme colors in `ui/src/style.css`. All styling uses tailwind classes.
- **AI analysis interface** defined in `api/internal/ai/analyze.go` but not yet implemented

## Current Implementation Status

- ✅ PocketBase backend with sermons collection and migrations
- ✅ Basic Preact frontend with routing and TailwindCSS
- ✅ Development tooling and hot reload setup
- 🔄 AI analysis functionality (interface exists, implementation needed)
- 🔄 Audio fetcher integration (puppeteer-stream logic exists but not connected)
- 🔄 Frontend sermon management UI