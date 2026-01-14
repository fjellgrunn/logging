# Correlation ID Support

The fjell-logging package includes correlation ID support for request tracing across distributed systems. Correlation IDs help you track a single request as it flows through multiple services and components.

## Overview

Correlation IDs are unique identifiers that are attached to all log messages related to a single request or transaction. This makes it easy to:

- **Trace requests** across multiple services
- **Debug issues** by filtering logs by correlation ID
- **Analyze performance** by tracking request flow
- **Correlate events** across distributed systems

## Quick Start

```typescript
import { getLogger, createCorrelatedLogger } from '@fjell/logging';

// Get a base logger
const baseLogger = getLogger('@myapp/service');

// Create a correlated logger for a request
const logger = createCorrelatedLogger(baseLogger.get('request-handler'), 'req-12345');

// All log messages will include the correlation ID
logger.info('Processing request');
// Output: [INFO] [@myapp/service] [request-handler] [req-12345] Processing request

logger.debug('Fetching data', { userId: 123 });
// Output: [DEBUG] [@myapp/service] [request-handler] [req-12345] Fetching data { userId: 123 }
```

## API Reference

### `generateCorrelationId()`

Generates a unique correlation ID in the format `timestamp-random`.

```typescript
import { generateCorrelationId } from '@fjell/logging';

const correlationId = generateCorrelationId();
// Example: "lq2x5k-abc123"
```

### `CorrelatedLogger`

A logger wrapper that automatically prefixes all messages with a correlation ID.

```typescript
import { CorrelatedLogger } from '@fjell/logging';

const correlatedLogger = new CorrelatedLogger(baseLogger, 'my-correlation-id');

// Get the correlation ID
const id = correlatedLogger.getCorrelationId();

// Create a new logger with a different correlation ID
const newLogger = correlatedLogger.withCorrelationId('new-id');
```

### `createCorrelatedLogger()`

Factory function to create a `CorrelatedLogger`.

```typescript
import { createCorrelatedLogger } from '@fjell/logging';

// With auto-generated ID
const logger1 = createCorrelatedLogger(baseLogger);

// With custom ID
const logger2 = createCorrelatedLogger(baseLogger, 'custom-id');
```

## Usage Patterns

### Express Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { getLogger, createCorrelatedLogger, generateCorrelationId } from '@fjell/logging';

const baseLogger = getLogger('@myapp/api');

function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Get correlation ID from header or generate new one
  const correlationId = req.headers['x-correlation-id'] as string || generateCorrelationId();
  
  // Attach logger to request
  req.logger = createCorrelatedLogger(baseLogger.get('request'), correlationId);
  
  // Set correlation ID in response header
  res.setHeader('x-correlation-id', correlationId);
  
  req.logger.info('Request started', { 
    method: req.method, 
    path: req.path 
  });
  
  next();
}
```

### Propagating Through Services

```typescript
import { createCorrelatedLogger } from '@fjell/logging';

class UserService {
  private logger: Logger;
  
  constructor(parentLogger: Logger) {
    this.logger = parentLogger.get('UserService');
  }
  
  async getUser(id: string) {
    this.logger.debug('Fetching user', { id });
    // ... fetch user
    this.logger.info('User fetched successfully', { id });
    return user;
  }
}

// In request handler
const requestLogger = createCorrelatedLogger(baseLogger, correlationId);
const userService = new UserService(requestLogger);
await userService.getUser('123');
// All logs from userService will have the same correlation ID
```

### Child Loggers

When you call `.get()` on a `CorrelatedLogger`, the child logger maintains the same correlation ID:

```typescript
const parentLogger = createCorrelatedLogger(baseLogger, 'req-123');
const childLogger = parentLogger.get('child-component');

parentLogger.info('Parent message');
// Output: [req-123] Parent message

childLogger.info('Child message');
// Output: [req-123] Child message
```

### Changing Correlation ID

Use `withCorrelationId()` to create a new logger with a different correlation ID:

```typescript
const logger1 = createCorrelatedLogger(baseLogger, 'request-1');
const logger2 = logger1.withCorrelationId('request-2');

logger1.info('Still on request 1');
// Output: [request-1] Still on request 1

logger2.info('Now on request 2');
// Output: [request-2] Now on request 2
```

## Best Practices

### 1. Generate IDs at Entry Points

Generate correlation IDs at the entry point of your system (e.g., API gateway, message consumer):

```typescript
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || generateCorrelationId();
  req.correlationId = correlationId;
  next();
});
```

### 2. Propagate IDs in Headers

When making HTTP calls to other services, include the correlation ID:

```typescript
async function callService(url: string, correlationId: string) {
  return fetch(url, {
    headers: {
      'x-correlation-id': correlationId
    }
  });
}
```

### 3. Include IDs in Message Queues

When publishing messages, include the correlation ID in the message metadata:

```typescript
await queue.publish({
  data: payload,
  metadata: {
    correlationId: logger.getCorrelationId()
  }
});
```

### 4. Use Meaningful IDs When Possible

While auto-generated IDs work well, you can use meaningful IDs when appropriate:

```typescript
// Use order ID as correlation ID for order processing
const logger = createCorrelatedLogger(baseLogger, `order-${orderId}`);
```

## Integration with LogEntry

The `LogEntry` interface includes an optional `correlationId` field for structured logging:

```typescript
interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  data?: any;
  meta?: any;
  correlationId?: string;  // Optional correlation ID
  [key: string]: any;
}
```

This allows you to include correlation IDs in structured log output for log aggregation systems like Elasticsearch, Datadog, or Google Cloud Logging.

