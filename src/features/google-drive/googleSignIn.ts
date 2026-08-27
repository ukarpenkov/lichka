import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import {
  DRIVE_APPDATA_SCOPE,
  hasDriveAppDataScope,
  isGoogleSignInCancelled,
} from './driveErrors';

const WEB_CLIENT_ID = '968016048983-idm80idaavnentgb1rn8fpvu6f8hf7r9.apps.googleusercontent.com';

function ensureConfigured() {
  GoogleSignin.configure({
    scopes: [DRIVE_APPDATA_SCOPE],
    // Android: do not pass webClientId. GMS GetToken (ID-token) was rejecting our Web
    // client (DEVELOPER_ERROR / "You must use a Web client as the server client ID") —
    // Drive only needs an access token from the Android OAuth client + SHA-1.
    ...(Platform.OS === 'ios' ? { webClientId: WEB_CLIENT_ID } : {}),
  });
}

function throwCancelled(): never {
  throw Object.assign(new Error('Sign in cancelled'), { code: statusCodes.SIGN_IN_CANCELLED });
}

async function signInInteractive() {
  const response = await GoogleSignin.signIn();
  console.log(
    '[google-drive] signIn response type:',
    response?.type,
    'user:',
    response?.type === 'success' ? response.data?.user?.email : undefined,
  );
  if (response.type === 'cancelled') {
    throwCancelled();
  }
  return response.data;
}

async function ensureDriveScope() {
  const scoped = await GoogleSignin.addScopes({ scopes: [DRIVE_APPDATA_SCOPE] });
  if (scoped?.type === 'cancelled') {
    throwCancelled();
  }
  const scopes = scoped?.type === 'success' ? scoped.data?.scopes : GoogleSignin.getCurrentUser()?.scopes;
  console.log('[google-drive] granted scopes:', scopes);
  if (!hasDriveAppDataScope(scopes)) {
    throw Object.assign(new Error('DRIVE_SCOPE_DENIED'), { code: 'access_denied' });
  }
}

async function obtainAccessToken(): Promise<string> {
  if (!GoogleSignin.getCurrentUser()) {
    await signInInteractive();
  }

  await ensureDriveScope();

  const tokens = await GoogleSignin.getTokens();
  console.log('[google-drive] access token length', tokens.accessToken?.length);
  if (!tokens?.accessToken) {
    throw new Error('NO_ACCESS_TOKEN');
  }
  return tokens.accessToken;
}

export async function getGoogleToken(): Promise<string> {
  ensureConfigured();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const hadSession = GoogleSignin.hasPreviousSignIn();
  console.log('[google-drive] signIn: hasPreviousSignIn =', hadSession);

  try {
    return await obtainAccessToken();
  } catch (e: unknown) {
    if (isGoogleSignInCancelled(e)) {
      throwCancelled();
    }
    if (!hadSession) {
      console.error('[google-drive] getGoogleToken failed:', (e as Error)?.message, (e as { code?: string })?.code ?? '');
      throw e;
    }
    console.warn(
      '[google-drive] stored session rejected, re-authenticating:',
      (e as Error)?.message,
      (e as { code?: string })?.code ?? '',
    );
    try {
      await GoogleSignin.signOut();
    } catch {
      // best-effort; interactive sign-in follows
    }
    return obtainAccessToken();
  }
}

export async function signOutGoogle(): Promise<void> {
  ensureConfigured();
  await GoogleSignin.signOut();
}
