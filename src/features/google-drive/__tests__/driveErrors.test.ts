import { DriveApiError } from '../googleDrive';
import {
  classifyDriveError,
  hasDriveAppDataScope,
  isDriveAuthFailure,
  isGoogleSignInCancelled,
} from '../driveErrors';

describe('hasDriveAppDataScope', () => {
  it('returns true when drive.appdata is among granted scopes', () => {
    expect(
      hasDriveAppDataScope([
        'email',
        'https://www.googleapis.com/auth/drive.appdata',
      ]),
    ).toBe(true);
  });

  it('returns false when drive.appdata is missing', () => {
    expect(hasDriveAppDataScope(['email', 'profile'])).toBe(false);
    expect(hasDriveAppDataScope(undefined)).toBe(false);
    expect(hasDriveAppDataScope(null)).toBe(false);
  });
});

describe('isGoogleSignInCancelled', () => {
  it('treats native 12501 and SIGN_IN_CANCELLED as cancel', () => {
    expect(isGoogleSignInCancelled({ code: '12501' })).toBe(true);
    expect(isGoogleSignInCancelled({ code: 'SIGN_IN_CANCELLED' })).toBe(true);
    expect(isGoogleSignInCancelled(Object.assign(new Error('Sign in cancelled'), { code: '12501' }))).toBe(
      true,
    );
  });

  it('does not treat other errors as cancel', () => {
    expect(isGoogleSignInCancelled({ code: '10', message: 'DEVELOPER_ERROR' })).toBe(false);
    expect(isGoogleSignInCancelled(new Error('Upload failed: 403'))).toBe(false);
  });
});

describe('classifyDriveError', () => {
  it('classifies developer, play services, size and missing backup', () => {
    expect(classifyDriveError({ code: '10', message: 'DEVELOPER_ERROR' })).toBe('developer');
    expect(classifyDriveError({ code: 'PLAY_SERVICES_NOT_AVAILABLE' })).toBe('play_services');
    expect(classifyDriveError(new Error('BACKUP_TOO_LARGE'))).toBe('too_large');
    expect(classifyDriveError(new Error('NO_BACKUP'))).toBe('no_backup');
    expect(classifyDriveError({ code: '12501' })).toBe('cancelled');
  });

  it('classifies Drive 401/403 without fieldNotWritable as denied', () => {
    expect(classifyDriveError(new DriveApiError(401, 'Invalid Credentials', 'List files'))).toBe('denied');
    expect(
      classifyDriveError(new DriveApiError(403, '{"error":{"message":"insufficientPermissions"}}', 'Upload')),
    ).toBe('denied');
    expect(classifyDriveError(new Error('DRIVE_SCOPE_DENIED'))).toBe('denied');
    expect(classifyDriveError(Object.assign(new Error('DRIVE_SCOPE_DENIED'), { code: 'access_denied' }))).toBe(
      'denied',
    );
  });

  it('does not treat PATCH parents 403 as auth failure', () => {
    const err = new DriveApiError(403, 'The parents field is not directly writable fieldNotWritable', 'Upload');
    expect(isDriveAuthFailure(err)).toBe(false);
    expect(classifyDriveError(err)).toBe('unknown');
  });
});
