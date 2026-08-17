import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const WEB_CLIENT_ID = '968016048983-idm80idaavnentgb1rn8fpvu6f8hf7r9.apps.googleusercontent.com';

let configured = false;

function ensureConfigured() {
  if (!configured) {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.appdata'],
      webClientId: WEB_CLIENT_ID,
    });
    configured = true;
  }
}

export async function getGoogleToken(): Promise<string> {
  ensureConfigured();

  if (GoogleSignin.hasPreviousSignIn()) {
    try {
      const tokens = await GoogleSignin.getTokens();
      return tokens.accessToken;
    } catch {
      // токен истёк или невалиден — авторизуемся заново
    }
  }

  const response = await GoogleSignin.signIn();

  if (response.type === 'cancelled') {
    throw Object.assign(new Error('Sign in cancelled'), { code: statusCodes.SIGN_IN_CANCELLED });
  }

  const tokens = await GoogleSignin.getTokens();
  return tokens.accessToken;
}

export async function signOutGoogle(): Promise<void> {
  ensureConfigured();
  await GoogleSignin.signOut();
}
