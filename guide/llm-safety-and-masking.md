# Prompt Safety and Data Masking

LLM applications often process secrets and sensitive user text. Treat logging as a security boundary.

## Safety Principles

- Do not log full prompts by default
- Do not log raw model responses if they may contain private user data
- Log summaries and metrics first, raw payloads only for controlled debugging
- Enable masking in production

## Enable Masking in Configuration

`@fjell/logging` supports masking via `LOGGING_CONFIG`:

```bash
export LOGGING_CONFIG='{
  "logLevel": "INFO",
  "logFormat": "STRUCTURED",
  "masking": {
    "enabled": true,
    "maskApiKeys": true,
    "maskBearerTokens": true,
    "maskPasswords": true,
    "maskGenericSecrets": true,
    "maskEmails": true,
    "maskSSNs": true,
    "maskJWTs": true,
    "maskPrivateKeys": true,
    "maskBase64Blobs": true,
    "maxDepth": 8
  }
}'
```

Masking is disabled by default, so opt in explicitly.

## Safe Logging Pattern for Prompts

```typescript
const logger = AppLogger.get("generation");

logger.info("Prompt prepared", {
  systemPromptLength: systemPrompt.length,
  userPromptLength: userPrompt.length,
  contextChunkCount: chunks.length
});

// Avoid this in normal operation:
// logger.debug("Raw prompt", { systemPrompt, userPrompt, chunks });
```

If you must inspect prompt content, gate it behind an explicit debug flag and keep it out of production.

## Incident-Friendly Fields

When troubleshooting without leaking content, capture:

- stable request identifier (`correlationId`)
- model/provider and configuration snapshot
- token counts and latency
- failure class and retry count
- sanitized error codes/messages

## Performance Note

Masking adds CPU overhead. For high-throughput systems:

- keep masking enabled in production where sensitive data exists
- keep logs concise to reduce masking work
- avoid logging large nested objects unless needed

