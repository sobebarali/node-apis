/**
 * T3 Stack error constants template
 * Generates centralized error codes, messages, and error names
 */

/**
 * Generates error constants content
 */
export const generateErrorConstantsContent = (): string => {
  return `/**
 * Centralized error constants for consistent error handling
 *
 * @see https://trpc.io/docs/server/error-handling
 */

/**
 * tRPC error codes mapped to HTTP status codes
 * Use these constants instead of hardcoded strings
 */
export const TRPC_ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST" as const,
  UNAUTHORIZED: "UNAUTHORIZED" as const,
  FORBIDDEN: "FORBIDDEN" as const,
  NOT_FOUND: "NOT_FOUND" as const,
  TIMEOUT: "TIMEOUT" as const,
  CONFLICT: "CONFLICT" as const,
  PRECONDITION_FAILED: "PRECONDITION_FAILED" as const,
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE" as const,
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS" as const,
  CLIENT_CLOSED_REQUEST: "CLIENT_CLOSED_REQUEST" as const,
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR" as const,
} as const;

/**
 * Standard error messages for common scenarios
 * Update these messages in one place for consistency
 */
export const ERROR_MESSAGES = {
  // Generic errors
  INTERNAL_ERROR: "An unexpected error occurred. Please try again later.",
  NOT_IMPLEMENTED: "This feature is not yet implemented.",

  // Authentication & Authorization
  UNAUTHORIZED: "You must be logged in to perform this action.",
  FORBIDDEN: "You do not have permission to perform this action.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",

  // Resource errors
  NOT_FOUND: "The requested resource was not found.",
  ALREADY_EXISTS: "This resource already exists.",

  // Validation errors
  INVALID_INPUT: "Invalid input provided. Please check your data.",
  MISSING_REQUIRED_FIELD: "Required field is missing.",

  // Rate limiting
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",

  // Database errors
  DATABASE_ERROR: "A database error occurred. Please try again.",
  TRANSACTION_FAILED: "Transaction failed. Please try again.",
} as const;

/**
 * Error names for catching specific error types
 * Use these when checking error.name in handlers
 */
export const ERROR_NAMES = {
  NOT_FOUND: "NotFoundError" as const,
  VALIDATION: "ValidationError" as const,
  DATABASE: "DatabaseError" as const,
  AUTHENTICATION: "AuthenticationError" as const,
  AUTHORIZATION: "AuthorizationError" as const,
  CONFLICT: "ConflictError" as const,
  RATE_LIMIT: "RateLimitError" as const,
  TIMEOUT: "TimeoutError" as const,
} as const;

/**
 * Type definitions for error constants
 */
export type TRPCErrorCode = (typeof TRPC_ERROR_CODES)[keyof typeof TRPC_ERROR_CODES];
export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
export type ErrorName = (typeof ERROR_NAMES)[keyof typeof ERROR_NAMES];
`;
};

/**
 * Gets the error constants file name
 */
export const getErrorConstantsFileName = (): string => {
  return "errors.ts";
};
