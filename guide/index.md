# Fjell Logging for LLM Apps

This guide focuses on using `@fjell/logging` in AI and agent workflows where you need good observability without leaking sensitive prompt data.

## Start Here

- [LLM Logging Basics](./llm-logging-basics.md) - Setup, levels, and component naming for model workflows
- [Request Tracing with Correlation IDs](./llm-request-tracing.md) - Track a single request across orchestration steps and services
- [Prompt Safety and Data Masking](./llm-safety-and-masking.md) - Protect keys, tokens, and user data in logs

## Why This Matters for LLM Systems

LLM applications can be hard to debug because failures are often distributed across retrieval, prompt construction, model calls, parsing, and tool execution. Good logs should answer:

- Which request failed?
- Which model and settings were used?
- Where did latency spike?
- Was sensitive data protected?

`@fjell/logging` gives you:

- Hierarchical component loggers (`logger.get(...)`) for clear pipeline stages
- Correlation ID helpers for end-to-end request tracing
- Configurable masking support for sensitive values
- Structured output mode for log ingestion systems

