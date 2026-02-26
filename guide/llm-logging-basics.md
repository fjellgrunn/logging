# LLM Logging Basics

This page shows a practical baseline for instrumenting LLM features with `@fjell/logging`.

## 1) Create a Package Logger

Use one top-level category per package or service:

```typescript
import { getLogger } from "@fjell/logging";

const AppLogger = getLogger("@myorg/ai-service");
```

Then create child loggers for pipeline stages:

```typescript
const ingestLogger = AppLogger.get("ingest");
const retrievalLogger = AppLogger.get("retrieval");
const generationLogger = AppLogger.get("generation");
const toolsLogger = AppLogger.get("tools");
```

This gives readable log coordinates and lets you tune log levels per component.

## 2) Use Level Semantics Consistently

For LLM systems, a simple convention works well:

- `error`: failed API calls, parse failures, unrecoverable tool errors
- `warning`: degraded behavior, retries, partial results
- `info`: request lifecycle, model choice, successful milestones
- `debug`: detailed diagnostics used during investigation
- `trace` or `default`: very high-volume internals (token-by-token, raw payload traces)

## 3) Log Metadata, Not Full Payloads

Prefer compact, structured metadata instead of dumping full prompts/responses:

```typescript
generationLogger.info("Model call finished", {
  provider: "openai",
  model: "gpt-4.1-mini",
  inputTokens: 1840,
  outputTokens: 312,
  latencyMs: 842,
  stopReason: "end_turn"
});
```

This keeps logs useful while reducing privacy and cost risk.

## 4) Recommended Environment Config

Start with `INFO` globally, then enable deeper visibility only where needed:

```bash
export LOGGING_CONFIG='{
  "logLevel": "INFO",
  "logFormat": "STRUCTURED",
  "overrides": {
    "@myorg/ai-service": {
      "logLevel": "INFO",
      "components": {
        "generation": { "logLevel": "DEBUG" },
        "retrieval": { "logLevel": "DEBUG" }
      }
    }
  }
}'
```

You can also override globally with:

- `LOG_LEVEL` (for example `DEBUG`)
- `LOG_FORMAT` (`TEXT` or `STRUCTURED`)

## 5) Timing Important Operations

Use `time()` around expensive steps:

```typescript
const t = generationLogger.time("llm completion");
try {
  // Call model provider
} finally {
  t.end();
}
```

This is useful for identifying where latency accumulates in multi-step agents.

