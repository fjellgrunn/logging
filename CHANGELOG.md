# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### API Key and Secret Masking
- API key masking for major providers:
  - **OpenAI**: `sk-*`, `sk-proj-*`
  - **Anthropic**: `sk-ant-*`
  - **AWS**: `AKIA*` (access keys)
  - **GitHub**: `ghp_*`, `gho_*`, `ghs_*`, `ghu_*`
  - **GitLab**: `glpat-*`
  - **Slack**: `xox*-*` (bot, app, user tokens)
  - **Google Cloud**: `AIza*`
- Generic secret pattern masking:
  - `api_key=`, `api-key=`, `apikey=`
  - `password=`
  - `secret=`
  - `token=`
  - `Bearer` tokens
- New `MaskingConfig` options:
  - `maskApiKeys` - Mask API keys (default: true)
  - `maskBearerTokens` - Mask Bearer tokens (default: true)
  - `maskPasswords` - Mask password patterns (default: true)
  - `maskGenericSecrets` - Mask generic secrets (default: true)

#### Correlation ID Support
- `CorrelatedLogger` class for wrapping loggers with correlation ID prefixes
- `generateCorrelationId()` function for generating unique correlation IDs
- `createCorrelatedLogger()` factory function
- Optional `correlationId` field in `LogEntry` interface
- Optional `withCorrelationId()` and `getCorrelationId()` methods in `Logger` interface

### Documentation
- Updated MASKING.md with API key and secret masking documentation
- Added docs/CORRELATION.md with correlation ID usage patterns
- Updated README.md with new feature highlights

