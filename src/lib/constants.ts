export const AUTH_CALLBACK_PATH = '/auth/callback';

export const RETURN_TO_PARAM = 'r';

export const AUTH_FLAG_PARAM = 'auth'; // valeur '1' au retour d’auth

export const ALLOWED_RETURN_PREFIXES = ['/', '/report', '/pricing'];

export const UMAMI_EVENTS = {
  export_attempt: 'export_attempt',
  export_success: 'export_success',
  export_failed: 'export_failed',
  signup_started: 'signup_started',
  signup_success: 'signup_success',
  login_success: 'login_success',
} as const;

export type UmamiEventKey = keyof typeof UMAMI_EVENTS;

