/**
 * Sensitive data masking utilities for logging
 * Detects and replaces PII, private keys, API keys, and other sensitive information with '****'
 */

// Regex patterns for sensitive data detection
const PRIVATE_KEY_PATTERNS = [
  /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----\s*[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
  /-----BEGIN\s+EC\s+PRIVATE\s+KEY-----\s*[\s\S]*?-----END\s+EC\s+PRIVATE\s+KEY-----/gi,
  /-----BEGIN\s+DSA\s+PRIVATE\s+KEY-----\s*[\s\S]*?-----END\s+DSA\s+PRIVATE\s+KEY-----/gi,
];

const BASE64_BLOB_PATTERN = /[A-Za-z0-9+/=]{200,}/g;

const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

// ReDoS-safe email pattern: limits consecutive special characters and uses more specific matching
const EMAIL_PATTERN = /\b[A-Za-z0-9][A-Za-z0-9._%+-]{0,63}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}\b/g;

const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g;

// API Key patterns for various providers
const API_KEY_PATTERNS = [
  // OpenAI
  /sk-[a-zA-Z0-9]{20,}/g,
  /sk-proj-[a-zA-Z0-9_-]+/g,

  // Anthropic
  /sk-ant-[a-zA-Z0-9_-]+/g,

  // AWS Access Keys
  /AKIA[0-9A-Z]{16}/g,

  // GitHub tokens
  /ghp_[a-zA-Z0-9]{36}/g,
  /gho_[a-zA-Z0-9]{36}/g,
  /ghs_[a-zA-Z0-9]{36}/g,
  /ghu_[a-zA-Z0-9]{36}/g,

  // GitLab tokens
  /glpat-[a-zA-Z0-9_-]{20}/g,

  // Slack tokens
  /xox[baprs]-[a-zA-Z0-9-]+/g,

  // Google Cloud API keys
  /AIza[0-9A-Za-z_-]{35}/g,
];

// Bearer token pattern
const BEARER_TOKEN_PATTERN = /Bearer\s+[\w.-]+/gi;

