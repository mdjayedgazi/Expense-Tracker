/* Temporary browser E2E verification against the real backend. */
import { firefox } from 'playwright-core'

const APP = 'http://localhost:5173'
const user = `e2e_${Date.now()}`
const pass = 'secret123'

const results = []
function check(name, ok, extra = '') {
  results.push({ name, ok, extra })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`)
}

let browser
try {
  browser = await firefox.launch({
    headless: true,
    executablePath:
      process.env.PLAYWRIGHT_FIREFOX_PATH ??
      process.env.HOME + '/.cache/ms-playwright/firefox-1538/firefox/firefox',
  })
} catch (e) {
  console.log('LAUNCH FAILED:', e.message)
  console.log('Set PLAYWRIGHT_FIREFOX_PATH to your Firefox binary, or run: npx playwright install firefox')
  process.exit(1)
}

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const errors = []
page.on('pageerror', (err) => errors.push(String(err)))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('response', (r) => {
  if (r.url().includes('8125') && r.request().method() === 'DELETE')
    console.log('DELETE API ->', r.status())
})

try {
  // 1. Root redirects unauthenticated users to /login
  await page.goto(APP + '/', { waitUntil: 'networkidle' })
  check('redirect / -> /login', page.url().includes('/login'), page.url())

  // 2. Register
  await page.click('a[href="/register"]')
  await page.waitForURL('**/register')
  await page.fill('input[autocomplete="username"]', user)
  await page.fill('input[autocomplete="email"]', `${user}@example.com`)
  await page.fill('input[autocomplete="new-password"]', pass)
  await page.fill('input[autocomplete="new-password"] >> nth=1', pass)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/login', { timeout: 15000 })
  check('register -> success -> login page', true)

  // 3. Login
  await page.fill('input[autocomplete="username"]', user)
  await page.fill('input[autocomplete="current-password"]', pass)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  await page.waitForSelector('text=Total Balance', { timeout: 15000 })
  check('balance card visible', true)
  check('empty state shown', await page.locator('text=No transactions yet').isVisible())

  // 4. Create income transaction (direct URL avoids nav-link double match)
  await page.goto(APP + '/transactions/new', { waitUntil: 'networkidle' })
  await page.fill('input[placeholder="e.g. Monthly salary"]', 'Monthly salary')
  await page.fill('input[placeholder="0.00"]', '50000')
  await page.click('button:has-text("Income")')
  await page.selectOption('select', 'Salary')
  await page.click('button:has-text("Create transaction")')
  await page.waitForURL('**/transactions', { timeout: 15000 })
  await page.waitForSelector('text=Monthly salary', { timeout: 15000 })
  check('income created and listed', true)

  // 5. Create expense transaction
  await page.goto(APP + '/transactions/new', { waitUntil: 'networkidle' })
  await page.fill('input[placeholder="e.g. Monthly salary"]', 'Lunch with team')
  await page.fill('input[placeholder="0.00"]', '1250')
  await page.selectOption('select', 'Food')
  await page.click('button:has-text("Create transaction")')
  await page.waitForURL('**/transactions', { timeout: 15000 })
  await page.waitForSelector('text=Lunch with team', { timeout: 15000 })
  check('expense created and listed', true)

  // 6. Search (client-side)
  await page.fill('input[aria-label="Search transactions"]', 'lunch')
  await page.waitForTimeout(700)
  check('search filters rows', (await page.locator('text=Lunch with team').count()) > 0)
  check('search hides non-matching', (await page.locator('text=Monthly salary').count()) === 0)
  await page.fill('input[aria-label="Search transactions"]', '')
  await page.waitForTimeout(400)

  // 7. Backend filter
  await page.click('button:has-text("Filters")')
  await page.waitForSelector('text=Filters', { timeout: 5000 })
  await page.selectOption('select >> nth=0', 'expense')
  await page.click('button:has-text("Apply")')
  await page.waitForSelector('text=Lunch with team', { timeout: 15000 })
  await page.waitForTimeout(800)
  check('filter (type=expense) works', (await page.locator('text=Monthly salary').count()) === 0)

  // 8. Dashboard reflects real data
  await page.goto(APP + '/dashboard', { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Total Balance', { timeout: 15000 })
  const balanceText = await page.locator('text=Total Balance').locator('..').innerText()
  check('balance = 50,000 - 1,250', balanceText.includes('48,750.00'), balanceText.replace(/\n/g, ' | '))
  check('income stat', (await page.locator('text=Total Income').locator('..').innerText()).includes('50,000.00'))
  check('expense stat', (await page.locator('text=Total Expense').locator('..').innerText()).includes('1,250.00'))
  check('charts render', (await page.locator('.recharts-responsive-container').count()) >= 2)
  check('recent transactions on dashboard', await page.locator('text=Lunch with team').first().isVisible())

  // 9. Edit transaction
  await page.goto(APP + '/transactions', { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Lunch with team', { timeout: 15000 })
  const editRow = page.locator('tr', { hasText: 'Lunch with team' })
  await editRow.hover()
  await editRow.locator('button[aria-label*="Edit"]').click()
  await page.waitForURL('**/edit')
  await page.fill('input[placeholder="0.00"]', '1500')
  await page.click('button:has-text("Save changes")')
  await page.waitForURL('**/transactions', { timeout: 20000 })
  await page.waitForSelector('text=Lunch with team >> visible=true', { timeout: 20000 })
  await page.waitForTimeout(500)
  check('edit saved', await page.locator('text=Lunch with team').first().isVisible())

  // 10. View dialog
  await page.locator('tr', { hasText: 'Monthly salary' }).hover()
  await page.locator('tr', { hasText: 'Monthly salary' }).locator('button[aria-label*="View"]').click()
  await page.waitForSelector('text=Transaction details', { timeout: 5000 })
  check('view dialog shows amount', await page.locator('text=৳ 50,000.00').isVisible())
  await page.click('button:has-text("Close")')

  // 11. Delete with confirmation
  await page.locator('tr', { hasText: 'Monthly salary' }).hover()
  await page.locator('tr', { hasText: 'Monthly salary' }).locator('button[aria-label*="Delete"]').click()
  await page.waitForSelector('text=Delete transaction?', { timeout: 5000 })
  await page.click('button:has-text("Delete")')
  await page.waitForTimeout(3000)
  const remaining = await page.locator('text=Monthly salary').count()
  console.log('rows after delete:', remaining)
  check('delete removes row', remaining === 0, `remaining=${remaining}`)

  // 12. Profile
  await page.click('a[href="/profile"]')
  await page.waitForURL('**/profile')
  await page.waitForSelector(`text=${user}@example.com`, { timeout: 15000 })
  check('profile shows email', true)

  // 13. Dark mode toggle + persistence
  const html = page.locator('html')
  const before = await html.getAttribute('class')
  await page.click('button[aria-label*="dark mode"]')
  await page.waitForTimeout(300)
  const after = await html.getAttribute('class')
  check('dark mode toggles', before !== after, `${before} -> ${after}`)
  await page.reload({ waitUntil: 'networkidle' })
  check('theme persists after reload', (await page.locator('html').getAttribute('class')) === after)

  // 14. Logout
  await page.click('button:has-text("Logout")')
  await page.waitForURL('**/login', { timeout: 10000 })
  check('logout returns to login', true)

  // 15. Protected route blocks unauthenticated access
  await page.goto(APP + '/dashboard')
  await page.waitForTimeout(1500)
  check('protected route redirects', page.url().includes('/login'), page.url())

  // 16. Mobile viewport: drawer + cards
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(APP + '/login')
  await page.fill('input[autocomplete="username"]', user)
  await page.fill('input[autocomplete="current-password"]', pass)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  await page.waitForSelector('text=Total Balance', { timeout: 15000 })
  check('mobile: menu button visible', await page.locator('button[aria-label="Open navigation menu"]').isVisible())
  await page.click('button[aria-label="Open navigation menu"]')
  await page.waitForTimeout(400)
  check('mobile: sidebar drawer opens', await page.locator('a[href="/transactions"]').first().isVisible())
  await page.locator('a[href="/transactions"]').first().click()
  await page.waitForURL('**/transactions')
  await page.waitForSelector('text=Lunch with team >> visible=true', { timeout: 20000 })
  check('mobile: card layout (no visible table)', !(await page.locator('table').isVisible()))
} catch (e) {
  check('SCRIPT ERROR', false, String(e).slice(0, 300))
  await page.screenshot({ path: '/tmp/opencode/e2e_error.png' })
}

const realErrors = errors.filter(
  (e) => !e.includes('favicon') && !e.includes('recharts'),
)
check('no console/page errors', realErrors.length === 0, realErrors.slice(0, 3).join(' || '))

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)