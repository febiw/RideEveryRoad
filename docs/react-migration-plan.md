# Angular → Next.js React Migration Plan

## Overview
Migrate 'Ride Every Road' from Angular 13 + Material to Next.js 14 (App Router) + Tailwind CSS.

## Current App Summary
- **Purpose**: Visualise all Strava activities on a Google Map
- **Auth flow**: Strava OAuth 2.0 → encrypted cookie/localStorage caching
- **Pages**: Landing (`/`), Exchange Token (`/exchange_token`), Map (`/map`)
- **Services**: Strava API, Crypto (AES), Cookie, LocalStorage
- **UI**: Material Design dialogs (feedback, spinner, strava info)
- **Deployment**: GitHub Actions → Azure Web App

---

## Migration Tasks

### Phase 1: Project Setup
- [x] Create migration plan
- [x] Initialise Next.js 14 project (App Router, TypeScript, Tailwind)
- [x] Configure environment variables (.env.local)
- [x] Copy static assets (SVGs, images, favicon)

### Phase 2: Core Utilities
- [x] Create crypto utility (AES encrypt/decrypt with crypto-js)
- [x] Create cookie utility (encrypted read/write/check)
- [x] Create localStorage utility (encrypted read/write/delete)

### Phase 3: Strava Service
- [x] Create Strava API service (fetch-based, no Angular HttpClient)
  - OAuth URL generation
  - Token exchange (authorization_code + refresh_token)
  - Paginated activity fetching
  - Activity fetching since date
- [x] Server-side API route for token exchange (keeps client_secret secure)

### Phase 4: Pages & Components
- [x] Layout component (header with title, feedback button, footer)
- [x] Landing page (`/`) — Connect with Strava button, description, example image
- [x] Exchange token page (`/exchange_token`) — OAuth callback, scope validation, redirect
- [x] Map page (`/map`) — Google Maps with polyline rendering, auto-bounds
- [x] Feedback dialog (modal with form → Formspree)
- [x] Strava info dialog (brand disclaimer modal)
- [x] Loading spinner component

### Phase 5: Styling
- [x] Global styles (Tailwind + custom CSS matching current design)
- [x] Responsive layout

### Phase 6: Deployment
- [x] Update GitHub Actions workflow for Next.js build
- [x] Azure Web App standalone deployment

---

## Progress Log
- **Start**: Analysed existing Angular codebase
- **Phase 1-6**: Complete — all tasks migrated successfully
- **Build**: ✅ Compiles cleanly with `next build`
