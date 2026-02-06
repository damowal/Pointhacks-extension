'use strict';

// ─── Field Configuration ──────────────────────────────────────────────────────
const FIELD_IDS = [
  // Personal
  'salutation', 'gender', 'firstName', 'middleName', 'lastName',
  'dob', 'maritalStatus', 'dependents', 'email', 'phone', 'citizenship',
  // Address
  'address1', 'address2', 'suburb', 'state', 'postcode', 'yearsAtAddress', 'residentialStatus',
  // Employment
  'employmentStatus', 'employmentType', 'employer', 'employerPhone', 'occupation', 'industry', 'yearsAtEmployer',
  // Financials - Income
  'annualIncome', 'otherIncome',
  // Financials - Expenses
  'rentMortgage', 'groceries', 'transport', 'utilities', 'insurance', 'entertainment', 'childcare', 'education', 'monthlyExpenses',
  // Assets & Liabilities
  'propertyValue', 'vehicleValue', 'savings', 'totalCreditLimit', 'creditCardBalance', 'numCreditCards', 'loanBalance', 'loanRepayment', 'bnplBalance',
  // Identity
  'licenceNumber', 'licenceState', 'passportNumber', 'passportCountry', 'medicareNumber', 'medicareRef'
];

// Fields that should display with thousand separators
const MONEY_FIELDS = [
  'annualIncome', 'otherIncome', 'rentMortgage', 'groceries', 'transport', 'utilities', 'insurance',
  'entertainment', 'childcare', 'education', 'monthlyExpenses', 'propertyValue', 'vehicleValue',
  'savings', 'totalCreditLimit', 'creditCardBalance', 'loanBalance', 'loanRepayment', 'bnplBalance'
];

// ─── Initialization ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Check auth state first
  showLoading('Checking account...');
  const authState = await checkAuthState();
  hideLoading();

  if (authState.authenticated) {
    await initAuthenticatedView(authState.user);
  } else {
    showAuthView();
  }

  // Set up event listeners
  setupAuthListeners();
  setupFormListeners();
});

async function initAuthenticatedView(user) {
  showMainView(user);
  await loadProfile();
  detectCurrentBank();
  initAddressLookup();
}

// ─── View Management ──────────────────────────────────────────────────────────
function showAuthView() {
  document.getElementById('authView').style.display = 'block';
  document.getElementById('mainView').style.display = 'none';
  document.getElementById('userIndicator').classList.remove('visible');
}

function showMainView(user) {
  document.getElementById('authView').style.display = 'none';
  document.getElementById('mainView').style.display = 'flex';

  // Update user indicator
  const indicator = document.getElementById('userIndicator');
  indicator.classList.add('visible');

  // Set email
  const emailEl = document.getElementById('userEmail');
  emailEl.textContent = user.email ? user.email.split('@')[0] : 'User';

  // Set avatar or initial
  const avatarEl = document.getElementById('userAvatar');
  const initialEl = document.getElementById('userInitial');

  if (user.photoURL) {
    avatarEl.src = user.photoURL;
    avatarEl.classList.add('visible');
    initialEl.classList.add('hidden');
  } else {
    avatarEl.classList.remove('visible');
    initialEl.classList.remove('hidden');
    initialEl.textContent = (user.email || 'U')[0].toUpperCase();
  }
}

function showLoading(message = 'Loading...') {
  const overlay = document.getElementById('loadingOverlay');
  document.getElementById('loadingText').textContent = message;
  overlay.classList.add('visible');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('visible');
}

