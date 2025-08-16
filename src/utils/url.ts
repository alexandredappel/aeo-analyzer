/**
 * URL utilities for client-side normalization and validation
 */

/**
 * Normalize a user-entered URL by adding an https:// scheme if missing.
 */
export function normalizeUrlInput(input: string): string {
  const value = (input || '').trim();
  if (value.length === 0) return value;

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  return `https://${value}`;
}

/**
 * Check if a string is a valid HTTP(S) URL.
 */
export function isValidHttpUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalize then validate; returns the normalized URL if valid, otherwise null.
 */
export function normalizeAndValidate(input: string): string | null {
  const normalized = normalizeUrlInput(input);
  return isValidHttpUrl(normalized) ? normalized : null;
}


