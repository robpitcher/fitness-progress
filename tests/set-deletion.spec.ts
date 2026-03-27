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

const mockExercise = {
  id: 'ex-001',
  name: 'Bench Press',
  category: 'Chest',
  user_id: null,
  created_at: '2024-01-01T00:00:00Z',
}

const mockWorkoutExercise = {
  id: 'we-001',
  workout_id: mockWorkout.id,
  exercise_id: mockExercise.id,
  order: 1,
  created_at: '2024-01-01T00:00:00Z',
  exercises: mockExercise,
}

const mockSets = [
  {
    id: 'set-001',
    workout_exercise_id: 'we-001',
    set_number: 1,
    reps: 10,
    weight: 135,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'set-002',
    workout_exercise_id: 'we-001',
    set_number: 2,
    reps: 10,
    weight: 135,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'set-003',
    workout_exercise_id: 'we-001',
    set_number: 3,
    reps: 8,
    weight: 145,
    created_at: '2024-01-01T00:00:00Z',
  },
]

/**
 * Mock Supabase API requests for set deletion tests.
 */
async function setupSupabaseMocksWithSets(page: Page) {
  // Track state of sets and workout_exercises
  let currentSets = [...mockSets]
  let currentWorkoutExercises = [mockWorkoutExercise]

  // Inject auth session into localStorage
  await page.addInitScript(
    ({ session }) => {
      localStorage.setItem(
        'sb-test-placeholder-auth-token',
        JSON.stringify(session),
      )
    },
    { session: mockSession },
  )

  // Auth endpoints
  await page.route(`${SUPABASE_URL}/auth/v1/**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: mockSession.user }),
    })
  })

  // Profiles
  await page.route(`${SUPABASE_URL}/rest/v1/profiles*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockProfile),
    })
  })

  // Workouts — return the mock workout
  await page.route(`${SUPABASE_URL}/rest/v1/workouts*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mockWorkout]),
    })
  })

  // Workout exercises
  await page.route(`${SUPABASE_URL}/rest/v1/workout_exercises*`, (route) => {
    const method = route.request().method()
    const url = route.request().url()

    if (method === 'DELETE') {
      // Handle DELETE request
      currentWorkoutExercises = []
      route.fulfill({
        status: 204,
        contentType: 'application/json',
        body: '',
      })
    } else if (method === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentWorkoutExercises),
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentWorkoutExercises),
      })
    }
  })

  // Sets
  await page.route(`${SUPABASE_URL}/rest/v1/sets*`, (route) => {
    const method = route.request().method()
    const url = route.request().url()

    if (method === 'DELETE') {
      // Extract the ID from the query parameters
      const urlObj = new URL(url)
      const eqParam = urlObj.searchParams.get('id')
      if (eqParam && eqParam.startsWith('eq.')) {
        const setId = eqParam.substring(3)
        currentSets = currentSets.filter((s) => s.id !== setId)
      }
      route.fulfill({
        status: 204,
        contentType: 'application/json',
        body: '',
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentSets),
      })
    }
  })

  // Exercises
  await page.route(`${SUPABASE_URL}/rest/v1/exercises*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mockExercise]),
    })
  })
}

