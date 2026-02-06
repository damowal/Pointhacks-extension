'use strict';

// ─── Cloud Sync Module ────────────────────────────────────────────────────────
// Handles syncing profile data to Firebase Firestore.

const SYNC_DEBOUNCE_MS = 2000;
let syncTimer = null;
let isSyncing = false;

// ─── Firestore REST API Endpoints ─────────────────────────────────────────────

function getFirestoreUrl(userId) {
  return `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/profiles/${userId}`;
}

// ─── Sync to Cloud ────────────────────────────────────────────────────────────

async function syncToCloud(profile) {
  const { authUser, authToken } = await chrome.storage.local.get(['authUser', 'authToken']);

  if (!authUser || !authToken) {
    return { success: false, error: 'Not authenticated' };
  }

  if (isSyncing) {
    return { success: false, error: 'Sync in progress' };
  }

  try {
    isSyncing = true;
    updateSyncStatus('syncing');

    const firestoreDoc = profileToFirestore(profile);

    const response = await fetch(getFirestoreUrl(authUser.uid), {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(firestoreDoc)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Sync failed');
    }

    // Update local storage with sync timestamp
    await chrome.storage.local.set({
      profile,
      lastSyncTimestamp: Date.now()
    });

    updateSyncStatus('synced');
    return { success: true };

  } catch (error) {
    console.error('Sync to cloud failed:', error);
    updateSyncStatus('error');
    return { success: false, error: error.message };

  } finally {
    isSyncing = false;
  }
}

// ─── Fetch from Cloud ─────────────────────────────────────────────────────────

async function fetchFromCloud() {
  const { authUser, authToken } = await chrome.storage.local.get(['authUser', 'authToken']);

  if (!authUser || !authToken) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    updateSyncStatus('syncing');

    const response = await fetch(getFirestoreUrl(authUser.uid), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.status === 404) {
      // Document doesn't exist yet
      updateSyncStatus('synced');
      return { success: true, profile: null };
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Fetch failed');
    }

    const doc = await response.json();
    const profile = firestoreToProfile(doc);

    updateSyncStatus('synced');
    return { success: true, profile };

  } catch (error) {
    console.error('Fetch from cloud failed:', error);
    updateSyncStatus('error');
    return { success: false, error: error.message };
  }
}

// ─── Conflict Resolution ──────────────────────────────────────────────────────

async function resolveConflict() {
  const { authUser, authToken } = await chrome.storage.local.get(['authUser', 'authToken']);

  if (!authUser || !authToken) {
    updateSyncStatus('local');
    return { useCloud: false };
  }

  try {
    // Get local data
    const { profile: localProfile, lastSyncTimestamp } =
      await chrome.storage.local.get(['profile', 'lastSyncTimestamp']);

    // Get cloud data
    const response = await fetch(getFirestoreUrl(authUser.uid), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.status === 404) {
      // No cloud data, use local
      updateSyncStatus('local');
      return { useCloud: false, localProfile };
    }

    if (!response.ok) {
      // Cloud unavailable, use local silently
      updateSyncStatus('local');
      return { useCloud: false, localProfile };
    }

    const doc = await response.json();
    const cloudProfile = firestoreToProfile(doc);

    // Get cloud timestamp
    const cloudTimestamp = doc.fields?._lastModified?.timestampValue
      ? new Date(doc.fields._lastModified.timestampValue).getTime()
      : 0;
    const localTimestamp = lastSyncTimestamp || 0;

    // If cloud is newer, use cloud data
    if (cloudTimestamp > localTimestamp) {
      updateSyncStatus('synced');
      return { useCloud: true, cloudProfile };
    }

    // Local is newer or same, use local
    updateSyncStatus('synced');
    return { useCloud: false, localProfile };

  } catch (error) {
    console.error('Conflict resolution failed:', error);
    updateSyncStatus('local');
    return { useCloud: false };
  }
}

// ─── Auto-Sync ────────────────────────────────────────────────────────────────

function scheduleAutoSync(profile) {
  if (syncTimer) clearTimeout(syncTimer);

  syncTimer = setTimeout(async () => {
    const { authUser } = await chrome.storage.local.get(['authUser']);
    if (authUser) {
      await syncToCloud(profile);
    }
  }, SYNC_DEBOUNCE_MS);
}

// ─── Offline Queue ────────────────────────────────────────────────────────────

async function queueForSync(profile) {
  if (!navigator.onLine) {
    const { offlineQueue = [] } = await chrome.storage.local.get(['offlineQueue']);
    offlineQueue.push({
      profile,
      timestamp: Date.now()
    });
    await chrome.storage.local.set({ offlineQueue });
    updateSyncStatus('offline');
    return;
  }

  await syncToCloud(profile);
}

async function processOfflineQueue() {
  const { offlineQueue } = await chrome.storage.local.get(['offlineQueue']);

  if (!offlineQueue || offlineQueue.length === 0) return;

  // Get the latest queued profile (most recent changes)
  const latest = offlineQueue[offlineQueue.length - 1];

  const result = await syncToCloud(latest.profile);

  if (result.success) {
    // Clear queue
    await chrome.storage.local.remove(['offlineQueue']);
  }
}

// Listen for online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    await processOfflineQueue();
  });

  window.addEventListener('offline', () => {
    updateSyncStatus('offline');
  });
}

// ─── Firestore Data Conversion ────────────────────────────────────────────────

function profileToFirestore(profile) {
  const fields = {};

  // Convert each profile field to Firestore format
  for (const [key, value] of Object.entries(profile)) {
    if (value !== undefined && value !== null && value !== '') {
      fields[key] = { stringValue: String(value) };
    }
  }

  // Add metadata
  fields._lastModified = {
    timestampValue: new Date().toISOString()
  };
  fields._device = {
    stringValue: 'chrome-extension'
  };

  return { fields };
}

function firestoreToProfile(doc) {
  const profile = {};

  if (!doc.fields) return profile;

  for (const [key, value] of Object.entries(doc.fields)) {
    // Skip metadata fields
    if (key.startsWith('_')) continue;

    // Extract string value
    if (value.stringValue !== undefined) {
      profile[key] = value.stringValue;
    }
  }

  return profile;
}

// ─── UI Updates ───────────────────────────────────────────────────────────────

function updateSyncStatus(status) {
  const syncIcon = document.getElementById('syncIcon');
  const syncText = document.getElementById('syncText');
  const syncBar = document.getElementById('syncBar');

  if (!syncIcon || !syncText || !syncBar) return;

  const states = {
    synced: { icon: '\u2601', text: 'Synced to cloud', class: 'synced' },
    syncing: { icon: '\u21BB', text: 'Syncing...', class: 'syncing' },
    offline: { icon: '\u26A0', text: 'Offline', class: 'offline' },
    error: { icon: '\uD83D\uDCBE', text: 'Saved locally', class: '' },
    local: { icon: '\uD83D\uDCBE', text: 'Saved locally', class: '' }
  };

  const state = states[status] || states.local;

  syncIcon.textContent = state.icon;
  syncText.textContent = state.text;
  syncBar.className = 'sync-bar ' + state.class;
}
