'use strict';

// ─── Address Lookup Module ────────────────────────────────────────────────────
// Provides Australian address autocomplete using the Addressify API.

const ADDRESS_DEBOUNCE_MS = 300;
const ADDRESS_MIN_CHARS = 3;
const ADDRESS_MAX_RESULTS = 10;

let addressDebounceTimer = null;
let addressController = null;
let selectedIndex = -1;

// ─── Initialization ───────────────────────────────────────────────────────────

function initAddressLookup() {
  const searchInput = document.getElementById('addressSearch');
  const dropdown = document.getElementById('addressDropdown');

  if (!searchInput || !dropdown) return;

  // Input handler with debounce
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.trim();

    // Cancel previous timer
    if (addressDebounceTimer) clearTimeout(addressDebounceTimer);

    // Reset selection
    selectedIndex = -1;

    // Hide dropdown if term too short
    if (term.length < ADDRESS_MIN_CHARS) {
      hideAddressDropdown();
      return;
    }

    // Debounce the API call
    addressDebounceTimer = setTimeout(() => {
      fetchAddressSuggestions(term);
    }, ADDRESS_DEBOUNCE_MS);
  });

  // Keyboard navigation
  searchInput.addEventListener('keydown', handleAddressKeyNavigation);

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.field-autocomplete')) {
      hideAddressDropdown();
    }
  });

  // Focus handler
  searchInput.addEventListener('focus', () => {
    const term = searchInput.value.trim();
    if (term.length >= ADDRESS_MIN_CHARS) {
      const dropdown = document.getElementById('addressDropdown');
      if (dropdown.children.length > 0) {
        showAddressDropdown();
      }
    }
  });
}

// ─── API Calls ────────────────────────────────────────────────────────────────

async function fetchAddressSuggestions(term) {
  // Abort previous request
  if (addressController) {
    addressController.abort();
  }

  addressController = new AbortController();

  const url = `${ADDRESSIFY_CONFIG.baseUrl}?` + new URLSearchParams({
    api_key: ADDRESSIFY_CONFIG.apiKey,
    term: term,
    max_results: ADDRESS_MAX_RESULTS,
    info: 'true'
  });

  try {
    showAddressLoading();

    const response = await fetch(url, {
      signal: addressController.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const addresses = await response.json();
    renderAddressSuggestions(addresses);

  } catch (error) {
    if (error.name === 'AbortError') {
      return; // Request was cancelled, ignore
    }
    console.error('Address lookup failed:', error);
    showAddressError('Unable to fetch addresses');
  }
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function renderAddressSuggestions(addresses) {
  const dropdown = document.getElementById('addressDropdown');

  if (!addresses || addresses.length === 0) {
    dropdown.innerHTML = '<div class="autocomplete-empty">No addresses found</div>';
    showAddressDropdown();
    return;
  }

  const html = addresses.map((addr, index) => {
    const streetLine = formatStreetLine(addr);
    const localityLine = formatLocalityLine(addr);

    return `
      <div class="autocomplete-item"
           data-index="${index}"
           data-address='${escapeJsonAttr(addr)}'>
        <span class="autocomplete-main">${escapeHtml(streetLine)}</span>
        <span class="autocomplete-sub">${escapeHtml(localityLine)}</span>
      </div>
    `;
  }).join('');

  dropdown.innerHTML = html;

  // Add click handlers
  dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
    item.addEventListener('click', () => selectAddress(item));
    item.addEventListener('mouseenter', () => {
      highlightAddressItem(parseInt(item.dataset.index));
    });
  });

  showAddressDropdown();
}

function formatStreetLine(addr) {
  const parts = [];

  if (addr.UnitNumber) parts.push(`Unit ${addr.UnitNumber}`);
  if (addr.Number) parts.push(addr.Number);
  if (addr.Street) parts.push(addr.Street);
  if (addr.StreetType) parts.push(addr.StreetType);
  if (addr.StreetSuffix) parts.push(addr.StreetSuffix);

  return parts.join(' ') || 'Address';
}

function formatLocalityLine(addr) {
  const parts = [];

  if (addr.Suburb) parts.push(addr.Suburb);
  if (addr.State) parts.push(addr.State);
  if (addr.Postcode) parts.push(addr.Postcode);

  return parts.join(' ');
}

// ─── Selection ────────────────────────────────────────────────────────────────

function selectAddress(item) {
  let addr;
  try {
    addr = JSON.parse(item.dataset.address);
  } catch (e) {
    console.error('Failed to parse address data');
    return;
  }

  // Build street address
  const streetParts = [];
  if (addr.UnitNumber) streetParts.push(`Unit ${addr.UnitNumber}`);
  if (addr.Number) streetParts.push(addr.Number);
  if (addr.Street) streetParts.push(addr.Street);
  if (addr.StreetType) streetParts.push(addr.StreetType);
  if (addr.StreetSuffix) streetParts.push(addr.StreetSuffix);

  // Populate form fields
  const address1El = document.getElementById('address1');
  const suburbEl = document.getElementById('suburb');
  const stateEl = document.getElementById('state');
  const postcodeEl = document.getElementById('postcode');

  if (address1El) address1El.value = streetParts.join(' ');
  if (suburbEl) suburbEl.value = addr.Suburb || '';
  if (stateEl) stateEl.value = addr.State || '';
  if (postcodeEl) postcodeEl.value = addr.Postcode || '';

  // Handle unit number separately if address2 field exists
  const address2El = document.getElementById('address2');
  if (address2El && addr.UnitNumber) {
    address2El.value = `Unit ${addr.UnitNumber}`;
    // Remove unit from address1 if we put it in address2
    if (address1El) {
      const withoutUnit = streetParts.filter(p => !p.startsWith('Unit'));
      address1El.value = withoutUnit.join(' ');
    }
  }

  // Clear search input and hide dropdown
  document.getElementById('addressSearch').value = '';
  hideAddressDropdown();

  // Visual feedback
  highlightFilledAddressFields();
}

function highlightFilledAddressFields() {
  ['address1', 'address2', 'suburb', 'state', 'postcode'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value) {
      el.classList.add('field-autofilled');
      setTimeout(() => el.classList.remove('field-autofilled'), 2000);
    }
  });
}

