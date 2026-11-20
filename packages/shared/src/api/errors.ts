import { z } from 'zod';

/**
 * API error codes. Source of truth: docs/06-api.md section 6.1.
 * The HTTP status is the one the server answers with for that code.
 */
export const ERROR_CODES = {
  validation_failed: 400,
  unauthorized: 401,
  quota_exceeded: 402,
  ai_disabled: 403,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  proposal_stale: 409,
  ai_invalid_output: 422,
  upgrade_required: 426,
  rate_limited: 429,
  internal: 500,
  ai_unavailable: 503,
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export const errorCodeSchema = z.enum(Object.keys(ERROR_CODES) as [ErrorCode, ...ErrorCode[]]);

/** Wire format of every non-2xx API response. */
export const apiErrorBodySchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
    retryAfterSeconds: z.number().int().nonnegative().optional(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

/** Errors that are worth retrying automatically with backoff. */
export const RETRYABLE_CODES: ReadonlySet<ErrorCode> = new Set<ErrorCode>([
  'internal',
  'rate_limited',
  'ai_unavailable',
]);

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly retryable: boolean;
  readonly retryAfterSeconds?: number;

  constructor(
    code: ErrorCode,
    message: string,
    options?: { cause?: unknown; retryAfterSeconds?: number },
  ) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'AppError';
    this.code = code;
    this.retryable = RETRYABLE_CODES.has(code);
    if (options?.retryAfterSeconds !== undefined) {
      this.retryAfterSeconds = options.retryAfterSeconds;
    }
  }

  static fromBody(body: ApiErrorBody): AppError {
    const { code, message, retryAfterSeconds } = body.error;
    return new AppError(
      code,
      message,
      retryAfterSeconds === undefined ? {} : { retryAfterSeconds },
    );
  }
}