// ─── Auth Event Listeners ─────────────────────────────────────────────────────
function setupAuthListeners() {
  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.getElementById('loginForm').style.display =
        targetTab === 'login' ? 'flex' : 'none';
      document.getElementById('signupForm').style.display =
        targetTab === 'signup' ? 'flex' : 'none';

      // Clear auth message
      showAuthMsg('', '');
    });
  });

  // Email login
  document.getElementById('emailLoginBtn')?.addEventListener('click', handleEmailLogin);
  document.getElementById('loginPassword')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleEmailLogin();
  });

  // Email signup
  document.getElementById('emailSignupBtn')?.addEventListener('click', handleEmailSignup);
  document.getElementById('signupConfirm')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleEmailSignup();
  });

  // OAuth buttons (login)
  document.getElementById('googleLoginBtn')?.addEventListener('click', () => handleOAuthLogin('google'));
  document.getElementById('appleLoginBtn')?.addEventListener('click', () => handleOAuthLogin('apple'));
  document.getElementById('facebookLoginBtn')?.addEventListener('click', () => handleOAuthLogin('facebook'));

  // OAuth buttons (signup - same flow)
  document.getElementById('googleSignupBtn')?.addEventListener('click', () => handleOAuthLogin('google'));
  document.getElementById('appleSignupBtn')?.addEventListener('click', () => handleOAuthLogin('apple'));
  document.getElementById('facebookSignupBtn')?.addEventListener('click', () => handleOAuthLogin('facebook'));

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  // Forgot password
  document.getElementById('forgotPasswordLink')?.addEventListener('click', handleForgotPassword);
}

async function handleEmailLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showAuthMsg('Please enter email and password.', 'error');
    return;
  }

  showLoading('Signing in...');
  const result = await signInWithEmail(email, password);
  hideLoading();

  if (result.success) {
    await initAuthenticatedView(result.user);
  } else {
    showAuthMsg(result.error, 'error');
  }
}

async function handleEmailSignup() {
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;

  if (!email || !password) {
    showAuthMsg('Please enter email and password.', 'error');
    return;
  }

  if (password !== confirm) {
    showAuthMsg('Passwords do not match.', 'error');
    return;
  }

  if (password.length < 6) {
    showAuthMsg('Password must be at least 6 characters.', 'error');
    return;
  }

  showLoading('Creating account...');
  const result = await signUpWithEmail(email, password);
  hideLoading();

  if (result.success) {
    await initAuthenticatedView(result.user);
  } else {
    showAuthMsg(result.error, 'error');
  }
}

async function handleOAuthLogin(provider) {
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
  showLoading(`Connecting to ${providerName}...`);

  const result = await signInWithOAuth(provider);
  hideLoading();

  if (result.success) {
    await initAuthenticatedView(result.user);
  } else {
    showAuthMsg(result.error, 'error');
  }
}

async function handleLogout() {
  showLoading('Signing out...');
  await signOut();
  hideLoading();
  showAuthView();

  // Clear form fields
  FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();

  if (!email) {
    showAuthMsg('Enter your email first.', 'error');
    return;
  }

  showLoading('Sending reset email...');
  const result = await sendPasswordReset(email);
  hideLoading();

  if (result.success) {
    showAuthMsg('Password reset email sent. Check your inbox.', 'success');
  } else {
    showAuthMsg(result.error, 'error');
  }
}

function showAuthMsg(text, type) {
  const el = document.getElementById('authMessageArea');
  el.textContent = text;
  el.className = 'message-area ' + (type || '');
}

// ─── Form Event Listeners ─────────────────────────────────────────────────────
function setupFormListeners() {
  document.getElementById('saveBtn')?.addEventListener('click', onSave);
  document.getElementById('fillBtn')?.addEventListener('click', onFill);
  document.getElementById('syncBtn')?.addEventListener('click', onSyncToCloud);

  // Open all bank sites at once
  document.getElementById('openAllBanksBtn')?.addEventListener('click', () => {
    const bankUrls = [
      'https://www.anz.com.au/personal/credit-cards/',
      'https://www.nab.com.au/personal/credit-cards',
      'https://www.commbank.com.au/credit-cards.html',
      'https://www.westpac.com.au/personal-banking/credit-cards/',
      'https://www.americanexpress.com/au/credit-cards/'
    ];
    bankUrls.forEach(url => chrome.tabs.create({ url, active: false }));
  });

  // Auto-sync on field change (debounced)
  FIELD_IDS.forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      const profile = readProfile();
      scheduleAutoSync(profile);
    });
  });
}

// ─── Profile Management ───────────────────────────────────────────────────────
async function loadProfile() {
  // First try to resolve conflicts with cloud
  const { authUser } = await chrome.storage.local.get(['authUser']);

  if (authUser) {
    const { useCloud, cloudProfile, localProfile } = await resolveConflict();

    if (useCloud && cloudProfile) {
      loadProfileToForm(cloudProfile);
      await chrome.storage.local.set({ profile: cloudProfile });
      return;
    }

    if (localProfile) {
      loadProfileToForm(localProfile);
      return;
    }
  }

  // Fall back to local storage
  const { profile } = await chrome.storage.local.get(['profile']);
  if (profile) {
    loadProfileToForm(profile);
  }
}

