'use strict';

// ─── Firebase Auth Module ─────────────────────────────────────────────────────
// Handles email/password authentication and auth state management.
// OAuth flows are handled by background.js via chrome.identity API.

// Auth state
let currentUser = null;

// ─── Email/Password Authentication ────────────────────────────────────────────

async function signInWithEmail(email, password) {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: mapAuthError(data.error?.message) };
    }

    const user = {
      uid: data.localId,
      email: data.email,
      displayName: data.displayName || null,
      photoURL: null,
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn
    };

    await storeAuthState(user);
    currentUser = user;

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

async function signUpWithEmail(email, password) {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_CONFIG.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: mapAuthError(data.error?.message) };
    }

    const user = {
      uid: data.localId,
      email: data.email,
      displayName: null,
      photoURL: null,
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn
    };

    await storeAuthState(user);
    currentUser = user;

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

async function sendPasswordReset(email) {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_CONFIG.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: mapAuthError(data.error?.message) };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

async function signOut() {
  try {
    await chrome.storage.local.remove(['authUser', 'authToken', 'authTimestamp', 'authRefreshToken']);
    currentUser = null;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ─── OAuth Sign-In (via background.js) ────────────────────────────────────────

async function signInWithOAuth(provider) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'OAUTH_SIGNIN',
      provider
    });

    if (response.success) {
      currentUser = response.user;
    }

    return response;
  } catch (error) {
    return { success: false, error: 'OAuth sign-in failed. Please try again.' };
  }
}

// ─── Auth State Management ────────────────────────────────────────────────────

async function storeAuthState(user) {
  await chrome.storage.local.set({
    authUser: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    },
    authToken: user.idToken,
    authRefreshToken: user.refreshToken,
    authTimestamp: Date.now()
  });
}

async function checkAuthState() {
  try {
    const { authUser, authToken, authTimestamp, authRefreshToken } =
      await chrome.storage.local.get(['authUser', 'authToken', 'authTimestamp', 'authRefreshToken']);

    if (!authUser || !authToken) {
      return { authenticated: false };
    }

    // Token expires after 1 hour, refresh if older than 50 mins
    const TOKEN_REFRESH_THRESHOLD = 50 * 60 * 1000;
    if (Date.now() - authTimestamp > TOKEN_REFRESH_THRESHOLD && authRefreshToken) {
      const refreshResult = await refreshIdToken(authRefreshToken);
      if (!refreshResult.success) {
        return { authenticated: false, requiresReauth: true };
      }
    }

    currentUser = {
      ...authUser,
      idToken: authToken
    };

    return { authenticated: true, user: authUser };
  } catch (error) {
    return { authenticated: false };
  }
}

async function refreshIdToken(refreshToken) {
  try {
    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_CONFIG.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false };
    }

    await chrome.storage.local.set({
      authToken: data.id_token,
      authRefreshToken: data.refresh_token,
      authTimestamp: Date.now()
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

async function getIdToken() {
  const { authToken } = await chrome.storage.local.get(['authToken']);
  return authToken;
}

function getCurrentUser() {
  return currentUser;
}

// ─── Error Mapping ────────────────────────────────────────────────────────────

function mapAuthError(errorCode) {
  const errorMap = {
    'INVALID_EMAIL': 'Invalid email address.',
    'EMAIL_NOT_FOUND': 'No account found with this email.',
    'INVALID_PASSWORD': 'Incorrect password.',
    'INVALID_LOGIN_CREDENTIALS': 'Invalid email or password.',
    'USER_DISABLED': 'This account has been disabled.',
    'EMAIL_EXISTS': 'An account already exists with this email.',
    'WEAK_PASSWORD': 'Password must be at least 6 characters.',
    'TOO_MANY_ATTEMPTS_TRY_LATER': 'Too many attempts. Please try again later.',
    'OPERATION_NOT_ALLOWED': 'Email/password sign-in is not enabled.'
  };

  // Handle messages like "WEAK_PASSWORD : Password should be at least 6 characters"
  const baseCode = errorCode?.split(' ')[0];
  return errorMap[baseCode] || errorMap[errorCode] || 'Authentication failed. Please try again.';
}
