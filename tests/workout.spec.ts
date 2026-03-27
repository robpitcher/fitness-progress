import { test, expect, type Page } from '@playwright/test'

const SUPABASE_URL = 'https://test-placeholder.supabase.co'
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001'

function todayDateString(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 86400,
  expires_at: Math.floor(Date.now() / 1000) + 86400,
  token_type: 'bearer',
  user: {
    id: MOCK_USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
  },
}

const mockProfile = {
  id: MOCK_USER_ID,
  display_name: 'Test User',
  created_at: '2024-01-01T00:00:00Z',
}

const mockWorkout = {
  id: '00000000-0000-0000-0000-000000000010',
  user_id: MOCK_USER_ID,
  date: todayDateString(),
  started_at: new Date().toISOString(),
  completed_at: null,
  notes: null,
}

const mockExercises = [
  {
    id: 'ex-001',
    name: 'Bench Press',
    category: 'Chest',
    user_id: null,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-002',
    name: 'Squat',
    category: 'Legs',
    user_id: null,
    created_at: '2024-01-01T00:00:00Z',
  },
]

/**
 * Mock all Supabase API requests and inject an auth session into localStorage.
 * Set `hasWorkout` to true to simulate an already-started workout.
 */
async function setupSupabaseMocks(
  page: Page,
  options: { hasWorkout?: boolean } = {},
) {
  const { hasWorkout = false } = options

  // Inject auth session into localStorage before any page script runs
  await page.addInitScript(
    ({ session }) => {
      localStorage.setItem(
        'sb-test-placeholder-auth-token',
        JSON.stringify(session),
      )
    },
    { session: mockSession },
  )

  // Auth endpoints — return the mock user for any auth call
  await page.route(`${SUPABASE_URL}/auth/v1/**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: mockSession.user }),
    })
  })

  // Profiles — single object response for .single() queries
  await page.route(`${SUPABASE_URL}/rest/v1/profiles*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockProfile),
    })
  })

  // Workouts — GET returns empty or with workout; POST creates a workout
  let workoutCreated = hasWorkout
  await page.route(`${SUPABASE_URL}/rest/v1/workouts*`, (route) => {
    const method = route.request().method()
    if (method === 'POST') {
      workoutCreated = true
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockWorkout),
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(workoutCreated ? [mockWorkout] : []),
      })
    }
  })

  // Workout exercises — always empty for these tests
  await page.route(`${SUPABASE_URL}/rest/v1/workout_exercises*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  // Exercises — return mock library exercises
  await page.route(`${SUPABASE_URL}/rest/v1/exercises*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockExercises),
    })
  })
}

test.describe('Workout Page', () => {
  test('workout page renders with heading and greeting', async ({ page }) => {
    await setupSupabaseMocks(page, { hasWorkout: false })
    await page.goto('/workout')

    await expect(
      page.getByRole('heading', { name: 'Start a Workout' }),
    ).toBeVisible()
    await expect(page.getByText('Ready to train, Test User?')).toBeVisible()
  })

  test('Start Workout button is visible and enabled', async ({ page }) => {
    await setupSupabaseMocks(page, { hasWorkout: false })
    await page.goto('/workout')

    const startButton = page.getByRole('button', { name: 'Start Workout' })
    await expect(startButton).toBeVisible()
    await expect(startButton).toBeEnabled()
  })

  test('starting a workout shows the workout session UI', async ({ page }) => {
    await setupSupabaseMocks(page, { hasWorkout: false })
    await page.goto('/workout')

    const startButton = page.getByRole('button', { name: 'Start Workout' })
    await expect(startButton).toBeVisible()
    await startButton.click()

    // Active workout session heading
    await expect(
      page.getByRole('heading', { name: /Today.*Workout/ }),
    ).toBeVisible()
    // Empty exercise list prompt
    await expect(page.getByText(/No exercises yet/)).toBeVisible()
    // Add Exercise button available
    await expect(
      page.getByRole('button', { name: 'Add Exercise' }),
    ).toBeVisible()
  })

  test('Add Exercise button opens the exercise picker modal', async ({
    page,
  }) => {
    await setupSupabaseMocks(page, { hasWorkout: true })
    await page.goto('/workout')

    // Wait for active workout UI
    await expect(
      page.getByRole('heading', { name: /Today.*Workout/ }),
    ).toBeVisible()

    // Open exercise picker
    await page.getByRole('button', { name: 'Add Exercise' }).click()

    const modal = page.locator(
      '[role="dialog"][aria-label="Exercise picker"]',
    )
    await expect(modal).toBeVisible()

    // Modal header
    await expect(modal.getByText('Add Exercise')).toBeVisible()
    // Search input
    await expect(
      modal.locator('input[placeholder="Search exercises…"]'),
    ).toBeVisible()
    // Mock exercises rendered
    await expect(modal.getByText('Bench Press')).toBeVisible()
    await expect(modal.getByText('Squat')).toBeVisible()
  })
})

