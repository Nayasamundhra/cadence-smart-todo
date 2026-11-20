import { describe, expect, it } from 'vitest';
import { AppError, ERROR_CODES, apiErrorBodySchema } from './errors';

describe('AppError', () => {
  it('marks only transient codes as retryable', () => {
    expect(new AppError('internal', 'x').retryable).toBe(true);
    expect(new AppError('rate_limited', 'x').retryable).toBe(true);
    expect(new AppError('ai_unavailable', 'x').retryable).toBe(true);
    expect(new AppError('validation_failed', 'x').retryable).toBe(false);
    expect(new AppError('unauthorized', 'x').retryable).toBe(false);
  });

  it('keeps the cause and retry delay', () => {
    const cause = new Error('boom');
    const err = new AppError('rate_limited', 'slow down', { cause, retryAfterSeconds: 30 });
    expect(err.cause).toBe(cause);
    expect(err.retryAfterSeconds).toBe(30);
  });

  it('round-trips the wire format', () => {
    const body = apiErrorBodySchema.parse({
      error: { code: 'quota_exceeded', message: 'Monthly limit reached.' },
    });
    const err = AppError.fromBody(body);
    expect(err.code).toBe('quota_exceeded');
    expect(err.message).toBe('Monthly limit reached.');
  });

  it('rejects unknown error codes', () => {
    const result = apiErrorBodySchema.safeParse({ error: { code: 'nope', message: 'x' } });
    expect(result.success).toBe(false);
  });

  it('maps every code to a 4xx/5xx status', () => {
    for (const status of Object.values(ERROR_CODES)) {
      expect(status).toBeGreaterThanOrEqual(400);
      expect(status).toBeLessThan(600);
    }
  });
});
