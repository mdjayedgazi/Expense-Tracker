import { firefox } from 'playwright-core'

const APP = 'http://localhost:5173'
const user = `shots_${Date.now()}`
const pass = 'secret123'

const browser = await firefox.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_FIREFOX_PATH ??
    process.env.HOME + '/.cache/ms-playwright/firefox-1538/firefox/firefox',
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto(APP + '/register', { waitUntil: 'networkidle' })
await page.screenshot({ path: '/tmp/opencode/shot_register.png' })
await page.fill('input[autocomplete="username"]', user)
await page.fill('input[autocomplete="email"]', `${user}@example.com`)
await page.fill('input[autocomplete="new-password"]', pass)
await page.fill('input[autocomplete="new-password"] >> nth=1', pass)
await page.click('button[type="submit"]')
await page.waitForURL('**/login', { timeout: 15000 })
await page.screenshot({ path: '/tmp/opencode/shot_login.png' })
await page.fill('input[autocomplete="username"]', user)
await page.fill('input[autocomplete="current-password"]', pass)
await page.click('button[type="submit"]')
await page.waitForURL('**/dashboard', { timeout: 15000 })
await page.waitForSelector('text=Total Balance', { timeout: 15000 })

// Create a handful of transactions for a populated dashboard
const seed = [
  ['Salary', 80000, 'income', 'Salary', '2026-08-01'],
  ['Freelance project', 25000, 'income', 'Other', '2026-07-15'],
  ['Rent', 15000, 'expense', 'Bills', '2026-08-02'],
  ['Groceries', 3200, 'expense', 'Food', '2026-08-10'],
  ['Lunch with team', 1250, 'expense', 'Food', '2026-08-14'],
  ['Uber rides', 900, 'expense', 'Transport', '2026-08-08'],
  ['Netflix', 499, 'expense', 'Entertainment', '2026-07-05'],
  ['Doctor visit', 2500, 'expense', 'Health', '2026-07-20'],
  ['New sneakers', 5400, 'expense', 'Shopping', '2026-06-18'],
  ['Course subscription', 1999, 'expense', 'Education', '2026-06-02'],
]
for (const [title, amount, type, category, date] of seed) {
  await page.goto(APP + '/transactions/new', { waitUntil: 'domcontentloaded' })
  await page.fill('input[placeholder="e.g. Monthly salary"]', title)
  await page.fill('input[placeholder="0.00"]', String(amount))
  if (type === 'income') await page.click('button:has-text("Income")')
  await page.selectOption('select', category)
  await page.fill('input[type="date"]', date)
  await page.click('button:has-text("Create transaction")')
  await page.waitForURL('**/transactions', { timeout: 15000 })
}

await page.goto(APP + '/dashboard', { waitUntil: 'networkidle' })
await page.waitForSelector('.recharts-responsive-container', { timeout: 15000 })
await page.waitForTimeout(1200)
await page.screenshot({ path: '/tmp/opencode/shot_dashboard_light.png' })

await page.click('button[aria-label*="dark mode"]')
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/opencode/shot_dashboard_dark.png' })
await page.click('button[aria-label*="light mode"]')
await page.waitForTimeout(400)

await page.goto(APP + '/transactions', { waitUntil: 'networkidle' })
await page.waitForSelector('text=Groceries', { timeout: 15000 })
await page.screenshot({ path: '/tmp/opencode/shot_transactions.png' })
await page.click('button:has-text("Filters")')
await page.waitForTimeout(500)
await page.screenshot({ path: '/tmp/opencode/shot_filters.png' })

await page.goto(APP + '/transactions/new', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.screenshot({ path: '/tmp/opencode/shot_add.png' })

await page.goto(APP + '/profile', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.screenshot({ path: '/tmp/opencode/shot_profile.png' })

// Mobile
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mobile.goto(APP + '/login', { waitUntil: 'networkidle' })
await mobile.fill('input[autocomplete="username"]', user)
await mobile.fill('input[autocomplete="current-password"]', pass)
await mobile.click('button[type="submit"]')
await mobile.waitForURL('**/dashboard', { timeout: 15000 })
await mobile.waitForSelector('text=Total Balance', { timeout: 15000 })
await mobile.waitForTimeout(800)
await mobile.screenshot({ path: '/tmp/opencode/shot_mobile_dashboard.png' })
await mobile.click('button[aria-label="Open navigation menu"]')
await mobile.waitForTimeout(500)
await mobile.screenshot({ path: '/tmp/opencode/shot_mobile_drawer.png' })
await mobile.click('button[aria-label="Close navigation menu"]').catch(() => {})
await mobile.locator('a[href="/transactions"]').first().click()
await mobile.waitForURL('**/transactions')
await mobile.waitForSelector('text=Groceries >> visible=true', { timeout: 15000 })
await mobile.waitForTimeout(400)
await mobile.screenshot({ path: '/tmp/opencode/shot_mobile_transactions.png' })

await browser.close()
console.log('screenshots saved to /tmp/opencode/')