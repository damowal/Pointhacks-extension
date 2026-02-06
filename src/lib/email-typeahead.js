'use strict';

// ─── Email Domain Typeahead ────────────────────────────────────────────────────
// Suggests common email domains as user types after "@"

const EMAIL_DOMAINS = [
  // Popular free email providers
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'yahoo.com.au',
  'live.com',
  'live.com.au',
  'icloud.com',
  'me.com',
  'protonmail.com',
  'proton.me',

  // Australian ISPs & providers
  'bigpond.com',
  'bigpond.net.au',
  'optusnet.com.au',
  'tpg.com.au',
  'internode.on.net',
  'iinet.net.au',
  'adam.com.au',
  'dodo.com.au',
  'aapt.net.au',
  'westnet.com.au',

  // Regional Australian
  'hotmail.com.au',
  'outlook.com.au',

  // Legacy/older providers
  'aol.com',
  'msn.com',
  'mail.com',
  'ymail.com',
  'googlemail.com',

  // Work/professional
  'company.com.au',
  'work.com'
];

let highlightedIndex = -1;

function initEmailTypeahead() {
  const emailInput = document.getElementById('email');
  const dropdown = document.getElementById('emailDropdown');

  if (!emailInput || !dropdown) return;

  // Listen for input events
  emailInput.addEventListener('input', () => {
    const value = emailInput.value;
    const atIndex = value.indexOf('@');

    if (atIndex === -1 || atIndex === 0) {
      // No @ yet or nothing before @ - hide dropdown
      hideDropdown(dropdown);
      return;
    }

    const localPart = value.substring(0, atIndex);
    const domainPart = value.substring(atIndex + 1).toLowerCase();

    // Filter matching domains
    const matches = EMAIL_DOMAINS.filter(domain =>
      domain.toLowerCase().startsWith(domainPart)
    ).slice(0, 6); // Show max 6 suggestions

    if (matches.length === 0 || (matches.length === 1 && matches[0] === domainPart)) {
      // No matches or exact match already typed
      hideDropdown(dropdown);
      return;
    }

    // Render suggestions
    renderSuggestions(dropdown, localPart, matches, emailInput);
  });

  // Keyboard navigation
  emailInput.addEventListener('keydown', (e) => {
    if (!dropdown.classList.contains('visible')) return;

    const items = dropdown.querySelectorAll('.autocomplete-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
      updateHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightedIndex = Math.max(highlightedIndex - 1, 0);
      updateHighlight(items);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (highlightedIndex >= 0 && items[highlightedIndex]) {
        e.preventDefault();
        items[highlightedIndex].click();
      }
    } else if (e.key === 'Escape') {
      hideDropdown(dropdown);
    }
  });

  // Hide on blur (with delay for click)
  emailInput.addEventListener('blur', () => {
    setTimeout(() => hideDropdown(dropdown), 150);
  });

  // Show on focus if there's a partial domain
  emailInput.addEventListener('focus', () => {
    const value = emailInput.value;
    if (value.includes('@')) {
      emailInput.dispatchEvent(new Event('input'));
    }
  });
}

function renderSuggestions(dropdown, localPart, domains, input) {
  highlightedIndex = -1;

  dropdown.innerHTML = domains.map((domain, idx) => `
    <div class="autocomplete-item" data-email="${escapeEmailHtml(localPart)}@${escapeEmailHtml(domain)}">
      <span class="autocomplete-main">${escapeEmailHtml(localPart)}@<strong>${escapeEmailHtml(domain)}</strong></span>
    </div>
  `).join('');

  // Add click handlers
  dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
    item.addEventListener('click', () => {
      input.value = item.dataset.email;
      hideDropdown(dropdown);
      input.focus();
      // Trigger change event for any listeners
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  dropdown.classList.add('visible');
}

function updateHighlight(items) {
  items.forEach((item, idx) => {
    item.classList.toggle('highlighted', idx === highlightedIndex);
  });
}

function hideDropdown(dropdown) {
  dropdown.classList.remove('visible');
  highlightedIndex = -1;
}

function escapeEmailHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEmailTypeahead);
} else {
  initEmailTypeahead();
}
