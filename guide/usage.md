# Usage Guide

Comprehensive usage guidance for `@fjell/logging`.

## Installation

```bash
npm install @fjell/logging
```

## API Highlights

- `getLogger` plus `Logger` and `TimeLogger` types
- `resolveLogLevel` and logging config types
- `safeFormat`, `safeInspect`, `stringifyJSON`, and middleware exports

## Quick Example

```ts
import { getLogger, resolveLogLevel } from "@fjell/logging";

const logger = getLogger({
  component: "http-api",
  level: resolveLogLevel(process.env.LOG_LEVEL),
});

logger.info("service_started", { port: 3000 });
```

## Model Consumption Rules

1. Import from the package root (`@fjell/logging`) instead of deep-internal paths unless explicitly documented.
2. Keep usage aligned with exported public symbols listed in this guide.
3. Prefer explicit typing at package boundaries so generated code remains robust during upgrades.
4. Keep error handling deterministic and map infrastructure failures into domain-level errors.
5. Co-locate integration wrappers in your app so model-generated code has one canonical entry point.

## Best Practices

- Keep examples and abstractions consistent with existing Fjell package conventions.
- Favor composable wrappers over one-off inline integration logic.
- Add targeted tests around generated integration code paths.
