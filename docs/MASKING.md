# Sensitive Data Masking

`@fjell/logging` includes configurable masking for sensitive values in log messages and payloads.

## Default Model

- Masking is **disabled by default**
- Enable it explicitly through logging configuration
- Rules are configured at the logging-system level

## Data Types Covered

- Private keys and large base64 blobs
- JWTs
- Email addresses and SSNs
- API keys and service tokens (OpenAI, Anthropic, AWS, GitHub, GitLab, Slack, Google Cloud)
- Generic secret patterns (`api_key=`, `password=`, `secret=`, `token=`, `Bearer ...`)

## Basic Configuration

```typescript
const config = {
  masking: {
    enabled: true,
    maskEmails: true,
    maskSSNs: true,
    maskPrivateKeys: true,
    maskBase64Blobs: true,
    maskJWTs: true,
    maskApiKeys: true,
    maskBearerTokens: true,
    maskPasswords: true,
    maskGenericSecrets: true,
    maxDepth: 8,
  },
};
```

## Performance Notes

Masking adds processing overhead because it uses pattern matching and recursive object traversal. Keep it enabled where data protection matters, and tune options (`maxDepth`, specific mask toggles) for high-throughput workloads.

## Related

- `guide/llm-safety-and-masking.md` for LLM-focused usage guidance
- `CHANGELOG.md` for recently added masking options
