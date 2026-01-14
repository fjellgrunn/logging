import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CorrelatedLogger,
  createCorrelatedLogger,
  generateCorrelationId,
} from "../src/correlation";
import { Logger, TimeLogger } from "../src/Logger";

// Mock logger for testing
function createMockLogger(): Logger & { calls: { method: string; args: any[] }[] } {
  const calls: { method: string; args: any[] }[] = [];

  const mockTimeLogger: TimeLogger = {
    end: vi.fn(),
    log: vi.fn(),
  };

  const logger: Logger & { calls: { method: string; args: any[] }[] } = {
    calls,
    emergency: (message: string, ...data: any[]) => {
      calls.push({ method: "emergency", args: [message, ...data] });
    },
    alert: (message: string, ...data: any[]) => {
      calls.push({ method: "alert", args: [message, ...data] });
    },
    critical: (message: string, ...data: any[]) => {
      calls.push({ method: "critical", args: [message, ...data] });
    },
    error: (message: string, ...data: any[]) => {
      calls.push({ method: "error", args: [message, ...data] });
    },
    warning: (message: string, ...data: any[]) => {
      calls.push({ method: "warning", args: [message, ...data] });
    },
    notice: (message: string, ...data: any[]) => {
      calls.push({ method: "notice", args: [message, ...data] });
    },
    info: (message: string, ...data: any[]) => {
      calls.push({ method: "info", args: [message, ...data] });
    },
    debug: (message: string, ...data: any[]) => {
      calls.push({ method: "debug", args: [message, ...data] });
    },
    trace: (message: string, ...data: any[]) => {
      calls.push({ method: "trace", args: [message, ...data] });
    },
    default: (message: string, ...data: any[]) => {
      calls.push({ method: "default", args: [message, ...data] });
    },
    time: (message: string, ...data: any[]) => {
      calls.push({ method: "time", args: [message, ...data] });
      return mockTimeLogger;
    },
    get: (...additionalComponents: string[]) => {
      calls.push({ method: "get", args: additionalComponents });
      return createMockLogger();
    },
    destroy: () => {
      calls.push({ method: "destroy", args: [] });
    },
  };

  return logger;
}

