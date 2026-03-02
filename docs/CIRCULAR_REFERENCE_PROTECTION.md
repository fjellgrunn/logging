# Circular Reference Protection

`@fjell/logging` protects your application from crashes caused by non-serializable log data.

## Why This Exists

Native `JSON.stringify()` throws on circular structures:

```text
TypeError: Converting circular structure to JSON
```

Logging should never take down your application. This library guarantees logging remains safe even when payloads include circular references or problematic values.

## What Is Protected

- Circular references in objects and arrays
- Nested circular structures
- Common non-JSON-safe values (for example `BigInt`, symbols, throwing getters)
- Both `TEXT` and `STRUCTURED` log output paths

## Behavior

- Circular references are replaced with `"(circular)"`
- Serialization errors are handled with safe fallbacks
- Logging continues after encountering problematic payloads

## Example

```typescript
const obj: any = { name: "user" };
obj.self = obj;

logger.info("Safe logging", obj);
// Logs successfully with: {"name":"user","self":"(circular)"}
```

## Related

- `tests/circular-safety.test.ts` for behavior coverage
- `CHANGELOG.md` for release history
