# 💪 Fitness Progress Tracker

A mobile-optimized fitness tracking web app for logging workouts, tracking body weight, and visualizing progress over time. Track exercises, monitor weight trends, and celebrate your fitness journey.

## Features

- **Workout Logging** — Log exercises with sets, reps, weight, duration, and notes
- **Exercise Library** — 30+ pre-seeded exercises organized by category (Chest, Back, Shoulders, Legs, Arms, Core) with custom exercise creation
- **Body Weight Tracking** — Daily measurements with add, edit, and delete functionality
- **Progress Charts** — Visualize body weight trends and exercise-specific progress (max weight over time)
- **Time Range Filtering** — View data for 7 days, 30 days, 90 days, or all time
- **Calendar View** — Monthly calendar showing workout history; click to view or edit past workouts
- **Theme Support** — Dark, light, and system theme with localStorage persistence
- **User Profiles** — Custom display names and account settings
- **Mobile-First Design** — Bottom tab navigation and touch-friendly interface

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS 4, Lucide React (icons)
- **Charts:** Recharts
- **Routing & Data:** React Router v6, TanStack React Query v5
- **Backend:** Supabase (PostgreSQL + Auth + REST API)
- **Testing:** Playwright (E2E)
- **Deployment:** Azure Static Web Apps

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm
- A Supabase project ([create one free](https://supabase.com))

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fitness-progress
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Supabase credentials to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Development Server

Start the dev server at `localhost:5173`:

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Database Setup

The project uses Supabase with PostgreSQL. All tables have row-level security enabled:

- **profiles** — User information and settings
- **exercises** — Global exercise library (~30 pre-seeded)
- **workouts** — Workout sessions (date, notes, duration)
- **workout_exercises** — Exercise instances in workouts
- **sets** — Individual sets with reps and weight
- **body_weights** — Daily weight measurements

Run migrations on your Supabase project (see `supabase/migrations/`).

## Project Structure

```
src/
├── pages/          # Page components (auth, workout, calendar, charts, etc.)
├── components/     # Reusable UI components and providers
├── hooks/          # Custom hooks for data fetching and state
├── lib/            # Supabase client, contexts, and utilities
├── types/          # TypeScript types matching the database schema
└── assets/         # Static assets

supabase/
└── migrations/     # Database schema, RLS policies, and seed data

tests/              # Playwright E2E test suite
```

## Available Routes

| Route | Purpose |
|-------|---------|
| `/login` | Email/password authentication |
| `/signup` | New user registration |
| `/` | Redirects to `/workout` |
| `/workout` | Log today's workout |
| `/workout/:date` | View/edit past workout |
| `/calendar` | Monthly calendar with workout history |
| `/weight` | Body weight entries |
| `/charts` | Progress visualization |
| `/profile` | User settings, theme, sign out |

## Testing

Run Playwright E2E tests:

```bash
npx playwright test
```

Tests are in the `tests/` directory and mock Supabase endpoints (no live backend required).

## Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Deployment

The project is deployed to **Azure Static Web Apps** via GitHub Actions CI/CD:

1. Supabase URL and anon key are provided via GitHub Secrets
2. On push to main, the workflow builds the project and deploys to Azure
3. Environment variables are injected at build time

## License

MIT License © 2026 Rob Pitcher. See [LICENSE](LICENSE) for details.