describe("Correlation ID", () => {
  describe("generateCorrelationId", () => {
    it("should generate a unique correlation ID", () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it("should generate IDs in expected format (timestamp-random)", () => {
      const id = generateCorrelationId();

      // Should contain a hyphen
      expect(id).toContain("-");

      // Should have two parts
      const parts = id.split("-");
      expect(parts.length).toBe(2);

      // Both parts should be non-empty
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
    });

    it("should generate IDs with base36 characters", () => {
      const id = generateCorrelationId();

      // Base36 characters are 0-9 and a-z
      expect(id).toMatch(/^[0-9a-z]+-[0-9a-z]+$/);
    });

    it("should generate unique IDs across multiple calls", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateCorrelationId());
      }
      // All 1000 IDs should be unique
      expect(ids.size).toBe(1000);
    });
  });

  describe("CorrelatedLogger", () => {
    let mockLogger: Logger & { calls: { method: string; args: any[] }[] };

    beforeEach(() => {
      mockLogger = createMockLogger();
    });

    it("should create a logger with auto-generated correlation ID", () => {
      const correlatedLogger = new CorrelatedLogger(mockLogger);
      const id = correlatedLogger.getCorrelationId();

      expect(id).toBeDefined();
      expect(id.length).toBeGreaterThan(0);
    });

    it("should create a logger with provided correlation ID", () => {
      const correlatedLogger = new CorrelatedLogger(mockLogger, "my-custom-id");
      expect(correlatedLogger.getCorrelationId()).toBe("my-custom-id");
    });

    it("should prefix messages with correlation ID", () => {
      const correlatedLogger = new CorrelatedLogger(mockLogger, "test-123");
      correlatedLogger.info("Hello world");

      expect(mockLogger.calls.length).toBe(1);
      expect(mockLogger.calls[0].method).toBe("info");
      expect(mockLogger.calls[0].args[0]).toBe("[test-123] Hello world");
    });

    it("should pass additional data to the base logger", () => {
      const correlatedLogger = new CorrelatedLogger(mockLogger, "test-123");
      correlatedLogger.info("Message", { key: "value" }, 42);

      expect(mockLogger.calls.length).toBe(1);
      expect(mockLogger.calls[0].args).toEqual([
        "[test-123] Message",
        { key: "value" },
        42,
      ]);
    });

    describe("log level methods", () => {
      it("should prefix emergency messages", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "corr-id");
        correlatedLogger.emergency("Emergency!");

        expect(mockLogger.calls[0].method).toBe("emergency");
        expect(mockLogger.calls[0].args[0]).toBe("[corr-id] Emergency!");
      });

      it("should prefix alert messages", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "corr-id");
        correlatedLogger.alert("Alert!");

        expect(mockLogger.calls[0].method).toBe("alert");
        expect(mockLogger.calls[0].args[0]).toBe("[corr-id] Alert!");
      });

      it("should prefix critical messages", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "corr-id");
        correlatedLogger.critical("Critical!");

        expect(mockLogger.calls[0].method).toBe("critical");
        expect(mockLogger.calls[0].args[0]).toBe("[corr-id] Critical!");
      });

      it("should prefix error messages", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "corr-id");
        correlatedLogger.error("Error!");

        expect(mockLogger.calls[0].method).toBe("error");
        expect(mockLogger.calls[0].args[0]).toBe("[corr-id] Error!");
      });

      it("should prefix warning messages", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "corr-id");
        correlatedLogger.warning("Warning!");

        expect(mockLogger.calls[0].method).toBe("warning");
        expect(mockLogger.calls[0].args[0]).toBe("[corr-id] Warning!");
      });

      it("should prefix notice messages", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "corr-id");
        correlatedLogger.notice("Notice!");

        expect(mockLogger.calls[0].method).toBe("notice");
        expect(mockLogger.calls[0].args[0]).toBe("[corr-id] Notice!");
      });

      it("should prefix debug messages", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "corr-id");
        correlatedLogger.debug("Debug!");

        expect(mockLogger.calls[0].method).toBe("debug");
        expect(mockLogger.calls[0].args[0]).toBe("[corr-id] Debug!");
      });

      it("should prefix trace messages", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "corr-id");
        correlatedLogger.trace("Trace!");

        expect(mockLogger.calls[0].method).toBe("trace");
        expect(mockLogger.calls[0].args[0]).toBe("[corr-id] Trace!");
      });

      it("should prefix default messages", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "corr-id");
        correlatedLogger.default("Default!");

        expect(mockLogger.calls[0].method).toBe("default");
        expect(mockLogger.calls[0].args[0]).toBe("[corr-id] Default!");
      });
    });

    describe("time method", () => {
      it("should prefix time messages", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "corr-id");
        correlatedLogger.time("Timer");

        expect(mockLogger.calls[0].method).toBe("time");
        expect(mockLogger.calls[0].args[0]).toBe("[corr-id] Timer");
      });

      it("should return a TimeLogger", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "corr-id");
        const timeLogger = correlatedLogger.time("Timer");

        expect(timeLogger).toBeDefined();
        expect(typeof timeLogger.end).toBe("function");
        expect(typeof timeLogger.log).toBe("function");
      });
    });

    describe("get method", () => {
      it("should return a CorrelatedLogger with the same correlation ID", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "parent-id");
        const childLogger = correlatedLogger.get("child-component");

        // The child logger should be a CorrelatedLogger
        expect(childLogger).toBeInstanceOf(CorrelatedLogger);

        // The child logger should have the same correlation ID
        expect((childLogger as CorrelatedLogger).getCorrelationId()).toBe("parent-id");
      });

      it("should call get on the base logger", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "parent-id");
        correlatedLogger.get("child", "grandchild");

        expect(mockLogger.calls[0].method).toBe("get");
        expect(mockLogger.calls[0].args).toEqual(["child", "grandchild"]);
      });
    });

    describe("destroy method", () => {
      it("should call destroy on the base logger", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "corr-id");
        correlatedLogger.destroy();

        expect(mockLogger.calls[0].method).toBe("destroy");
      });
    });

    describe("withCorrelationId method", () => {
      it("should create a new logger with a different correlation ID", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "original-id");
        const newLogger = correlatedLogger.withCorrelationId("new-id");

        expect(correlatedLogger.getCorrelationId()).toBe("original-id");
        expect(newLogger.getCorrelationId()).toBe("new-id");
      });

      it("should use the same base logger", () => {
        const correlatedLogger = new CorrelatedLogger(mockLogger, "original-id");
        const newLogger = correlatedLogger.withCorrelationId("new-id");

        newLogger.info("Test message");

        expect(mockLogger.calls.length).toBe(1);
        expect(mockLogger.calls[0].args[0]).toBe("[new-id] Test message");
      });
    });
  });

  describe("createCorrelatedLogger", () => {
    it("should create a CorrelatedLogger with auto-generated ID", () => {
      const mockLogger = createMockLogger();
      const correlatedLogger = createCorrelatedLogger(mockLogger);

      expect(correlatedLogger).toBeInstanceOf(CorrelatedLogger);
      expect(correlatedLogger.getCorrelationId()).toBeDefined();
    });

    it("should create a CorrelatedLogger with provided ID", () => {
      const mockLogger = createMockLogger();
      const correlatedLogger = createCorrelatedLogger(mockLogger, "custom-id");

      expect(correlatedLogger).toBeInstanceOf(CorrelatedLogger);
      expect(correlatedLogger.getCorrelationId()).toBe("custom-id");
    });
  });

  describe("Correlation ID propagation", () => {
    it("should maintain correlation ID through nested logger calls", () => {
      const mockLogger = createMockLogger();
      const correlatedLogger = new CorrelatedLogger(mockLogger, "request-123");

      // Get a child logger
      const childLogger = correlatedLogger.get("service");

      // The child should be a CorrelatedLogger with the same ID
      expect((childLogger as CorrelatedLogger).getCorrelationId()).toBe("request-123");
    });

    it("should allow changing correlation ID for new request context", () => {
      const mockLogger = createMockLogger();
      const correlatedLogger = new CorrelatedLogger(mockLogger, "request-1");

      // Simulate handling a new request
      const newRequestLogger = correlatedLogger.withCorrelationId("request-2");

      correlatedLogger.info("Still on request 1");
      newRequestLogger.info("Now on request 2");

      expect(mockLogger.calls[0].args[0]).toBe("[request-1] Still on request 1");
      expect(mockLogger.calls[1].args[0]).toBe("[request-2] Now on request 2");
    });
  });

  describe("Integration with Logger interface", () => {
    it("should satisfy the Logger interface", () => {
      const mockLogger = createMockLogger();
      const correlatedLogger: Logger = new CorrelatedLogger(mockLogger, "test-id");

      // Should have all required methods
      expect(typeof correlatedLogger.emergency).toBe("function");
      expect(typeof correlatedLogger.alert).toBe("function");
      expect(typeof correlatedLogger.critical).toBe("function");
      expect(typeof correlatedLogger.error).toBe("function");
      expect(typeof correlatedLogger.warning).toBe("function");
      expect(typeof correlatedLogger.notice).toBe("function");
      expect(typeof correlatedLogger.info).toBe("function");
      expect(typeof correlatedLogger.debug).toBe("function");
      expect(typeof correlatedLogger.trace).toBe("function");
      expect(typeof correlatedLogger.default).toBe("function");
      expect(typeof correlatedLogger.time).toBe("function");
      expect(typeof correlatedLogger.get).toBe("function");
      expect(typeof correlatedLogger.destroy).toBe("function");

      // Should have optional correlation methods
      expect(typeof correlatedLogger.withCorrelationId).toBe("function");
      expect(typeof correlatedLogger.getCorrelationId).toBe("function");
    });
  });
});

