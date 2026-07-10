import { configureLogging, LoggingConfig, resolveLogLevel } from "./config";
import { createLogger, Logger } from "./Logger";

const isTestEnvironment = (): boolean => {
  if (typeof process === "undefined" || !process.env) {
    return false;
  }
  return (
    process.env.VITEST === "true" ||
    process.env.NODE_ENV === "test" ||
    typeof process.env.VITEST_WORKER_ID !== "undefined"
  );
};

export const getLogger = (name: string): Logger => {
  const config = configureLogging();
  const logger = createBaseLogger(name, config);
  return logger;
}

const createBaseLogger = (name: string, config: LoggingConfig): Logger => {
  const { logFormat, floodControl } = config;
  const coordinates = { category: name, components: [] };
  
  // Resolve the log level for this category
  const logLevel = resolveLogLevel(config, name, []);
  
  // Disable async logging in test environments so assertions see writes immediately.
  // Production defaults to async logging (setImmediate / setTimeout fallback).
  return createLogger(logFormat, logLevel, coordinates, floodControl, config, void 0, {
    asyncLogging: !isTestEnvironment()
  });
};
