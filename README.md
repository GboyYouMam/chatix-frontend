# chatix-frontend

The web client of **Chatix**, a multi-user, imageboard-style chat with an edge, trolling attitude. The whole UI is in English, has a dark `#09090b` + hot pink `#fa4d98` look, and works on phones.

The API lives in a separate repo: [chatix-backend](https://github.com/GboyYouMam/chatix-backend).

## Stack

| Layer | Choice |
| --- | --- |
| Language | TypeScript |
| UI | React 19, CSS Modules |
| Build | Vite 8 |
| Routing | React Router 7 |
| Server state | TanStack Query 5 (one `queryKeys` factory) |
| Client state | Zustand 5 (session, synced across tabs) |
| Forms | react-hook-form + zod |
| Realtime | socket.io-client 4 |
| HTTP | axios with auth and 401 interceptors |
| Tests | `node --test` for pure helpers |

## What's inside

- **Lobby and rooms.**
  - Public and private rooms; the owner's perk toolbar (aura tax, room boost) sits in the room header.
  - Seven room themes, and every accent inside a room follows its theme.
  - Live replies, attachments and quote previews.
- **Profiles.**
  - A profile card, side banners, and the user's own rooms as a "my rooms" tab.
  - 13 widgets, including a Spotify/SoundCloud player, an aura sparkline, a paginated guestbook and a wanted poster.
  - Achievements as small SVG US-military-style medals.
- **Fight club.** A hidden lobby and a QTE duel; on touch devices an on-screen key pad appears.
- **Laryok shop.** Cosmetics, troll items and themes, with live previews.
- **Leaderboard.** Weekly boards for most aura, most in debt and most mogged.
- **Admin panel.** A dashboard, user dossiers, room moderation and an audit trail; updates arrive live over the `/admin` socket namespace.
- **Ban screen.** A banned user gets a full-screen joke screen and nothing else.

## Layout

```
src/
  api/         typed API clients per domain
  pages/       route screens (Rooms, Profile, Shop, Fight-Club, Admin, ...)
  components/  feature components and the shared ui/ primitives (Modal, ...)
  hooks/       react-query hooks per domain
  store/       zustand session store
  themes/      room theme tokens
  lib/         query keys, socket factory, notifications
tests/         node --test suites for pure helpers
```

## Getting started

Requirements: Node.js 24+, and the backend running on `:3000`.

```bash
cp .env.example .env    # VITE_API_URL=http://localhost:3000
npm ci
npm run dev             # http://localhost:5173
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | type-check and production build into `dist/` |
| `npm run preview` | serve the production build locally |
| `npm test` | unit tests for pure helpers |
| `npm run lint` | ESLint |
