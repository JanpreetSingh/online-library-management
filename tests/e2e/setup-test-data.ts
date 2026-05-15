import { test as setup } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8000';

setup('setup test users and books', async ({ request }) => {
  const adminToken = await getAdminToken(request);
  
  await createTestUsers(request, adminToken);
  await ensureBooksExist(request, adminToken);
  
  console.log('Test data setup complete');
});

async function getAdminToken(request: any): Promise<string> {
  const response = await request.post(`${BACKEND_URL}/api/auth/login`, {
    data: {
      email: 'admin@library.com',
      password: 'admin123'
    }
  });
  
  if (!response.ok()) {
    throw new Error('Failed to login as admin');
  }
  
  const data = await response.json();
  return data.access_token;
}

async function createTestUsers(request: any, adminToken: string) {
  const testUsers = [
    {
      name: 'Test Member',
      email: 'member@library.com',
      password: 'member123',
      role: 'member'
    },
    {
      name: 'Test Guest',
      email: 'guest@library.com',
      password: 'guest123',
      role: 'guest'
    },
    {
      name: 'Test Librarian',
      email: 'librarian@library.com',
      password: 'librarian123',
      role: 'librarian'
    }
  ];
  
  for (const user of testUsers) {
    const response = await request.post(`${BACKEND_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
      data: user
    });
    
    if (response.ok()) {
      console.log(`Created user: ${user.email}`);
    } else if (response.status() === 409) {
      console.log(`User already exists: ${user.email}`);
    } else {
      console.log(`Failed to create user ${user.email}: ${response.status()}`);
    }
  }
}

async function ensureBooksExist(request: any, adminToken: string) {
  const booksResponse = await request.get(`${BACKEND_URL}/api/books`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  const books = await booksResponse.json();
  
  if (books.length < 5) {
    const testBooks = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        category: 'Fiction',
        publisher: 'Scribner',
        publication_year: 1925,
        total_copies: 5
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        category: 'Fiction',
        publisher: 'Harper Perennial',
        publication_year: 1960,
        total_copies: 3
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        category: 'Science Fiction',
        publisher: 'Signet Classic',
        publication_year: 1949,
        total_copies: 4
      }
    ];
    
    for (const book of testBooks) {
      await request.post(`${BACKEND_URL}/api/books`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
        data: book
      });
    }
    
    console.log('Test books created');
  } else {
    console.log(`Books already exist: ${books.length} books found`);
  }
}
