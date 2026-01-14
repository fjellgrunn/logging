/**
 * Correlation ID support for request tracing
 * Provides utilities for generating and propagating correlation IDs through log entries
 */

import { Logger, TimeLogger } from './Logger';

/**
 * Generate a unique correlation ID
 * Format: timestamp-random (e.g., "lq2x5k-abc123")
 * @returns A unique correlation ID string
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Logger wrapper that automatically includes a correlation ID in all log messages
 * Useful for tracing requests through distributed systems
 */
export class CorrelatedLogger implements Logger {
  private baseLogger: Logger;
  private correlationId: string;

  /**
   * Create a new CorrelatedLogger
   * @param baseLogger - The underlying logger to wrap
   * @param correlationId - Optional correlation ID (generates one if not provided)
   */
  constructor(baseLogger: Logger, correlationId?: string) {
    this.baseLogger = baseLogger;
    this.correlationId = correlationId || generateCorrelationId();
  }

  /**
   * Format a message with the correlation ID prefix
   */
  private formatWithCorrelation(message: string): string {
    return `[${this.correlationId}] ${message}`;
  }

  /**
   * Get the current correlation ID
   * @returns The correlation ID for this logger
   */
  getCorrelationId(): string {
    return this.correlationId;
  }

  /**
   * Create a new CorrelatedLogger with a different correlation ID
   * @param id - The new correlation ID to use
   * @returns A new CorrelatedLogger with the specified correlation ID
   */
  withCorrelationId(id: string): CorrelatedLogger {
    return new CorrelatedLogger(this.baseLogger, id);
  }

  // Implement Logger interface methods

  emergency(message: string, ...data: any[]): void {
    this.baseLogger.emergency(this.formatWithCorrelation(message), ...data);
  }

  alert(message: string, ...data: any[]): void {
    this.baseLogger.alert(this.formatWithCorrelation(message), ...data);
  }

  critical(message: string, ...data: any[]): void {
    this.baseLogger.critical(this.formatWithCorrelation(message), ...data);
  }

  error(message: string, ...data: any[]): void {
    this.baseLogger.error(this.formatWithCorrelation(message), ...data);
  }

  warning(message: string, ...data: any[]): void {
    this.baseLogger.warning(this.formatWithCorrelation(message), ...data);
  }

  notice(message: string, ...data: any[]): void {
    this.baseLogger.notice(this.formatWithCorrelation(message), ...data);
  }

  info(message: string, ...data: any[]): void {
    this.baseLogger.info(this.formatWithCorrelation(message), ...data);
  }

  debug(message: string, ...data: any[]): void {
    this.baseLogger.debug(this.formatWithCorrelation(message), ...data);
  }

  trace(message: string, ...data: any[]): void {
    this.baseLogger.trace(this.formatWithCorrelation(message), ...data);
  }

  default(message: string, ...data: any[]): void {
    this.baseLogger.default(this.formatWithCorrelation(message), ...data);
  }

  time(message: string, ...data: any[]): TimeLogger {
    return this.baseLogger.time(this.formatWithCorrelation(message), ...data);
  }

  get(...additionalComponents: string[]): Logger {
    // Return a new CorrelatedLogger wrapping the child logger
    const childLogger = this.baseLogger.get(...additionalComponents);
    return new CorrelatedLogger(childLogger, this.correlationId);
  }

  destroy(): void {
    this.baseLogger.destroy();
  }
}

/**
 * Create a correlated logger from an existing logger
 * @param logger - The base logger to wrap
 * @param correlationId - Optional correlation ID (generates one if not provided)
 * @returns A new CorrelatedLogger
 */
export function createCorrelatedLogger(
  logger: Logger,
  correlationId?: string
): CorrelatedLogger {
  return new CorrelatedLogger(logger, correlationId);
}

