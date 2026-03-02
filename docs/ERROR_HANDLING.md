# Error Handling and Resilience

The logging pipeline is designed so logging failures do not crash application code.

## Design Goals

- Isolate logging failures from business logic
- Degrade gracefully when a writer or serializer fails
- Preserve cleanup behavior during shutdown

## Protection Layers

- **Serialization safety**: guarded JSON serialization with fallbacks
- **Async safety**: async scheduling wrapped with fallback paths
- **Buffered write safety**: per-message error handling during flush
- **Cleanup safety**: guarded destroy/flush/timer cleanup paths

## Operational Behavior

- Logging continues after individual write failures
- Errors are surfaced through internal error reporting (without throwing into caller code)
- Fallback behavior prioritizes app stability over perfect log fidelity

## Related

- `docs/CIRCULAR_REFERENCE_PROTECTION.md`
- `docs/MASKING.md`
