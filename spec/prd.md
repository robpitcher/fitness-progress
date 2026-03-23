# Product Requirements Document: Fitness Progress Tracker

**Version:** 1.0
**Date:** March 23, 2026
**Status:** Draft

---

## 1. Overview

A mobile-optimized fitness tracking web application that allows users to log workout data in real time, reference previous performance for progressive overload, track body weight, and visualize progress over time through charts.

### 1.1 Problem Statement

Gym-goers need a quick, frictionless way to record exercises, sets, reps, and weight during workouts — and to reference what they did last time so they can ensure they're progressing. Existing solutions are often bloated, slow, or not optimized for one-handed mobile use mid-workout.

### 1.2 Goals

- Provide a fast, intuitive workout logging experience optimized for mobile phones
- Surface previous performance inline while logging so users can track progression
- Track body weight over time as a separate metric
- Visualize exercise and body weight trends via charts
- Keep the UI simple, sleek, and modern with dark/light theme support

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18+ (Vite), TypeScript, Tailwind CSS |
| Routing | React Router v6 |
| Server State | TanStack Query (React Query) |
| UI State | React Context |
| Charts | Recharts |
| Icons | Lucide React |
| Backend / Database | Supabase Cloud (PostgreSQL + Auth + REST API) |
| Hosting | Azure Static Web Apps |

---

## 3. User Stories

### Authentication
| ID | Story | Priority |
|----|-------|----------|
| US-1 | As a new user, I can sign up with email and password so my data is saved to my account. | P0 |
| US-2 | As a returning user, I can log in with email and password to access my data. | P0 |
| US-3 | As a logged-in user, I can sign out. | P0 |

### Workout Logging
| ID | Story | Priority |
|----|-------|----------|
| US-4 | As a user, I can start a new workout session for today. | P0 |
| US-5 | As a user, I can add exercises to my workout by searching a pre-populated library or creating a custom exercise. | P0 |
| US-6 | As a user, I can enter the number of sets, reps per set, and weight (optional) for each exercise. | P0 |
| US-7 | As a user, I can see what I did last time for each exercise (inline previous performance) while logging, so I know what to aim for. | P0 |
| US-8 | As a user, I can save/complete my workout session. | P0 |
| US-9 | As a user, I can remove an exercise or set from my current workout before saving. | P1 |

### Calendar
| ID | Story | Priority |
|----|-------|----------|
| US-10 | As a user, I can view a monthly calendar with visual indicators on dates I worked out. | P0 |
| US-11 | As a user, I can tap a date on the calendar to view that day's workout details. | P0 |
| US-12 | As a user, I can edit a previous workout from the calendar detail view. | P1 |

### Body Weight Tracking
| ID | Story | Priority |
|----|-------|----------|
| US-13 | As a user, I can log my body weight for a given date. | P0 |
| US-14 | As a user, I can view my body weight history as a scrollable list. | P0 |
| US-15 | As a user, I can edit or delete a previous body weight entry. | P1 |

### Progress Charts
| ID | Story | Priority |
|----|-------|----------|
| US-16 | As a user, I can select an exercise and view a line chart of my weight/reps progression over time. | P0 |
| US-17 | As a user, I can view a line chart of my body weight trend over time. | P0 |
| US-18 | As a user, I can filter charts by time range (1 month, 3 months, 6 months, 1 year, all time). | P1 |

### Theme & Settings
| ID | Story | Priority |
|----|-------|----------|
| US-19 | As a user, the app automatically detects my OS light/dark preference and applies the matching theme. | P0 |
| US-20 | As a user, I can manually toggle between light, dark, and system theme modes. | P0 |
| US-21 | As a user, I can update my display name in settings. | P2 |

---

## 4. Screens & Navigation

The app uses a **fixed bottom tab bar** with 5 tabs for thumb-friendly mobile navigation.

| Tab | Icon | Screen | Description |
|-----|------|--------|-------------|
| Workout | Dumbbell | Active Workout | Start/resume today's session; add exercises and log sets |
| Calendar | Calendar | Calendar View | Month grid with workout indicators; tap date to drill in |
| Weight | Scale | Body Weight Log | Log today's weight; view/edit history |
| Charts | TrendingUp | Progress Charts | Exercise progression and body weight trend charts |
| Profile | User | Settings & Profile | Display name, theme toggle, sign out |

### Screen Flows

#### Workout Flow
1. User opens app → lands on **Workout** tab
2. If no workout exists for today → shows "Start Workout" button
3. User taps "Start Workout" → empty workout form appears
4. User taps "Add Exercise" → searchable exercise picker opens (library + custom)
5. User selects exercise → exercise card appears with inline previous performance ("Last: 3×10 @ 135 lbs")
6. User adds sets (reps + optional weight) via large touch-friendly inputs
7. User can add more exercises or finish → taps "Complete Workout"
8. Workout saved; summary displayed

#### Calendar Flow
1. User taps **Calendar** tab → month grid with dots on workout dates
2. User taps a date with a dot → workout detail view for that date
3. User can view exercises/sets/reps/weight or tap "Edit" to modify

#### Body Weight Flow
1. User taps **Weight** tab → today's date pre-filled, weight input field
2. User enters weight → taps "Save"
3. Below the entry form: scrollable history list (most recent first)
4. Tap an entry to edit or delete

---

## 5. Data Model

### 5.1 `profiles`
Extends Supabase `auth.users`.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, FK → auth.users.id |
| `display_name` | text | nullable |
| `created_at` | timestamptz | default now() |

