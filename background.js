'use strict';

// ─── Background Service Worker ────────────────────────────────────────────────

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD_IXmN9yG7lp_UnmnkgDpcqjPFFZ20T-U",
  authDomain: "ph-extension.firebaseapp.com",
  projectId: "ph-extension"
};

const GOOGLE_CLIENT_ID = "818312745540-msbdo8e6njc0tqko98mbvdko42bod1f7.apps.googleusercontent.com";

// ─── Message Handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OAUTH_SIGNIN') {
    // Handle async properly
    (async () => {
      try {
        const result = await handleOAuthSignIn(message.provider);
        sendResponse(result);
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }

  if (message.type === 'GET_AUTH_STATE') {
    chrome.storage.local.get(['authUser', 'authToken']).then(sendResponse);
    return true;
  }
});

// ─── OAuth Sign-In Handler ────────────────────────────────────────────────────

async function handleOAuthSignIn(provider) {
  if (provider === 'google') {
    return await handleGoogleSignIn();
  } else if (provider === 'facebook') {
    return { success: false, error: 'Facebook login not configured.' };
  } else if (provider === 'apple') {
    return { success: false, error: 'Apple login not configured.' };
  }
  return { success: false, error: 'Unknown provider' };
}

// ─── Google Sign-In ───────────────────────────────────────────────────────────

async function handleGoogleSignIn() {
  const redirectUri = chrome.identity.getRedirectURL();
  console.log('Redirect URI:', redirectUri);

  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    'client_id=' + encodeURIComponent(GOOGLE_CLIENT_ID) +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&response_type=token' +
    '&scope=' + encodeURIComponent('email profile') +
    '&prompt=select_account';

  console.log('Starting OAuth flow...');

  let responseUrl;
  try {
    responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    });
  } catch (err) {
    console.error('launchWebAuthFlow error:', err);
    return { success: false, error: err.message || 'OAuth window closed' };
  }

  console.log('Response URL:', responseUrl);

  if (!responseUrl) {
    return { success: false, error: 'No response from Google' };
  }

  // Parse the response
  const hashIndex = responseUrl.indexOf('#');
  if (hashIndex === -1) {
    return { success: false, error: 'Invalid response format' };
  }

  const hashParams = new URLSearchParams(responseUrl.substring(hashIndex + 1));
  const accessToken = hashParams.get('access_token');
  const error = hashParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return { success: false, error: error };
  }

  if (!accessToken) {
    return { success: false, error: 'No access token received' };
  }

  console.log('Got access token, signing in to Firebase...');

  // Exchange with Firebase
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_CONFIG.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postBody: `access_token=${accessToken}&providerId=google.com`,
          requestUri: redirectUri,
          returnSecureToken: true,
          returnIdpCredential: true
        })
      }
    );

    const data = await response.json();
    console.log('Firebase response:', response.ok, data);

    if (!response.ok) {
      return { success: false, error: data.error?.message || 'Firebase auth failed' };
    }

    const user = {
      uid: data.localId,
      email: data.email,
      displayName: data.displayName || data.fullName || '',
      photoURL: data.photoUrl || null
    };

    // Store auth state
    await chrome.storage.local.set({
      authUser: user,
      authToken: data.idToken,
      authRefreshToken: data.refreshToken,
      authTimestamp: Date.now()
    });

    console.log('Auth successful:', user.email);
    return { success: true, user };

  } catch (err) {
    console.error('Firebase exchange error:', err);
    return { success: false, error: err.message };
  }
}
