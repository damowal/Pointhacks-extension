'use strict';

// ─── Firebase Configuration ───────────────────────────────────────────────────
// Point Hacks Extension - Firebase Project

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD_IXmN9yG7lp_UnmnkgDpcqjPFFZ20T-U",
  authDomain: "ph-extension.firebaseapp.com",
  projectId: "ph-extension",
  storageBucket: "ph-extension.firebasestorage.app",
  messagingSenderId: "818312745540",
  appId: "1:818312745540:web:98c5f02ea60db0aefc2211",
  measurementId: "G-WMCM579T4F"
};

// OAuth Provider Client IDs
// Configure these in Google Cloud Console & each provider's developer console
const OAUTH_CONFIG = {
  google: {
    clientId: "818312745540-msbdo8e6njc0tqko98mbvdko42bod1f7.apps.googleusercontent.com"
  },
  facebook: {
    appId: "YOUR_FACEBOOK_APP_ID"  // Get from developers.facebook.com
  },
  apple: {
    serviceId: "YOUR_APPLE_SERVICE_ID"  // Get from Apple Developer
  }
};

// Addressify API Configuration
// Get your API key from https://addressify.com.au
const ADDRESSIFY_CONFIG = {
  apiKey: "07dd686b-54e7-4eb9-807d-1ca910ce52a3",
  baseUrl: "https://api.addressify.com.au/address/autoComplete"
};

// Export configs for use in other modules
if (typeof window !== 'undefined') {
  window.FIREBASE_CONFIG = FIREBASE_CONFIG;
  window.OAUTH_CONFIG = OAUTH_CONFIG;
  window.ADDRESSIFY_CONFIG = ADDRESSIFY_CONFIG;
}
