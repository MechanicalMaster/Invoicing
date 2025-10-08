/**
 * Content Filtering & Moderation
 * Protects against toxic content, PII leakage, and unsafe requests
 */

export interface ContentFilterResult {
  safe: boolean
  reason?: string
  category?: 'prompt_injection' | 'toxic' | 'pii' | 'destructive' | 'rate_abuse' | 'offensive'
  confidence: number
}

/**
 * Detect prompt injection attempts
 * Looks for patterns that try to override system instructions
 */
function detectPromptInjection(text: string): ContentFilterResult {
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|commands?)/i,
    /forget\s+(everything|all|previous|above)/i,
    /disregard\s+(previous|above|all)\s+instructions?/i,
    /new\s+instructions?:/i,
    /system\s*:\s*you\s+are/i,
    /\[system\]/i,
    /\<\|system\|\>/i,
    /reset\s+your\s+(instructions?|prompts?|system)/i,
    /override\s+(system|instructions?|rules?)/i,
    /you\s+must\s+(now|always)\s+/i,
    /from\s+now\s+on,?\s+you/i,
    /pretend\s+(to\s+be|you\s+are)/i,
    /act\s+as\s+(if\s+)?you/i,
    /sudo\s+mode/i,
    /developer\s+mode/i,
    /jailbreak/i,
    /DAN\s+mode/i,
  ]

  for (const pattern of injectionPatterns) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: 'Potential prompt injection detected. Please rephrase your request.',
        category: 'prompt_injection',
        confidence: 0.9,
      }
    }
  }

  return { safe: true, confidence: 1.0 }
}

/**
 * Detect destructive SQL/database operations
 */
function detectDestructiveOperations(text: string): ContentFilterResult {
  const destructivePatterns = [
    /drop\s+(table|database|schema)/i,
    /delete\s+from\s+\w+/i,
    /truncate\s+(table\s+)?\w+/i,
    /update\s+\w+\s+set.*where\s+1\s*=\s*1/i,
    /;\s*drop\s+/i,
    /exec\s*\(/i,
    /execute\s+immediate/i,
    /delete\s+(all|everything)/i,
    /(remove|erase|wipe)\s+(all|every|entire)\s+(data|database|records?|invoices?|customers?)/i,
    /destroy\s+(all|everything)/i,
  ]

  for (const pattern of destructivePatterns) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: 'Destructive operations are not allowed through the AI assistant.',
        category: 'destructive',
        confidence: 0.95,
      }
    }
  }

  return { safe: true, confidence: 1.0 }
}

/**
 * Detect excessive batch operations (abuse prevention)
 */
function detectBatchAbuse(text: string): ContentFilterResult {
  const batchPatterns = [
    /create\s+(\d+)\s+(invoices?|customers?|items?)/i,
    /generate\s+(\d+)\s+(invoices?|customers?|items?)/i,
    /add\s+(\d+)\s+(invoices?|customers?|items?)/i,
    /make\s+(\d+)\s+(invoices?|customers?|items?)/i,
  ]

  for (const pattern of batchPatterns) {
    const match = pattern.exec(text)
    if (match) {
      const count = parseInt(match[1], 10)
      // Allow up to 5 items in a single request
      if (count > 5) {
        return {
          safe: false,
          reason: `Bulk operations are limited to 5 items at a time for safety. You requested ${count} items. Please create them in smaller batches.`,
          category: 'rate_abuse',
          confidence: 1.0,
        }
      }
    }
  }

  return { safe: true, confidence: 1.0 }
}

/**
 * Detect toxic or offensive content
 */
function detectToxicContent(text: string): ContentFilterResult {
  const toxicPatterns = [
    /\b(fuck|shit|bitch|asshole|bastard|damn|crap)\b/i,
    /\b(idiot|stupid|dumb|moron)\b.*\b(you|assistant|ai|system)\b/i,
    /\bsuck(s)?\b/i,
    /racist|sexist|homophobic/i,
    /(dirty|explicit|nsfw)\s+(joke|content|story)/i,
  ]

  for (const pattern of toxicPatterns) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: 'Please keep conversations professional and respectful.',
        category: 'offensive',
        confidence: 0.8,
      }
    }
  }

  return { safe: true, confidence: 1.0 }
}

/**
 * Detect PII extraction attempts (preventing data harvesting)
 */
function detectPIIExtraction(text: string): ContentFilterResult {
  const piiPatterns = [
    /show\s+(me\s+)?(all|every|entire)\s+(phone\s+numbers?|emails?|addresses?|customers?)/i,
    /list\s+(all|every)\s+(phone\s+numbers?|emails?|addresses?|customers?)/i,
    /export\s+(all|every|entire)\s+/i,
    /dump\s+(database|data|customers?)/i,
    /give\s+me\s+(everyone's?|all)\s+(contact|phone|email|address)/i,
    /(owner|admin|manager)'?s?\s+(phone|email|password|contact)/i,
  ]

  for (const pattern of piiPatterns) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: 'Bulk data extraction is not permitted for privacy and security reasons.',
        category: 'pii',
        confidence: 0.85,
      }
    }
  }

  return { safe: true, confidence: 1.0 }
}

/**
 * Main content filter function
 * Runs all security checks on user input
 */
export function filterContent(text: string): ContentFilterResult {
  // Run all checks
  const checks = [
    detectPromptInjection(text),
    detectDestructiveOperations(text),
    detectBatchAbuse(text),
    detectToxicContent(text),
    detectPIIExtraction(text),
  ]

  // Return first failed check
  const failed = checks.find((check) => !check.safe)
  if (failed) {
    return failed
  }

  // All checks passed
  return { safe: true, confidence: 1.0 }
}

/**
 * Filter assistant responses for PII leakage
 */
export function filterAssistantResponse(text: string, userId: string): string {
  // Remove potential PII patterns from assistant responses
  let filtered = text

  // Remove any leaked passwords or API keys
  filtered = filtered.replace(/\b(password|api_key|secret|token)\s*[:=]\s*\S+/gi, '[REDACTED]')

  // Remove credit card numbers
  filtered = filtered.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[REDACTED]')

  // Remove Aadhaar numbers (Indian ID)
  filtered = filtered.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[REDACTED]')

  return filtered
}

/**
 * Rate limit for batch operations
 */
export interface BatchLimitConfig {
  maxInvoicesPerRequest: number
  maxCustomersPerRequest: number
  maxItemsPerInvoice: number
}

export const DEFAULT_BATCH_LIMITS: BatchLimitConfig = {
  maxInvoicesPerRequest: 5,
  maxCustomersPerRequest: 5,
  maxItemsPerInvoice: 20,
}

export function validateBatchLimits(
  actionType: string,
  count: number,
  limits: BatchLimitConfig = DEFAULT_BATCH_LIMITS
): ContentFilterResult {
  let limit = 0
  let entityName = ''

  switch (actionType) {
    case 'create_invoice':
      limit = limits.maxInvoicesPerRequest
      entityName = 'invoices'
      break
    case 'add_customer':
      limit = limits.maxCustomersPerRequest
      entityName = 'customers'
      break
    default:
      return { safe: true, confidence: 1.0 }
  }

  if (count > limit) {
    return {
      safe: false,
      reason: `You can only create up to ${limit} ${entityName} at a time. You requested ${count}. Please split this into smaller batches.`,
      category: 'rate_abuse',
      confidence: 1.0,
    }
  }

  return { safe: true, confidence: 1.0 }
}