### 5.2 `exercises`
Pre-populated library (~30 common exercises) plus user-created custom exercises.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default gen_random_uuid() |
| `name` | text | not null |
| `category` | text | nullable (for future filtering) |
| `user_id` | uuid | nullable, FK → profiles.id (null = global) |
| `created_at` | timestamptz | default now() |

- Unique constraint on (`user_id`, `name`)

### 5.3 `workouts`
One record per workout session.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default gen_random_uuid() |
| `user_id` | uuid | FK → profiles.id, not null |
| `date` | date | not null |
| `started_at` | timestamptz | default now() |
| `completed_at` | timestamptz | nullable |
| `notes` | text | nullable |
| `created_at` | timestamptz | default now() |

- Index on (`user_id`, `date`)

### 5.4 `workout_exercises`
Exercises within a workout, ordered.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default gen_random_uuid() |
| `workout_id` | uuid | FK → workouts.id, ON DELETE CASCADE |
| `exercise_id` | uuid | FK → exercises.id, not null |
| `order` | int | not null |
| `created_at` | timestamptz | default now() |

### 5.5 `sets`
Individual sets within a workout exercise.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default gen_random_uuid() |
| `workout_exercise_id` | uuid | FK → workout_exercises.id, ON DELETE CASCADE |
| `set_number` | int | not null |
| `reps` | int | not null |
| `weight` | decimal | nullable (optional for bodyweight exercises) |
| `created_at` | timestamptz | default now() |

### 5.6 `body_weights`
Daily body weight log.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default gen_random_uuid() |
| `user_id` | uuid | FK → profiles.id, not null |
| `date` | date | not null |
| `weight` | decimal | not null (lbs) |
| `created_at` | timestamptz | default now() |

- Unique constraint on (`user_id`, `date`)

### 5.7 Row-Level Security (RLS)

All tables enforce RLS:
- **profiles**: Users can read/update only their own row.
- **exercises**: Users can read all rows where `user_id IS NULL` (global) OR `user_id = auth.uid()`. Users can insert/update/delete only rows where `user_id = auth.uid()`.
- **workouts, workout_exercises, sets**: Users can CRUD only rows belonging to their own `user_id` (joined through `workouts.user_id`).
- **body_weights**: Users can CRUD only their own rows.

### 5.8 Database Trigger

A trigger on `auth.users` insert auto-creates a corresponding `profiles` row.

---

## 6. UI/UX Guidelines

### Mobile-First Design
- Optimized for 375px–430px viewport widths
- Touch targets ≥ 44px
- Large input fields for mid-workout data entry
- Bottom tab bar fixed to viewport bottom with safe area inset padding

### Visual Design
- Clean, modern aesthetic with rounded cards and subtle shadows
- System font stack or Inter
- Consistent spacing scale via Tailwind
- Muted/secondary text for inline previous performance data

### Theme
- **Auto-detect**: reads `prefers-color-scheme` media query on first load
- **Manual override**: light / dark / system toggle in Profile tab
- **Implementation**: Tailwind `class` strategy for dark mode; preference stored in localStorage

### Key UI Patterns
- **Inline previous performance**: Below each exercise header, muted text shows "Last: 3×10 @ 135 lbs" from the most recent session containing that exercise
- **Exercise search**: Autocomplete/filter dropdown over the pre-populated library; "Add Custom Exercise" option at bottom
- **Set entry**: Each set is a row with set number (auto-incremented), reps input, and weight input (optional); +/- stepper buttons or direct numeric input
- **Calendar dots**: Small colored dots on calendar dates that have workouts logged

---

## 7. Seed Data — Exercise Library

The following ~30 exercises will be pre-populated (all with `user_id = NULL`):

**Chest**: Bench Press, Incline Bench Press, Dumbbell Flyes, Push-Up, Cable Crossover
**Back**: Barbell Row, Dumbbell Row, Pull-Up, Lat Pulldown, Seated Cable Row, Deadlift
**Shoulders**: Overhead Press, Lateral Raise, Front Raise, Face Pull, Rear Delt Fly
**Legs**: Squat, Leg Press, Romanian Deadlift, Leg Extension, Leg Curl, Calf Raise, Lunge
**Arms**: Bicep Curl, Hammer Curl, Tricep Pushdown, Tricep Dip, Skull Crusher
**Core**: Plank, Hanging Leg Raise, Cable Crunch

---

## 8. Non-Functional Requirements

| Requirement | Specification |
|-------------|--------------|
| Units | Imperial (lbs) only |
| Auth | Email/password via Supabase Auth |
| Hosting | Azure Static Web Apps |
| Offline | Not supported (standard web app) |
| PWA | Not in scope |
| Browser Support | Modern mobile browsers (Chrome, Safari, Firefox) |
| Accessibility | Semantic HTML, proper label associations, sufficient color contrast |

---

## 9. Out of Scope (V1)

- Workout templates / named routines
- Metric (kg) unit support
- OAuth providers (Google, GitHub, etc.)
- PWA / offline support
- Rest timer
- Social features / sharing
- Data export (CSV)
- Exercise filtering by muscle group (column exists for future use)
- Notifications / reminders

---

## 10. Future Considerations (V2+)

1. **Workout templates** — Save and reuse named routines (e.g., "Push Day", "Leg Day")
2. **OAuth login** — Google and/or Apple sign-in
3. **Metric unit toggle** — Support kg with user preference
4. **Exercise categories UI** — Filter exercise library by muscle group
5. **Data export** — CSV download of all workout and body weight data
6. **PWA support** — Installable, offline-capable
7. **Rest timer** — Built-in configurable rest timer between sets