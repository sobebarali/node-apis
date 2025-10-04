/**
 * T3 Stack logger template
 * Generates centralized Pino logger utility with request ID tracking
 */

/**
 * Generates logger utility content
 */
export const generateLoggerContent = (): string => {
  return `/**
 * Centralized logger utility using Pino
 * Provides structured logging with request ID tracking and sensitive data sanitization
 */

import pino from "pino";

/**
 * Base Pino logger configuration
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),

  // Pretty print in development for better readability
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,

  // Redact sensitive fields automatically
  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "apiKey",
      "*.apiKey",
      "secret",
      "*.secret",
      "authorization",
      "*.authorization",
      "cookie",
      "*.cookie",
    ],
    censor: "[REDACTED]",
  },

  // Base context for all logs
  base: {
    env: process.env.NODE_ENV ?? "development",
  },
});

/**
 * Creates a scoped logger with preset context (requestId, feature, etc.)
 *
 * @example
 * const log = createScopedLogger({ requestId: "abc123", feature: "USER" });
 * log.info({ userId: "123" }, "Operation started");
 * // Output includes both requestId, feature, and userId automatically
 *
 * @param context - Context to include in all log entries
 * @returns Scoped logger instance with preset context
 */
export function createScopedLogger(context: Record<string, unknown>): pino.Logger {
  return logger.child(context);
}

/**
 * Log levels:
 * - debug: Detailed debugging information (dev only)
 * - info: General informational messages
 * - warn: Warning messages for potentially harmful situations
 * - error: Error messages for failures
 *
 * @example
 * // Basic logging
 * logger.info({ requestId: "abc123" }, "Request received");
 * logger.error({ error: error.message }, "Request failed");
 *
 * @example
 * // Scoped logging (recommended)
 * const log = createScopedLogger({ requestId, feature: "USER" });
 * log.info({ userId }, "User created");
 * log.error({ error: error.message, stack: error.stack }, "Creation failed");
 */
`;
};

/**
 * Gets the logger file name
 */
export const getLoggerFileName = (): string => {
  return "logger.ts";
};
