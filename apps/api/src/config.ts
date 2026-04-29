export const config = {
  port: parseInt(process.env.API_PORT ?? '3001'),
  host: process.env.API_HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-jwt-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },

  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
  },

  // HRV baseline window: rolling 7-day average for weather computation
  hrvBaselineWindow: 7,
  // Minimum HRV delta (%) to register a notable suppression
  hrvSuppressionThreshold: 0.1,
}
