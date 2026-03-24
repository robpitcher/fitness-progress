import { test } from '@playwright/test'

test('debug page state', async ({ page }) => {
  const SUPABASE_URL = 'https://test-placeholder.supabase.co'
  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 86400,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    token_type: 'bearer',
    user: {
      id: '00000000-0000-0000-0000-000000000001',
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

  await page.addInitScript(({ session }) => {
    localStorage.setItem('sb-test-placeholder-auth-token', JSON.stringify(session))
  }, { session: mockSession })

  // Log ALL console messages
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text().substring(0, 300)}`)
  })

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message.substring(0, 300))
  })

  page.on('requestfailed', req => {
    console.log('FAIL:', req.url().substring(0, 120), req.failure()?.errorText)
  })

  await page.route(`${SUPABASE_URL}/**`, route => {
    const url = route.request().url()
    console.log('INTERCEPTED:', route.request().method(), url.replace(SUPABASE_URL, ''))
    if (url.includes('/rest/v1/profiles')) {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '00000000-0000-0000-0000-000000000001', display_name: 'Test', created_at: '2024-01-01T00:00:00Z' }) })
    } else if (url.includes('/rest/v1/workouts')) {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
    }
  })

  await page.goto('/workout', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  console.log('FINAL URL:', page.url())
  const rootHTML = await page.innerHTML('#root').catch(() => 'NO ROOT')
  console.log('ROOT HTML length:', rootHTML.length)
  console.log('ROOT HTML:', rootHTML.substring(0, 1000))
})
