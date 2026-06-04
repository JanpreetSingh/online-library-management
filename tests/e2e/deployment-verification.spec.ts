import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8000';

test.describe('Deployment Verification', () => {
  
  test('Backend API is accessible', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/docs`);
    expect(response.status()).toBe(200);
  });
  
  test('Frontend is accessible', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('text=Online Library')).toBeVisible({ timeout: 10000 });
  });
  
  test('Can login with admin user', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    await page.fill('input[type="email"]', 'admin@library.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
  
  test('Books page is accessible', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    await page.fill('input[type="email"]', 'admin@library.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/dashboard/);
    
    await page.goto(`${FRONTEND_URL}/books`);
    await expect(page.locator('h1:has-text("Book Catalogue")')).toBeVisible();
  });
  
  test('Borrow API endpoint exists', async ({ request }) => {
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        email: 'admin@library.com',
        password: 'Admin@123'
      }
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    
    const borrowResponse = await request.post(`${BACKEND_URL}/api/borrow/test-book-id`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    expect([404, 400, 403, 409, 422]).toContain(borrowResponse.status());
  });
  
  test('Can access books via API', async ({ request }) => {
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        email: 'admin@library.com',
        password: 'Admin@123'
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    
    const booksResponse = await request.get(`${BACKEND_URL}/api/books`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    expect(booksResponse.ok()).toBeTruthy();
    const books = await booksResponse.json();
    expect(Array.isArray(books)).toBeTruthy();
    expect(books.length).toBeGreaterThan(0);
  });
});
