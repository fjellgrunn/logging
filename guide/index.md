# @fjell/logging - Agentic Guide

## Purpose

Structured logging, format control, and middleware utilities for Fjell applications.

This guide is optimized for AI-assisted code generation and integration workflows.

## Documentation

- **[Usage Guide](./usage.md)** - API-oriented usage patterns and model-safe examples
- **[Integration Guide](./integration.md)** - Architecture placement, composition rules, and implementation guidance

## Key Capabilities

- Provides configurable logger creation with level and format controls
- Includes safe formatting/inspection helpers for resilient logging
- Offers middleware utilities including masking support for sensitive data

## Installation

```bash
npm install @fjell/logging
```

## Public API Highlights

- `getLogger` plus `Logger` and `TimeLogger` types
- `resolveLogLevel` and logging config types
- `safeFormat`, `safeInspect`, `stringifyJSON`, and middleware exports
