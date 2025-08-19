import { ALLOWED_RETURN_PREFIXES, AUTH_FLAG_PARAM } from '@/lib/constants';

/**
 * Sanitize an internal return path to prevent open redirects.
 * - Reject absolute URLs (http://, https://, //)
 * - Allow only relative paths beginning with one of ALLOWED_RETURN_PREFIXES
 * - Fallback to '/'
 */
export function sanitizeReturnTo(input: string | null | undefined): string {
  if (!input) return '/';

  let decoded = input;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    decoded = input;
  }

  const value = decoded.trim();
  const lower = value.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('//')) {
    return '/';
  }
  if (!value.startsWith('/')) {
    return '/';
  }
  const allowed = ALLOWED_RETURN_PREFIXES.some((prefix) => value.startsWith(prefix));
  return allowed ? value : '/';
}

/**
 * Remove the auth=1 flag from a URL path+search string to clean the address bar.
 * The input should be a relative path starting with '/'.
 */
export function stripAuthFlag(urlPathWithQuery: string): string {
  if (!urlPathWithQuery) return '/';
  const [path, search = ''] = urlPathWithQuery.split('?');
  const params = new URLSearchParams(search);
  params.delete(AUTH_FLAG_PARAM);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}


