import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,
  duration: '10m',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['avg<800'],
  },
};

const BASE_URL = 'http://backend:2000/api';

export default function () {
  const startTime = new Date().getTime();

  const productsResponse = http.get(`${BASE_URL}/products`);
  check(productsResponse, {
    'constant load - products status 200': (r) => r.status === 200,
    'constant load - has products': (r) => r.json().length >= 0,
  });

  if (Math.random() < 0.3) {
    if (productsResponse.status === 200) {
      const products = productsResponse.json();
      if (products.length > 0) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const detailResponse = http.get(`${BASE_URL}/products/${randomProduct.id}`);
        check(detailResponse, {
          'constant load - product detail status 200': (r) => r.status === 200,
        });
      }
    }
  }

  if (Math.random() < 0.1) {
    const loginResponse = http.post(`${BASE_URL}/users/login`,
      JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(loginResponse, {
      'constant load - login status ok': (r) => r.status === 200 || r.status === 400,
    });
  }

  sleep(Math.random() * 3 + 2);

  const elapsed = new Date().getTime() - startTime;
  if (elapsed % 60000 < 1000) {
    console.log(`Constant load test running for ${Math.floor(elapsed / 1000)} seconds`);
  }
}