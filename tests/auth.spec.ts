import { test, expect } from '@playwright/test'

// Mock Supabase API so the auth provider resolves with no session
test.beforeEach(async ({ page }) => {
  await page.route('**/auth/v1/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { session: null, user: null }, error: null }),
    })
  )
  await page.route('**/rest/v1/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  )
})

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('renders email and password fields with submit button', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Welcome back')
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign in')
  })

  test('navigates to signup page', async ({ page }) => {
    await page.click('a[href="/signup"]')
    await expect(page).toHaveURL(/\/signup$/)
    await expect(page.locator('h1')).toHaveText('Create account')
  })

  test('shows validation for empty email field', async ({ page }) => {
    await page.click('button[type="submit"]')
    const email = page.locator('#email')
    await expect(email).toHaveAttribute('required', '')
    const validity = await email.evaluate(
      (el: HTMLInputElement) => el.validity.valueMissing
    )
    expect(validity).toBe(true)
  })

  test('shows validation for empty password field', async ({ page }) => {
    await page.fill('#email', 'user@example.com')
    await page.click('button[type="submit"]')
    const password = page.locator('#password')
    await expect(password).toHaveAttribute('required', '')
    const validity = await password.evaluate(
      (el: HTMLInputElement) => el.validity.valueMissing
    )
    expect(validity).toBe(true)
  })
})

test.describe('Signup page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('renders email and password fields with submit button', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Create account')
    await expect(page.locator('#signup-email')).toBeVisible()
    await expect(page.locator('#signup-password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toHaveText(
      'Create account'
    )
  })

  test('navigates to login page', async ({ page }) => {
    await page.click('a[href="/login"]')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.locator('h1')).toHaveText('Welcome back')
  })

  test('shows validation for empty email field', async ({ page }) => {
    await page.click('button[type="submit"]')
    const email = page.locator('#signup-email')
    await expect(email).toHaveAttribute('required', '')
    const validity = await email.evaluate(
      (el: HTMLInputElement) => el.validity.valueMissing
    )
    expect(validity).toBe(true)
  })

  test('shows password length error for short password', async ({ page }) => {
    await page.fill('#signup-email', 'user@example.com')
    await page.fill('#signup-password', '12345')
    await page.click('button[type="submit"]')
    await expect(page.locator('[role="alert"]')).toHaveText(
      'Password must be at least 6 characters'
    )
  })
})

test.describe('Protected route redirection', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/workout')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('redirects root path to login when unauthenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
  })
})