function loadProfileToForm(profile) {
  FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && profile[id] != null) {
      // Format money fields with commas
      if (MONEY_FIELDS.includes(id)) {
        el.value = formatNumberWithCommas(profile[id]);
      } else {
        el.value = profile[id];
      }
    }
  });
}

function readProfile() {
  const out = {};
  FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      let value = el.value.trim();
      // Strip commas from money fields for storage
      if (MONEY_FIELDS.includes(id)) {
        value = stripCommas(value);
      }
      out[id] = value;
    }
  });
  return out;
}

async function saveProfile(profile) {
  await chrome.storage.local.set({ profile });
}

async function onSave() {
  const profile = readProfile();
  await saveProfile(profile);
  showMsg('Profile saved locally.', 'success');
}

async function onSyncToCloud() {
  const profile = readProfile();

  // Save locally first
  await saveProfile(profile);

  // Then sync to cloud
  const result = await syncToCloud(profile);

  if (result.success) {
    showMsg('Profile synced to cloud.', 'success');
  } else {
    showMsg('Sync failed: ' + result.error, 'error');
  }
}

// ─── Bank Detection ───────────────────────────────────────────────────────────
let currentBank = null;

async function detectCurrentBank() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const res = await chrome.tabs.sendMessage(tab.id, { type: 'DETECT_BANK' });
    if (res && res.bank) {
      currentBank = res.bank;
      setStatusOn(res.bank);
    } else {
      setStatusOff();
    }
  } catch (_) {
    setStatusOff();
  }
}

function setStatusOn(bankName) {
  document.getElementById('statusDot').className = 'status-dot on';
  document.getElementById('statusText').innerHTML =
    'On <strong>' + escapeHtml(bankName) + '</strong> &mdash; ready to fill';

  // Highlight the matching chip
  document.querySelectorAll('.bank-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.bank === bankName);
  });
}

function setStatusOff() {
  document.getElementById('statusDot').className = 'status-dot off';
  document.getElementById('statusText').textContent =
    'Open a supported bank application page to begin';
  document.querySelectorAll('.bank-chip').forEach(c => c.classList.remove('active'));
}

// ─── Fill Handler ─────────────────────────────────────────────────────────────
async function onFill() {
  const profile = readProfile();
  await saveProfile(profile);  // always persist before filling

  // Validate: at least a name must be present
  if (!profile.firstName && !profile.lastName) {
    showMsg('Enter at least your name first.', 'error');
    return;
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const res = await chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORM', profile });

    if (res && res.filledCount > 0) {
      showMsg('Filled ' + res.filledCount + ' field' + (res.filledCount !== 1 ? 's' : '') +
              ' on ' + res.bank, 'success');
    } else {
      showMsg('No matching form fields found on this page.', 'info');
    }
  } catch (_) {
    showMsg('Navigate to a credit card application page on a supported bank first.', 'error');
  }
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function showMsg(text, type) {
  const el = document.getElementById('messageArea');
  el.textContent = text;
  el.className = 'message-area ' + (type || 'info');
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── Income Formatting ────────────────────────────────────────────────────────
function formatNumberWithCommas(value) {
  // Remove non-digits
  const num = value.replace(/[^\d]/g, '');
  // Add commas for thousands
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function stripCommas(value) {
  return value.replace(/,/g, '');
}

// Set up money field formatting (commas for thousands)
function initMoneyFormatting() {
  MONEY_FIELDS.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.addEventListener('input', (e) => {
      const cursorPos = e.target.selectionStart;
      const oldCommas = (e.target.value.match(/,/g) || []).length;

      e.target.value = formatNumberWithCommas(e.target.value);

      const newCommas = (e.target.value.match(/,/g) || []).length;
      const newCursorPos = cursorPos + (newCommas - oldCommas);
      e.target.setSelectionRange(newCursorPos, newCursorPos);
    });
  });
}

// Initialize money formatting when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMoneyFormatting);
} else {
  initMoneyFormatting();
}
