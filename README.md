<<<<<<< HEAD
# betteru-take-home-assessment
Frontend Engineer take home assessment for BetterU
=======
# BetterU Assessment — LMS Dashboard (wireframe)

A wireframe of a Learning Management System dashboard: browse a course
catalog, search and filter it, work through lesson modules, and track
completion progress in real time. Built for a frontend take-home.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4**
- **shadcn/ui** primitives (hand-written in `src/components/ui` — see
  [Note on shadcn/ui](#note-on-shadcnui) below)
- **Clerk** (`@clerk/nextjs`) for authentication
- **lucide-react** for icons

No backend or database — course/lesson content is an in-memory mock
dataset, and lesson-completion progress is stored client-side. Both are
written as swappable layers (details below) so wiring up a real API is a
localized change, not a rewrite.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Then fill in your Clerk keys — `.env.local` should end up looking like
this (the four URL overrides are already defaulted to match this app's
routes, so you don't need to touch those):

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZW5hYmxpbmctdGFycG9uLTk0Ny5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_jwviqKe03KPCagsayNWVAUigtEJ1Jr1cnPIE9z6Jei

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

| Variable                                          | Required | Notes                                                                                                  |
| ------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`               | Yes      | From [dashboard.clerk.com](https://dashboard.clerk.com) → your app → API Keys. Exposed to the browser. |
| `CLERK_SECRET_KEY`                                | Yes      | Same page as above. Server-only — never expose this one.                                               |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`                   | No       | Defaults to `/sign-in`, which is already where this app mounts `<SignIn />`.                           |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`                   | No       | Defaults to `/sign-up`, which is already where this app mounts `<SignUp />`.                           |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | No       | Defaults to `/dashboard` — where a user lands after signing in.                                        |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | No       | Defaults to `/dashboard` — where a user lands after signing up.                                        |

A `.env.local` with **placeholder** keys is already checked in locally so
`npm run build` / `npm run dev` don't crash out of the box — replace them
with real keys before signing in, or the Clerk widgets will fail to load
(they call out to Clerk's hosted frontend API and fail with a
`host_invalid`-style error otherwise). `.env*` is gitignored, so your real
keys never get committed.

### 3. Dev commands

| Command         | What it does                                                    |
| --------------- | --------------------------------------------------------------- |
| `npm run dev`   | Starts the Turbopack dev server at <http://localhost:3000>.     |
| `npm run build` | Production build (`next build`).                                |
| `npm run start` | Serves the production build (`next start`) — run `build` first. |
| `npm run lint`  | ESLint over the project.                                        |

There's no separate typecheck script; `npx tsc --noEmit` covers that.

Once running: the marketing page (`/`) is public. Everything under
`/dashboard` and `/courses` requires signing in and redirects to
`/sign-in` otherwise.

## Architecture

### Routes (`src/app`)

| Route                                    | Access    | Renders                                                        |
| ---------------------------------------- | --------- | -------------------------------------------------------------- |
| `/`                                      | Public    | Marketing page (`app/page.tsx`)                                |
| `/sign-in/[[...sign-in]]`                | Public    | Clerk `<SignIn />` catch-all                                   |
| `/sign-up/[[...sign-up]]`                | Public    | Clerk `<SignUp />` catch-all                                   |
| `/dashboard`                             | Protected | `DashboardOverview` — stats, continue learning, recently added |
| `/courses`                               | Protected | `CourseCatalog` — search, filters, course grid                 |
| `/courses/[courseId]`                    | Protected | `CourseDetail` — module/lesson checklist                       |
| `/courses/[courseId]/lessons/[lessonId]` | Protected | `LessonView` — mock video player + prev/next nav               |

`(app)` is a route group (`src/app/(app)/`) whose `layout.tsx` does a
resource-level `currentUser()` check + redirect and wraps its children in
`ProgressProvider` + `AppShell`. `src/proxy.ts` (Next 16 renamed
`middleware.ts` → `proxy.ts`) runs `clerkMiddleware` and protects
`/dashboard(.*)` and `/courses(.*)` at the network edge, before a request
ever reaches a page — so auth is enforced twice, once by middleware and
once by the layout.

### Key components

- **Layout** (`src/components/layout/`) — `AppShell` composes a desktop
  `AppSidebar`, an `AppTopbar` (global search + `UserButton`), and
  `NavLinks`; a mobile nav `Sheet` covers small screens.
- **Courses** (`src/components/courses/`) — `CourseCatalog` (search +
  category/difficulty/completion filters), `CourseCard`, `CourseCover`
  (thumbnail with a category-gradient fallback), `CourseDetail` (the
  interactive module/lesson checklist), `LevelBadge`, `LessonView`,
  `LessonSidebar` (per-lesson outline/nav), `MockVideoPlayer` (simulated
  play/pause/seek, scaled to the lesson's duration).
- **Dashboard** (`src/components/dashboard/`) — `DashboardOverview`: stat
  tiles, a "continue learning" list, a "recently added" rail.
- **Providers** (`src/components/providers/`) — `ProgressProvider`, the
  context wrapper around the progress store (see Custom hooks below).
- **UI primitives** (`src/components/ui/`) — hand-written shadcn/ui-style
  components (`button`, `card`, `input`, `badge`, `progress`, `select`,
  `sheet`, `skeleton`, `avatar`, `dropdown-menu`, `tabs`, `separator`,
  `label`, `checkbox`) — see [Note on shadcn/ui](#note-on-shadcnui).

### Custom hooks

- **`useProgress()`** / **`useCourseProgress(course)`**
  (`src/components/providers/progress-provider.tsx`) — the app's main
  custom hook. Reads lesson-completion state via React's
  `useSyncExternalStore` from the external store in
  `src/lib/progress-store.ts`, namespaced per signed-in Clerk user id and
  persisted to `localStorage`. Exposes `isLessonComplete`, `toggleLesson`,
  `markComplete`/`markIncomplete`, and `getCourseProgress`. Every
  component that shows progress (course cards, the dashboard, the
  catalog's completion filter, the course-detail checklist, the sidebar)
  reads from this same store, so any change updates all of them
  immediately — no prop drilling or refetch.
- **`useDebouncedValue(value, delayMs)`** (`src/hooks/use-debounced-value.ts`)
  — small generic debounce hook. `CourseCatalog` uses it at 300ms so the
  search input stays instantly responsive while the actual re-filtering
  of the course grid waits until you stop typing.

### Data layer (`src/lib/`)

- `types.ts` — `Course`, `Module`, `Lesson`, `Difficulty`, `FlatLesson`.
- `data/courses.json` + `data/courses.ts` — the dummy dataset (12 courses
  across 6 categories) and a thin pass-through mapper into the `Course`
  shape above.
- `courses.ts` — the data-access layer (`getCourses`, `getCourseById`,
  `getCategories`, `getLevels`), `async` and marked `"server-only"`,
  written the way it would look calling a real API or database so
  swapping the array for `fetch(...)` later doesn't touch any call site.
- `course-utils.ts` — pure helpers (`flattenLessons`, `totalLessonCount`,
  `formatMinutes`, `getInitials`, `getCategoryGradient`, …) safe to import
  from client components too.

## Deployment Notes

This app has no server of its own beyond Next.js — deploying it is mostly
about environment variables and Clerk configuration.

### Host environment variables

Set these in your host's project settings UI (e.g. Vercel → Project →
Settings → Environment Variables) — `.env*` is gitignored, so nothing here
is picked up from a committed file:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are
  **required**. Use your Clerk **Production** instance's keys
  (`pk_live_...` / `sk_live_...`) for a real deployed URL — Development
  instance keys (`pk_test_...` / `sk_test_...`) are meant for `localhost`
  and aren't a good fit for a public domain.
- Set the four `NEXT_PUBLIC_CLERK_..._URL` overrides explicitly too, even
  though they match Clerk's own defaults — don't rely on `.env.local.example`
  existing on the host.

### Clerk allowed origins

Clerk only accepts auth requests from origins it's been told about. Before
the first production deploy:

1. In the [Clerk Dashboard](https://dashboard.clerk.com), create or
   promote a **Production** instance for this app (separate from the
   Development instance used locally).
2. Under **Configure → Domains**, add the exact production domain (and
   any custom domain you attach later). This is the production
   equivalent of the `host_invalid` error this app can throw locally with
   placeholder keys — in production, an origin Clerk doesn't recognize
   fails the same way, just against your live domain instead of
   `localhost`.
3. If your host generates per-branch/per-PR preview URLs (e.g. Vercel
   preview deployments), those domains won't be pre-registered. Either
   keep preview deployments on the Development instance's keys (more
   permissive, works across arbitrary hosts with a dev-mode warning
   banner), or explicitly add each preview domain pattern under Domains
   if you want previews running against Production.
4. Under **Configure → Paths**, confirm Clerk's own sign-in/sign-up
   component paths and after-auth redirects agree with the
   `NEXT_PUBLIC_CLERK_..._URL` env vars set on the host — they should
   already match (`/sign-in`, `/sign-up`, `/dashboard`), but it's worth
   double-checking after switching instances.

### Other deploy-time config

- `next.config.ts` allowlists `images.unsplash.com` for `next/image`
  (that's where the sample course thumbnails live). If course thumbnails
  ever move to a different host, add it to `images.remotePatterns` and
  redeploy — this isn't an env var, so it requires a code change.

### Trade-offs

Due to time constraints of the project, there were a number of decisions I had to make to not implement and leave. There were as follows:

1. The video player was fully simulated and not a true video element. For the sake of getting a working model up and running for the assignment, I compressed the playback timer regardless of the actual duration listed in the dummy data so that I could show progress being made.
2. Of course there was no time to implement any automated testing throughout the code base so a lot of this implementation was done more or less expecting things to work as intended. In a real-world applcation there would be automated testing.
3. This was mentioned in the instructions, but of course in a perfect real-world setting the progress of the courses would not live in localStorage, but instead live in a backend so that progress would be able to sync across devices and/or browsers for the same account.
4. The search/filter function as it stands is client-side due to ease of use to show proof of concept for this assignment, but I would imagine that if I were to build an LMS meant for real user consumption, the function would be changed to server-side so that individual keystrokes would not register in the browser history.

### AI Usage

- AI tool used: Claude
- I typically like using the following prompts to help me with my development:
  1. Give me a "confidence rating" out of 100 of what was just created.


      - Typically this works quite well as I have found that this forces the AI tool to grade itself and allows me to dive deeper into whatever was created and see with my own eyes as to why Claude graded X compment an "85" as opposed to a rating that is 90+

  2. After asking for a revision, I asked "Tell me exactly which files/which lines were changed".


      - I found this particularly helpful again because I wanted to see what specifically was fixed/adjusted even though I was aware of what was changed. This allowed me to dive into the codebase to gain a fuller understanding of the actual changes rather than blindly trust Claude
- When first creating the wireframe for this LMS I noticed immediately that Claude had generated its own schema and actually based multiple files off that schema it had created. It took some digging around and looking at all the different files and components for me to realize where it deviated from the schema that was provided and I had to double back and change the schema itself along with the downstream changes that resulted in said change.

### Future Work

Some stretch fetaures I thought of implementing if I had more time:

1. A reset progress button somewhere within the course, perhaps only usable when the course is completed.
2. A "related courses" widget when clicking onto an individual course (i.e. showing other React courses on the sidebar)
3. Dark mode toggle
>>>>>>> 149e754... feat: committing all files
