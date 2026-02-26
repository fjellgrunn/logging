# Request Tracing with Correlation IDs

Correlation IDs let you follow one user request through retrieval, generation, tool calls, and downstream services.

## Basic Pattern

Create a correlated logger at request entry:

```typescript
import {
  getLogger,
  createCorrelatedLogger,
  generateCorrelationId
} from "@fjell/logging";

const AppLogger = getLogger("@myorg/ai-service");

export function createRequestLogger(incomingId?: string) {
  const correlationId = incomingId ?? generateCorrelationId();
  return createCorrelatedLogger(AppLogger.get("request"), correlationId);
}
```

Every log message will be prefixed with the same correlation ID.

## End-to-End Agent Flow Example

```typescript
async function handleChatRequest(input: string, incomingCorrelationId?: string) {
  const reqLogger = createRequestLogger(incomingCorrelationId);
  reqLogger.info("Request started", { inputLength: input.length });

  const retrievalLogger = reqLogger.get("retrieval");
  const generationLogger = reqLogger.get("generation");
  const toolsLogger = reqLogger.get("tools");

  retrievalLogger.debug("Running retrieval");
  const docs = await retrieveContext(input);
  retrievalLogger.info("Retrieval complete", { docCount: docs.length });

  const timer = generationLogger.time("model call");
  const output = await callModel({ input, docs });
  timer.end();

  generationLogger.info("Generation complete", {
    outputLength: output.length
  });

  toolsLogger.debug("Tool phase skipped");
  reqLogger.info("Request completed");

  reqLogger.destroy();
  return output;
}
```

## Propagation Rules

Keep the same correlation ID across boundaries:

- HTTP: send and read `x-correlation-id`
- Queues/events: include `correlationId` in message metadata
- Internal services: pass logger or correlation ID explicitly

## What to Include in Tracing Logs

For LLM operations, these fields are usually enough:

- `provider`, `model`
- `latencyMs`
- `inputTokens`, `outputTokens`
- `toolName`, `toolLatencyMs`
- `retryCount`, `status`

Avoid full prompt/response bodies unless you have a strict redaction policy.

