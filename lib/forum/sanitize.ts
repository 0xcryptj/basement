/**
 * Sanitize user input for forum posts
 */

/**
 * Sanitize text content
 * Removes HTML tags except for allowed formatting
 */
export function sanitizeText(text: string, maxLength: number = 10000): string {
  if (!text) return '';

  // Trim and limit length
  let sanitized = text.trim().slice(0, maxLength);

  // Convert dangerous HTML entities
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Convert greentext (lines starting with >)
  sanitized = sanitized.replace(/^&gt;(.+)$/gm, '<span class="greentext">&gt;$1</span>');

  // Convert newlines to <br>
  sanitized = sanitized.replace(/\n/g, '<br>');

  return sanitized;
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed';

  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  
  // Remove special characters except . - _
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  sanitized = sanitized.slice(0, 255);
  
  return sanitized || 'unnamed';
}

/**
 * Validate and sanitize subject line
 */
export function sanitizeSubject(subject: string | null): string | null {
  if (!subject) return null;

  let sanitized = subject.trim();
  
  if (sanitized.length === 0) return null;
  
  // Remove HTML
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Limit length
  sanitized = sanitized.slice(0, 100);
  
  return sanitized || null;
}

/**
 * Check for suspicious patterns (spam detection)
 */
export function containsSuspiciousContent(text: string): boolean {
  const suspiciousPatterns = [
    /viagra/i,
    /cialis/i,
    /crypto.*trading.*bot/i,
    /click.*here.*now/i,
    /http[s]?:\/\/[^\s]{50,}/g, // Very long URLs
    /(.)\1{10,}/, // Repeated characters
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(text));
}

/**
 * Validate image MIME type
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  
  return validTypes.includes(mimeType.toLowerCase());
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMime(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  
  return mimeToExt[mimeType.toLowerCase()] || 'bin';
}