test.describe('Set Deletion', () => {
  test('clicking delete button shows confirmation dialog', async ({ page }) => {
    await setupSupabaseMocksWithSets(page)
    await page.goto('/workout')

    // Wait for workout to load
    await expect(
      page.getByRole('heading', { name: /Today.*Workout/ }),
    ).toBeVisible()

    // Wait for sets to appear - look for the delete button
    await expect(
      page.getByRole('button', { name: 'Delete set 1' }),
    ).toBeVisible()

    // Click delete button on first set
    await page.getByRole('button', { name: 'Delete set 1' }).click()

    // Confirmation dialog should appear
    await expect(
      page.getByRole('heading', { name: 'Delete Set' }),
    ).toBeVisible()
    await expect(
      page.getByText('Delete Set 1 of Bench Press? This cannot be undone.'),
    ).toBeVisible()

    // Dialog should have Cancel and Delete buttons
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Delete', exact: true }),
    ).toBeVisible()
  })

  test('clicking cancel dismisses dialog without deleting', async ({
    page,
  }) => {
    await setupSupabaseMocksWithSets(page)
    await page.goto('/workout')

    // Wait for workout to load
    await expect(
      page.getByRole('heading', { name: /Today.*Workout/ }),
    ).toBeVisible()

    // Wait for sets to appear
    await expect(
      page.getByRole('button', { name: 'Delete set 1' }),
    ).toBeVisible()

    // Count initial delete buttons (one per set)
    const initialDeleteButtons = await page
      .getByRole('button', { name: /Delete set \d+/ })
      .count()
    expect(initialDeleteButtons).toBe(3)

    // Click delete button
    await page.getByRole('button', { name: 'Delete set 1' }).click()

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Dialog should be dismissed
    await expect(
      page.getByRole('heading', { name: 'Delete Set' }),
    ).not.toBeVisible()

    // All sets should still be there
    const finalDeleteButtons = await page
      .getByRole('button', { name: /Delete set \d+/ })
      .count()
    expect(finalDeleteButtons).toBe(3)
  })

  test('clicking backdrop dismisses dialog without deleting', async ({
    page,
  }) => {
    await setupSupabaseMocksWithSets(page)
    await page.goto('/workout')

    // Wait for workout to load
    await expect(
      page.getByRole('heading', { name: /Today.*Workout/ }),
    ).toBeVisible()

    // Wait for sets to appear
    await expect(
      page.getByRole('button', { name: 'Delete set 1' }),
    ).toBeVisible()

    // Click delete button
    await page.getByRole('button', { name: 'Delete set 1' }).click()

    // Wait for dialog to appear
    await expect(
      page.getByRole('heading', { name: 'Delete Set' }),
    ).toBeVisible()

    // Click backdrop (outside the modal)
    await page.locator('.fixed.inset-0.z-50').click({ position: { x: 5, y: 5 } })

    // Dialog should be dismissed
    await expect(
      page.getByRole('heading', { name: 'Delete Set' }),
    ).not.toBeVisible()
  })

  test('confirming deletion removes the set', async ({ page }) => {
    await setupSupabaseMocksWithSets(page)
    await page.goto('/workout')

    // Wait for workout to load
    await expect(
      page.getByRole('heading', { name: /Today.*Workout/ }),
    ).toBeVisible()

    // Wait for sets to appear
    await expect(
      page.getByRole('button', { name: 'Delete set 1' }),
    ).toBeVisible()

    // Count initial delete buttons
    const initialDeleteButtons = await page
      .getByRole('button', { name: /Delete set \d+/ })
      .count()
    expect(initialDeleteButtons).toBe(3)

    // Click delete button on first set
    await page.getByRole('button', { name: 'Delete set 1' }).click()

    // Confirm deletion
    await page
      .locator('.fixed.inset-0')
      .getByRole('button', { name: 'Delete' })
      .click()

    // Wait for the dialog to close
    await expect(
      page.getByRole('heading', { name: 'Delete Set' }),
    ).not.toBeVisible()

    // Verify set was deleted - should only have 2 delete buttons now
    await page.waitForTimeout(500) // Wait for state update
    const finalDeleteButtons = await page
      .getByRole('button', { name: /Delete set \d+/ })
      .count()
    expect(finalDeleteButtons).toBe(2)
  })

  test('deleting the last set removes the exercise from workout', async ({
    page,
  }) => {
    // Set up with only one set
    await page.addInitScript(
      ({ session }) => {
        localStorage.setItem(
          'sb-test-placeholder-auth-token',
          JSON.stringify(session),
        )
      },
      { session: mockSession },
    )

    let currentSets = [mockSets[0]] // Only one set
    let currentWorkoutExercises = [mockWorkoutExercise]

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

    await page.route(`${SUPABASE_URL}/rest/v1/workouts*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockWorkout]),
      })
    })

    await page.route(`${SUPABASE_URL}/rest/v1/workout_exercises*`, (route) => {
      const method = route.request().method()
      if (method === 'DELETE') {
        currentWorkoutExercises = []
        route.fulfill({
          status: 204,
          contentType: 'application/json',
          body: '',
        })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(currentWorkoutExercises),
        })
      }
    })

    await page.route(`${SUPABASE_URL}/rest/v1/sets*`, (route) => {
      const method = route.request().method()
      if (method === 'DELETE') {
        currentSets = []
        route.fulfill({
          status: 204,
          contentType: 'application/json',
          body: '',
        })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(currentSets),
        })
      }
    })

    await page.route(`${SUPABASE_URL}/rest/v1/exercises*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockExercise]),
      })
    })

    await page.goto('/workout')

    // Wait for workout to load with exercise
    await expect(
      page.getByRole('heading', { name: /Today.*Workout/ }),
    ).toBeVisible()
    await expect(page.getByText('Bench Press')).toBeVisible()

    // Verify only one set exists
    await expect(
      page.getByRole('button', { name: 'Delete set 1' }),
    ).toBeVisible()

    // Delete the only set
    await page.getByRole('button', { name: 'Delete set 1' }).click()

    // Confirm deletion
    await page
      .locator('.fixed.inset-0')
      .getByRole('button', { name: 'Delete' })
      .click()

    // Wait for deletion to complete
    await page.waitForTimeout(1000)

    // Exercise should be removed from workout
    await expect(page.getByText('Bench Press')).not.toBeVisible()

    // Should show empty state
    await expect(page.getByText(/No exercises yet/)).toBeVisible()
  })
})
