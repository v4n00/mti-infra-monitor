import client from "prom-client";

// Prometheus metrics setup
const register = client.register;

// HTTP request metrics
export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// Business metrics
export const ordersTotal = new client.Counter({
  name: 'orders_total',
  help: 'Total number of orders placed',
});

export const productsViewedTotal = new client.Counter({
  name: 'products_viewed_total',
  help: 'Total number of product views',
});

export const userRegistrationsTotal = new client.Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
});

export const loginAttemptsTotal = new client.Counter({
  name: 'login_attempts_total',
  help: 'Total number of login attempts',
  labelNames: ['success'],
});

// Active users gauge
export const activeUsers = new client.Gauge({
  name: 'active_users',
  help: 'Number of currently active users',
});

// Database operation metrics
export const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});

export const dbQueryTotal = new client.Counter({
  name: 'db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'success'],
});

// Collect default metrics
client.collectDefaultMetrics();

// Database query wrapper for metrics
export function trackDbQuery<T>(
  operation: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  return queryFn()
    .then(result => {
      const duration = (Date.now() - start) / 1000;
      dbQueryDuration.observe({ operation }, duration);
      dbQueryTotal.inc({ operation, success: 'true' });
      return result;
    })
    .catch(error => {
      const duration = (Date.now() - start) / 1000;
      dbQueryDuration.observe({ operation }, duration);
      dbQueryTotal.inc({ operation, success: 'false' });
      throw error;
    });
}

// HTTP metrics middleware
export function httpMetricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  const { method, originalUrl } = req;

  const route = originalUrl.split('?')[0].replace(/\/\d+/g, '/:id');

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestTotal.inc({ method, route, status_code: res.statusCode });
    httpRequestDuration.observe({ method, route }, duration);
  });

  next();
}

// Metrics endpoint handler
export async function metricsHandler(_req: any, res: any) {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}