// ─── Keyboard Navigation ──────────────────────────────────────────────────────

function handleAddressKeyNavigation(e) {
  const dropdown = document.getElementById('addressDropdown');
  if (!dropdown.classList.contains('visible')) return;

  const items = dropdown.querySelectorAll('.autocomplete-item');
  if (!items.length) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      highlightAddressItem(selectedIndex);
      break;

    case 'ArrowUp':
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      highlightAddressItem(selectedIndex);
      break;

    case 'Enter':
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        selectAddress(items[selectedIndex]);
      }
      break;

    case 'Escape':
      hideAddressDropdown();
      break;
  }
}

function highlightAddressItem(index) {
  const dropdown = document.getElementById('addressDropdown');
  const items = dropdown.querySelectorAll('.autocomplete-item');

  items.forEach((item, i) => {
    item.classList.toggle('highlighted', i === index);
  });

  selectedIndex = index;

  // Scroll into view
  if (items[index]) {
    items[index].scrollIntoView({ block: 'nearest' });
  }
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function showAddressDropdown() {
  document.getElementById('addressDropdown').classList.add('visible');
}

function hideAddressDropdown() {
  document.getElementById('addressDropdown').classList.remove('visible');
  selectedIndex = -1;
}

function showAddressLoading() {
  const dropdown = document.getElementById('addressDropdown');
  dropdown.innerHTML = '<div class="autocomplete-loading">Searching...</div>';
  showAddressDropdown();
}

function showAddressError(message) {
  const dropdown = document.getElementById('addressDropdown');
  dropdown.innerHTML = `<div class="autocomplete-error">${escapeHtml(message)}</div>`;
  showAddressDropdown();
}

// ─── Utility Functions ────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}

function escapeJsonAttr(obj) {
  return JSON.stringify(obj).replace(/'/g, '&#39;');
}