// Password patterns (key=value style)
const PASSWORD_PATTERNS = [
  /password[\s:="']+[^\s"']+/gi,
];

// Generic secret patterns (key=value style)
const GENERIC_SECRET_PATTERNS = [
  /api[_-]?key[\s:="']+[\w-]+/gi,
  /secret[\s:="']+[^\s"']+/gi,
  /token[\s:="']+[^\s"']+/gi,
];

// Maximum string length to process for regex patterns (security limit)
const MAX_STRING_LENGTH = 100000;

/**
 * Masks sensitive data in a string
 * @param input - The input string to mask
 * @returns The masked string with sensitive data replaced by '****'
 */
export function maskString(input: string): string {
  if (typeof input !== 'string' || input.length === 0) {
    return input;
  }

  // Security: Avoid processing extremely long strings that could cause ReDoS
  if (input.length > MAX_STRING_LENGTH) {
    return '****'; // Mask the entire oversized string
  }

  let masked = input;

  // Mask private key blocks
  for (const pattern of PRIVATE_KEY_PATTERNS) {
    masked = masked.replace(pattern, '****');
  }

  // Mask long base64 blobs
  masked = masked.replace(BASE64_BLOB_PATTERN, '****');

  // Mask JWT tokens (check if it's a JWT and if middle/third segment is long)
  if (JWT_PATTERN.test(masked)) {
    const segments = masked.split('.');
    if (segments.length === 3) {
      const [, middle, third] = segments;
      if (middle.length > 100 || third.length > 100) {
        masked = '****';
      }
    }
  }

  // Mask email addresses
  masked = masked.replace(EMAIL_PATTERN, '****');

  // Mask SSNs
  masked = masked.replace(SSN_PATTERN, '****');

  // Mask API keys (various providers)
  for (const pattern of API_KEY_PATTERNS) {
    masked = masked.replace(pattern, '****');
  }

  // Mask Bearer tokens
  masked = masked.replace(BEARER_TOKEN_PATTERN, '****');

  // Mask passwords
  for (const pattern of PASSWORD_PATTERNS) {
    masked = masked.replace(pattern, '****');
  }

  // Mask generic secrets
  for (const pattern of GENERIC_SECRET_PATTERNS) {
    masked = masked.replace(pattern, '****');
  }

  return masked;
}

/**
 * Masks sensitive data in an object recursively
 * @param obj - The object to mask
 * @param maxDepth - Maximum recursion depth to prevent stack overflow
 * @param currentDepth - Current recursion depth
 * @returns A new object with sensitive data masked
 */
export function maskObject<T>(obj: T, maxDepth: number = 8, currentDepth: number = 0): T {
  // Prevent infinite recursion
  if (currentDepth >= maxDepth) {
    return obj;
  }

  // Handle null and undefined
  if (obj === null || obj === void 0) {
    return obj;
  }

  // Handle primitives
  if (typeof obj === 'string') {
    return maskString(obj) as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => maskObject(item, maxDepth, currentDepth + 1)) as T;
  }

  // Handle objects
  const maskedObj = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      (maskedObj as any)[key] = maskObject(value, maxDepth, currentDepth + 1);
    }
  }

  return maskedObj;
}

/**
 * Configuration for masking behavior
 */
export interface MaskingConfig {
  /** Enable/disable masking entirely */
  enabled: boolean;
  /** Mask email addresses */
  maskEmails: boolean;
  /** Mask SSNs */
  maskSSNs: boolean;
  /** Mask private keys */
  maskPrivateKeys: boolean;
  /** Mask long base64 blobs */
  maskBase64Blobs: boolean;
  /** Mask JWT tokens */
  maskJWTs: boolean;
  /** Maximum recursion depth for object masking */
  maxDepth: number;
  /** Mask API keys (OpenAI, Anthropic, AWS, GitHub, GitLab, Slack, Google Cloud) */
  maskApiKeys: boolean;
  /** Mask Bearer tokens */
  maskBearerTokens: boolean;
  /** Mask passwords (password=value patterns) */
  maskPasswords: boolean;
  /** Mask generic secrets (api_key=, secret=, token= patterns) */
  maskGenericSecrets: boolean;
}

/**
 * Default masking configuration
 */
export const defaultMaskingConfig: MaskingConfig = {
  enabled: false,
  maskEmails: true,
  maskSSNs: true,
  maskPrivateKeys: true,
  maskBase64Blobs: true,
  maskJWTs: true,
  maxDepth: 8,
  // New security-focused defaults (all true when masking is enabled)
  maskApiKeys: true,
  maskBearerTokens: true,
  maskPasswords: true,
  maskGenericSecrets: true,
};

/**
 * Enhanced masking function that respects configuration
 * @param input - The input to mask
 * @param config - Masking configuration
 * @returns The masked input
 */
export function maskWithConfig<T>(
  input: T,
  config: MaskingConfig = defaultMaskingConfig
): T {
  if (!config.enabled) {
    return input;
  }

  // Create a custom maskString function based on config
  const customMaskString = (str: string): string => {
    if (typeof str !== 'string' || str.length === 0) {
      return str;
    }

    // Security: Avoid processing extremely long strings that could cause ReDoS
    if (str.length > MAX_STRING_LENGTH) {
      return '****'; // Mask the entire oversized string
    }

    let masked = str;

    // Apply configured masking rules
    if (config.maskPrivateKeys) {
      for (const pattern of PRIVATE_KEY_PATTERNS) {
        masked = masked.replace(pattern, '****');
      }
    }

    if (config.maskBase64Blobs) {
      masked = masked.replace(BASE64_BLOB_PATTERN, '****');
    }

    if (config.maskJWTs && JWT_PATTERN.test(masked)) {
      const segments = masked.split('.');
      if (segments.length === 3) {
        const [, middle, third] = segments;
        if (middle.length > 100 || third.length > 100) {
          masked = '****';
        }
      }
    }

    if (config.maskEmails) {
      masked = masked.replace(EMAIL_PATTERN, '****');
    }

    if (config.maskSSNs) {
      masked = masked.replace(SSN_PATTERN, '****');
    }

    // Apply new API key and secret masking rules
    if (config.maskApiKeys) {
      for (const pattern of API_KEY_PATTERNS) {
        masked = masked.replace(pattern, '****');
      }
    }

    if (config.maskBearerTokens) {
      masked = masked.replace(BEARER_TOKEN_PATTERN, '****');
    }

    if (config.maskPasswords) {
      for (const pattern of PASSWORD_PATTERNS) {
        masked = masked.replace(pattern, '****');
      }
    }

    if (config.maskGenericSecrets) {
      for (const pattern of GENERIC_SECRET_PATTERNS) {
        masked = masked.replace(pattern, '****');
      }
    }

    return masked;
  };

  // Custom maskObject function with config
  const customMaskObject = <U>(
    obj: U,
    maxDepth: number = config.maxDepth,
    currentDepth: number = 0
  ): U => {
    if (currentDepth >= maxDepth) {
      return obj;
    }

    if (obj === null || obj === void 0) {
      return obj;
    }

    if (typeof obj === 'string') {
      return customMaskString(obj) as U;
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => customMaskObject(item, maxDepth, currentDepth + 1)) as U;
    }

    const maskedObj = {} as U;
    for (const [key, value] of Object.entries(obj)) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        (maskedObj as any)[key] = customMaskObject(value, maxDepth, currentDepth + 1);
      }
    }

    return maskedObj;
  };

  return customMaskObject(input);
}
