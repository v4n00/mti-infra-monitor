import client from "prom-client";

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

export const httpErrorTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status_code'],
});

// user metrics
export const loginAttemptsTotal = new client.Counter({
  name: 'login_attempts_total',
  help: 'Total number of login attempts',
  labelNames: ['success'],
});

// database operation metrics
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

client.collectDefaultMetrics();

// database query wrapper for metrics
export async function trackDbQuery<T>(
  operation: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result_2 = await queryFn();
    const duration = (Date.now() - start) / 1000;
    dbQueryDuration.observe({ operation }, duration);
    dbQueryTotal.inc({ operation, success: 'true' });
    return result_2;
  } catch (error) {
    const duration_1 = (Date.now() - start) / 1000;
    dbQueryDuration.observe({ operation }, duration_1);
    dbQueryTotal.inc({ operation, success: 'false' });
    throw error;
  }
}

// HTTP metrics middleware
export function httpMetricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - ${ip}`);

  const route = originalUrl.split('?')[0].replace(/\/\d+/g, '/:id');

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestTotal.inc({ method, route, status_code: res.statusCode });
    httpRequestDuration.observe({ method, route }, duration);
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - ${res.statusCode} - ${duration}ms`);
  });

  next();
}

// error handling
export function httpErrorHandler(err: any, req: any, res: any, next: any) {
  const { method, originalUrl, ip } = req;
  const timestamp = new Date().toISOString();

  console.error(`[${timestamp}] ERROR ${method} ${originalUrl} - ${ip}`);
  console.error(`[${timestamp}] Message: ${err.message}`);
  console.error(`[${timestamp}] Stack: ${err.stack}`);

  httpErrorTotal.inc({ method, route: originalUrl.split('?')[0].replace(/\/\d+/g, '/:id'), status_code: res.statusCode });
  
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// metrics endpoint handler
export async function metricsHandler(_req: any, res: any) {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}