import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 5,
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 500 },
    { duration: '3m', target: 500 },
    { duration: '2m', target: 10 },
  ],
};

export default function () {
  const res = http.get('http://backend:2000/api/products');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}