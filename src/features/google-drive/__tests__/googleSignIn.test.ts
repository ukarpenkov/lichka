import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { getGoogleToken } from '../googleSignIn';

const signIn = GoogleSignin.signIn as jest.Mock;
const addScopes = GoogleSignin.addScopes as jest.Mock;
const getTokens = GoogleSignin.getTokens as jest.Mock;
const getCurrentUser = GoogleSignin.getCurrentUser as jest.Mock;
const hasPreviousSignIn = GoogleSignin.hasPreviousSignIn as jest.Mock;
const hasPlayServices = GoogleSignin.hasPlayServices as jest.Mock;
const signOut = GoogleSignin.signOut as jest.Mock;

const driveUser = {
  user: { id: '1', email: 'test@example.com' },
  scopes: ['https://www.googleapis.com/auth/drive.appdata'],
};

beforeEach(() => {
  jest.clearAllMocks();
  hasPlayServices.mockResolvedValue(true);
  hasPreviousSignIn.mockReturnValue(false);
  getCurrentUser.mockReturnValue(null);
  signIn.mockResolvedValue({ type: 'success', data: driveUser });
  addScopes.mockResolvedValue({ type: 'success', data: driveUser });
  getTokens.mockResolvedValue({ accessToken: 'ya29.token', idToken: null });
  signOut.mockResolvedValue(null);
});

describe('getGoogleToken', () => {
  it('signs in, requests drive.appdata, and returns the access token', async () => {
    await expect(getGoogleToken()).resolves.toBe('ya29.token');

    expect(hasPlayServices).toHaveBeenCalledWith({ showPlayServicesUpdateDialog: true });
    expect(GoogleSignin.configure).toHaveBeenCalledWith(
      expect.objectContaining({
        scopes: ['https://www.googleapis.com/auth/drive.appdata'],
      }),
    );
    expect(signIn).toHaveBeenCalled();
    expect(addScopes).toHaveBeenCalledWith({
      scopes: ['https://www.googleapis.com/auth/drive.appdata'],
    });
    expect(getTokens).toHaveBeenCalled();
  });

  it('skips the account picker when a user is already signed in', async () => {
    getCurrentUser.mockReturnValue(driveUser);

    await expect(getGoogleToken()).resolves.toBe('ya29.token');

    expect(signIn).not.toHaveBeenCalled();
    expect(addScopes).toHaveBeenCalled();
  });

  it('throws cancelled when the user dismisses the account picker', async () => {
    signIn.mockResolvedValue({ type: 'cancelled', data: null });

    await expect(getGoogleToken()).rejects.toMatchObject({
      message: 'Sign in cancelled',
      code: statusCodes.SIGN_IN_CANCELLED,
    });
    expect(getTokens).not.toHaveBeenCalled();
  });

  it('throws cancelled when addScopes is dismissed', async () => {
    addScopes.mockResolvedValue({ type: 'cancelled', data: null });

    await expect(getGoogleToken()).rejects.toMatchObject({
      code: statusCodes.SIGN_IN_CANCELLED,
    });
  });

  it('throws when drive.appdata is not granted', async () => {
    addScopes.mockResolvedValue({
      type: 'success',
      data: { user: driveUser.user, scopes: ['email'] },
    });
    getCurrentUser.mockReturnValue({ user: driveUser.user, scopes: ['email'] });

    await expect(getGoogleToken()).rejects.toMatchObject({
      message: 'DRIVE_SCOPE_DENIED',
      code: 'access_denied',
    });
  });

  it('signs out and retries when a previous session cannot get a token', async () => {
    hasPreviousSignIn.mockReturnValue(true);
    getCurrentUser.mockReturnValueOnce(driveUser).mockReturnValue(null);
    getTokens.mockRejectedValueOnce(new Error('NeedPermission')).mockResolvedValueOnce({
      accessToken: 'ya29.fresh',
      idToken: null,
    });

    await expect(getGoogleToken()).resolves.toBe('ya29.fresh');

    expect(signOut).toHaveBeenCalled();
    expect(signIn).toHaveBeenCalled();
    expect(getTokens).toHaveBeenCalledTimes(2);
  });
});
