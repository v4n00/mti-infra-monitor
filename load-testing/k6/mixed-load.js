import http from 'k6/http';
import { sleep, check } from 'k6';

const stages_low = [
    { duration: '30s', target: 10 },
    { duration: '30s', target: 20 },
    { duration: '30s', target: 30 },
    { duration: '1m', target: 50 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 10 }
];

const stages_high = [
    { duration: '30s', target: 25 },
    { duration: '30s', target: 35 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 60 },
    { duration: '1m', target: 35 },
    { duration: '30s', target: 20 }
];

const allStages = [stages_low, stages_high];

export const options = {
    stages: allStages[0],
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

                sleep(0.5);
        }
    }

    sleep(Math.random() * 3 + 1);
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

  sleep(2);
}

function failLoginScenario() {

    const loginResponse = http.post(`${BASE_URL}/users/login`,
        JSON.stringify({ email: 'test@test.com', password: 'wrongpassword' }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    check(loginResponse, {
        'failed login status is 400': (r) => r.status === 400,
    });

    sleep(1);
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

    sleep(4);
}

function othersScenario() {
    
    const response = http.get('http://frontend:3000/');

    check(response, {
        'others status is 200': (r) => r.status === 200,
    });

    sleep(Math.random() * 2 + 1);
}
