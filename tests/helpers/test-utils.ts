import { Page } from '@playwright/test';

/**
 * Helper to bypass login for staff dashboard.
 * Injects token and user data into localStorage.
 */
export async function setupAuth(page: Page) {
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hbmFnZXJAcG5zLmNvbSIsInR5cGUiOiJFTVBMT1lFRSIiLCJyb2xlIjoiTUFOQUdFUiIsImlhdCI6MTYxNDU1NjgwMCwiZXhwIjoxNjE0NjQzMjAwfQ.abc';
  const mockUser = {
    id: 'u1',
    email: 'manager@pns.com',
    name: 'Test Manager',
    type: 'EMPLOYEE',
    role: 'MANAGER',
  };

  await page.addInitScript(({ token, user }) => {
    window.localStorage.setItem('auth_token', token);
    window.localStorage.setItem('user', JSON.stringify(user));
    window.PLAYWRIGHT_DEBUG = true;
  }, { token: mockToken, user: mockUser });
}

/**
 * Mock API endpoints for Consignment.
 */
export async function mockConsignmentApi(page: Page) {
  // Only intercept requests to the API port (default 3001)
  // to avoid accidentally mocking the dashboard page itself (port 3000)
  await page.route(url => url.toString().includes(':3001'), 
  async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();
    const pathname = new URL(url).pathname;

    console.log(`[MOCK HIT] ${method} ${url}`);

    if (pathname.includes('/consignment/settle')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          message: 'Settlement processed',
          data: { totalAmountSettledDelta: 100000, status: 'PARTIALLY_SETTLED' }
        })
      });
    }

    if (pathname === '/consignment' || pathname === '/consignment/') {
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            statusCode: 200,
            message: 'Success',
            data: [
              {
                id: 'c1',
                supplierId: 's1',
                supplier: { id: 's1', name: 'Mock Supplier' },
                totalAmount: 1000000,
                totalSettled: 500000,
                status: 'PARTIALLY_SETTLED',
                date: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                items: [
                  {
                     id: 'ci1',
                     productVariantId: 'v1',
                     qtyReceived: 10,
                     qtyReturned: 0,
                     qtySettled: 5,
                     unitCost: 50000,
                     productVariant: {
                       id: 'v1',
                       package: 'Small',
                       product: { id: 'p1', name: 'Mock Product' }
                     }
                  }
                ]
              }
            ]
          })
        });
      } else if (method === 'POST') {
        return route.fulfill({
           status: 201,
           contentType: 'application/json',
           body: JSON.stringify({
             success: true,
             statusCode: 201,
             message: 'Created',
             data: { id: 'c_new' }
           })
        });
      }
    }

    if (pathname === '/suppliers' || pathname === '/suppliers/') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: [{ id: 's1', name: 'Mock Supplier' }]
        })
      });
    }

    if (pathname === '/products' || pathname === '/products/') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: [
            { 
              id: 'p1', 
              name: 'Mock Product', 
              variants: [
                { id: 'v1', package: 'Small', stock: 100, price: 60000 }
              ] 
            }
          ]
        })
      });
    }

    // Default to continue if no match detected in the path-based logic
    return route.continue();
  });
}
