import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.1'],
    },
};

const BASE_URL = 'http://backend.default.svc.cluster.local:2000/api';

export default function () {
    const payload = JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
    });

    const response = http.post(`${BASE_URL}/users/login`, payload, {
        headers: { 'Content-Type': 'application/json' },
    });

    check(response, {
        'login fails with 400': (r) => r.status === 400,
        'returns error message': (r) => r.json().message !== undefined,
    });

    sleep(1);
}