test.describe('Past Workout Creation', () => {
  test('creating a workout for a past date sets the correct date', async ({
    page,
  }) => {
    const pastDate = '2026-03-15'
    let capturedWorkout: { date: string; started_at: string } | null = null

    await page.addInitScript(
      ({ session }) => {
        localStorage.setItem(
          'sb-test-placeholder-auth-token',
          JSON.stringify(session),
        )
      },
      { session: mockSession },
    )

    await page.route(`${SUPABASE_URL}/auth/v1/**`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: mockSession.user }),
      })
    })

    await page.route(`${SUPABASE_URL}/rest/v1/profiles*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProfile),
      })
    })

    await page.route(`${SUPABASE_URL}/rest/v1/workouts*`, async (route) => {
      const method = route.request().method()
      if (method === 'POST') {
        const postData = route.request().postDataJSON()
        capturedWorkout = postData
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockWorkout,
            date: postData.date,
            started_at: postData.started_at,
          }),
        })
      } else {
        // Check if workout exists for the date
        const url = route.request().url()
        const isQueryingPastDate = url.includes(`date=eq.${pastDate}`)
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            isQueryingPastDate && capturedWorkout ? [capturedWorkout] : [],
          ),
        })
      }
    })

    await page.route(`${SUPABASE_URL}/rest/v1/workout_exercises*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    // Navigate to the past date workout page
    await page.goto(`/workout/${pastDate}`)

    // Should show "No Workout Found" with Start Workout button
    await expect(
      page.getByRole('heading', { name: 'No Workout Found' }),
    ).toBeVisible()
    await expect(page.getByText(/No workout was logged on/)).toBeVisible()

    // Click Start Workout
    const startButton = page.getByRole('button', { name: 'Start Workout' })
    await expect(startButton).toBeVisible()
    await startButton.click()

    // Wait for the workout to be created
    await page.waitForTimeout(500)

    // Verify the workout was created with the correct date
    expect(capturedWorkout).not.toBeNull()
    expect(capturedWorkout.date).toBe(pastDate)
    expect(capturedWorkout.started_at).toBe(`${pastDate}T00:00:00.000Z`)
  })

  test('past workout page shows the selected date clearly', async ({
    page,
  }) => {
    const pastDate = '2026-03-15'

    await setupSupabaseMocks(page, { hasWorkout: false })
    await page.goto(`/workout/${pastDate}`)

    // Should show formatted date
    await expect(page.getByText(/March 15/)).toBeVisible()
  })

  test('cannot create workout for future date from calendar', async ({
    page,
  }) => {
    await setupSupabaseMocks(page, { hasWorkout: false })
    await page.goto('/calendar')

    // Navigate to next month to find a future date
    await page.getByRole('button', { name: 'Next month' }).click()
    await page.waitForTimeout(200)

    // Click on day 15 of next month
    const dayButton = page
      .locator('button')
      .filter({ hasText: /^15$/ })
      .first()
    await dayButton.click()

    // Should show "Cannot create workouts for future dates" message
    await expect(
      page.getByText(/Cannot create workouts for future dates/),
    ).toBeVisible()

    // Start workout button should not be visible
    await expect(
      page.getByRole('button', { name: 'Start a workout' }),
    ).not.toBeVisible()
  })
})
