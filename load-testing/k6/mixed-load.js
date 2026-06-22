import http from 'k6/http';
import { sleep, check } from 'k6';

const ACTIVE_SCENARIO = 'gradual_stronger';

const k6scenarios = {
  gradual: {
    executor: 'ramping-vus',
    startVUs: 1,
    stages: [
      { duration: '2m', target: 15 },
      { duration: '2m', target: 30 },
      { duration: '3m', target: 50 },
      { duration: '2m', target: 10 },
    ],
  },
  gradual_stronger: {
    executor: 'ramping-vus',
    startVUs: 1,
    stages: [
      { duration: '2m', target: 70 },
      { duration: '2m', target: 100 },
      { duration: '2m', target: 170 },
      { duration: '2m', target: 210 },
      { duration: '2m', target: 100 },
    ],
  },
};

export const options = {
  scenarios: {
    [ACTIVE_SCENARIO]: {
      ...k6scenarios[ACTIVE_SCENARIO],
    },
  },

  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.05'],
  },
};


const BASE_URL = 'http://backend.default.svc.cluster.local:2000/api';

const scenarios = ['browse_only', 'auth_user', 'order_flow', 'others'];
const weight = [0.4, 0.3, 0.2, 0.1];

export default function () {
  const rand = Math.random();
  let cumulative = 0;
  let scenario = scenarios[0];

  for (let i = 0; i < scenarios.length; i++) {
    cumulative += weight[i];
    if (rand < cumulative) {
      scenario = scenarios[i];
      break;
    }
  }

  switch (scenario) {
    case 'browse_only':
      browseScenario();
      break;
    case 'auth_user':
      authScenario();
      break;
    case 'order_flow':
      orderScenario();
      break;
    case 'others':
      othersScenario();
      break;
  }
}

function browseScenario() {

  const productsResponse = http.get(`${BASE_URL}/products`);
  check(productsResponse, {
    'browse status is 200': (r) => r.status === 200,
  });

  if (productsResponse.status === 200) {
    const products = productsResponse.json();
    for (let i = 0; i < products.length; i++) {
      const detailResponse = http.get(`${BASE_URL}/products/${products[i].id}`);
      check(detailResponse, {
        'detail status is 200': (r) => r.status === 200,
      });

      sleep(17 + Math.random() * 3);
    }
  }

  sleep(Math.random() * 2 + 7);
}

function authScenario() {

  const email = `mixeduser${Math.floor(Math.random() * 10000)}@example.com`;

  http.post(`${BASE_URL}/users/signup`,
    JSON.stringify({ email, password: 'testpassword123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const loginResponse = http.post(`${BASE_URL}/users/login`,
    JSON.stringify({ email, password: 'testpassword123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (loginResponse.status === 200) {
    const token = loginResponse.json().token;

    http.get(`${BASE_URL}/users/validate`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
  }

  sleep(Math.random() * 2);
}

function orderScenario() {

  const userId = Math.floor(Math.random() * 10000);
  const email = `orderuser${userId}@example.com`;

  let token;

  http.post(`${BASE_URL}/users/signup`,
    JSON.stringify({ email, password: 'testpassword123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const login = http.post(`${BASE_URL}/users/login`,
    JSON.stringify({ email, password: 'testpassword123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (login.status === 200) {
    token = login.json().token;
  }

  if (token) {
    const productsResponse = http.get(`${BASE_URL}/products`);
    if (productsResponse.status === 200) {
      const products = productsResponse.json();

      if (products.length > 0) {
        const orderItems = [products[Math.floor(Math.random() * products.length)]].map(p => ({
          productId: p.id,
          quantity: Math.floor(Math.random() * 3) + 1,
        }));

        http.post(`${BASE_URL}/orders`,
          JSON.stringify({ items: orderItems }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      }
    }
  }

  sleep(Math.random() * 4);
}

function othersScenario() {

  const response = http.get('http://frontend.default.svc.cluster.local:3000/');

  check(response, {
    'others status is 200': (r) => r.status === 200,
  });

  sleep(Math.random() * 2);
}
