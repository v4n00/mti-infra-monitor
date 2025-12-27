import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 3,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = 'http://backend.default.svc.cluster.local:2000/api';

export function setup() {
  const productsResponse = http.get(`${BASE_URL}/products`);
  const products = productsResponse.json();

  const userId = Math.floor(Math.random() * 10000);
  const email = `orderuser${userId}@example.com`;
  const password = 'testpassword123';

  const signupResponse = http.post(`${BASE_URL}/users/signup`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const loginResponse = http.post(`${BASE_URL}/users/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  return {
    products: products.slice(0, 5),
    token: loginResponse.json().token,
  };
}

export default function (data) {
  const { products, token } = data;

  const browseResponse = http.get(`${BASE_URL}/products`);
  check(browseResponse, {
    'browse products status is 200': (r) => r.status === 200,
  });

  sleep(1);

  const orderItems = products.slice(0, Math.floor(Math.random() * 3) + 1).map(product => ({
    productId: product.id,
    quantity: Math.floor(Math.random() * 5) + 1,
  }));

  const orderResponse = http.post(`${BASE_URL}/orders`,
    JSON.stringify({ items: orderItems }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  check(orderResponse, {
    'create order status is 201': (r) => r.status === 201,
    'order has items': (r) => r.json().orderItems && r.json().orderItems.length > 0,
  });

  sleep(2);

  const ordersResponse = http.get(`${BASE_URL}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  check(ordersResponse, {
    'get orders status is 200': (r) => r.status === 200,
    'orders is array': (r) => Array.isArray(r.json()),
  });

  sleep(3);
}