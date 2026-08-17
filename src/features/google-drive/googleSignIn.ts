import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

const WEB_CLIENT_ID = '968016048983-idm80idaavnentgb1rn8fpvu6f8hf7r9.apps.googleusercontent.com';

let configured = false;

function ensureConfigured() {
  if (!configured) {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.appdata'],
      ...(Platform.OS === 'ios' ? { webClientId: WEB_CLIENT_ID } : {}),
    });
    console.log('[google-drive] configured for', Platform.OS);
    configured = true;
  }
}

export async function getGoogleToken(): Promise<string> {
  ensureConfigured();

  const hasPrevious = GoogleSignin.hasPreviousSignIn();
  console.log('[google-drive] signIn: hasPreviousSignIn =', hasPrevious);

  if (hasPrevious) {
    try {
      const tokens = await GoogleSignin.getTokens();
      console.log('[google-drive] signIn: reused stored tokens, length', tokens.accessToken?.length);
      return tokens.accessToken;
    } catch (e: any) {
      console.warn('[google-drive] signIn: stored tokens rejected, re-authenticating:', e?.message, e?.code ?? '');
    }
  }

  const response = await GoogleSignin.signIn();
  console.log('[google-drive] signIn response type:', response?.type, 'user:', response?.data?.user?.email);

  if (response.type === 'cancelled') {
    throw Object.assign(new Error('Sign in cancelled'), { code: statusCodes.SIGN_IN_CANCELLED });
  }

  const tokens = await GoogleSignin.getTokens();
  console.log('[google-drive] signIn: fresh token length', tokens.accessToken?.length);
  return tokens.accessToken;
}

export async function signOutGoogle(): Promise<void> {
  ensureConfigured();
  await GoogleSignin.signOut();
}
