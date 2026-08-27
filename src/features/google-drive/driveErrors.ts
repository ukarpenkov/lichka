export const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

export type DriveErrorKind =
  | 'cancelled'
  | 'developer'
  | 'play_services'
  | 'denied'
  | 'too_large'
  | 'no_backup'
  | 'unknown';

const CANCELLED_CODES = new Set(['12501', 'SIGN_IN_CANCELLED']);
const DEVELOPER_CODES = new Set(['10', 'DEVELOPER_ERROR']);

function errorFields(e: unknown): { code: string; message: string; body: string; status: number | null } {
  if (!e || typeof e !== 'object') {
    return { code: '', message: String(e ?? ''), body: '', status: null };
  }
  const err = e as { code?: unknown; message?: unknown; body?: unknown; status?: unknown };
  return {
    code: String(err.code ?? ''),
    message: String(err.message ?? ''),
    body: String(err.body ?? ''),
    status: typeof err.status === 'number' ? err.status : null,
  };
}

export function hasDriveAppDataScope(scopes: string[] | undefined | null): boolean {
  return (scopes ?? []).some((scope) => scope.includes('drive.appdata'));
}

export function isGoogleSignInCancelled(e: unknown): boolean {
  const { code, message } = errorFields(e);
  return CANCELLED_CODES.has(code) || message === 'Sign in cancelled';
}

export function isDriveAuthFailure(e: unknown): boolean {
  const { status, message, body } = errorFields(e);
  const text = `${message} ${body}`;
  if (text.includes('fieldNotWritable')) {
    return false;
  }
  if (status === 401 || /failed:\s*401\b/.test(message)) {
    return true;
  }
  if (status === 403 || /failed:\s*403\b/.test(message)) {
    return true;
  }
  return (
    text.includes('invalid_grant') ||
    text.includes('Invalid Credentials') ||
    text.includes('insufficientPermissions') ||
    text.includes('granted scopes')
  );
}

export function classifyDriveError(e: unknown): DriveErrorKind {
  if (isGoogleSignInCancelled(e)) {
    return 'cancelled';
  }

  const { code, message, body } = errorFields(e);
  const text = `${message} ${body}`;

  if (DEVELOPER_CODES.has(code) || text.includes('DEVELOPER_ERROR')) {
    return 'developer';
  }
  if (code === 'PLAY_SERVICES_NOT_AVAILABLE' || text.toLowerCase().includes('play services')) {
    return 'play_services';
  }
  if (message === 'BACKUP_TOO_LARGE') {
    return 'too_large';
  }
  if (message === 'NO_BACKUP') {
    return 'no_backup';
  }
  if (
    isDriveAuthFailure(e) ||
    code === 'access_denied' ||
    message === 'DRIVE_SCOPE_DENIED' ||
    text.includes('access_denied')
  ) {
    return 'denied';
  }
  return 'unknown';
}
