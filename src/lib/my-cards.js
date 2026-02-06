'use strict';

// ─── My Cards Module ──────────────────────────────────────────────────────────
// Shows cards the user is applying for or currently using

// Sample cards data (in production, this would come from user's account)
const MY_CARDS = [
  {
    id: 'amex-plat',
    bank: 'American Express',
    name: 'Platinum Card',
    status: 'applying', // 'applying', 'approved', 'active'
    progress: 65, // percentage for applying status
    progressStep: 'Identity verification',
    cardColor: { primary: '#1A1A1A', secondary: '#4A4A4A' },
    benefits: [
      '$1,600 Travel Credit annually ($400 per quarter)',
      'Complimentary Marriott Gold & Hilton Gold status',
      'Priority Pass lounge access with 2 guests',
      '$450 Hotel Collection credit for 2+ night stays',
      'Comprehensive travel insurance for you and family'
    ]
  },
  {
    id: 'anz-rewards-black',
    bank: 'ANZ',
    name: 'Rewards Black',
    status: 'active',
    cardColor: { primary: '#007DBA', secondary: '#1A1A1A' },
    benefits: [
      '130,000 bonus ANZ Reward Points on signup',
      'Earn 2 points per $1 on eligible purchases',
      'Points transfer to 8 airline partners including Velocity',
      'Complimentary travel insurance up to $500k',
      '2 complimentary airport lounge visits per year',
      'Visa Concierge service 24/7'
    ]
  }
];

// ─── Initialization ───────────────────────────────────────────────────────────

function initMyCards() {
  const userIndicator = document.getElementById('userIndicator');
  const panel = document.getElementById('myCardsPanel');
  const backBtn = document.getElementById('myCardsBack');
  const logoutBtn = document.getElementById('logoutBtn');

  if (!userIndicator || !panel) return;

  // Click on user indicator (but not logout button) opens My Cards
  userIndicator.addEventListener('click', (e) => {
    // Don't open if clicking logout button
    if (e.target.closest('#logoutBtn')) return;
    showMyCardsPanel();
  });

  // Back button closes panel
  backBtn?.addEventListener('click', hideMyCardsPanel);

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('visible')) {
      hideMyCardsPanel();
    }
  });
}

// ─── Panel Display ────────────────────────────────────────────────────────────

function showMyCardsPanel() {
  const panel = document.getElementById('myCardsPanel');
  const list = document.getElementById('myCardsList');

  if (!panel || !list) return;

  // Render cards
  list.innerHTML = MY_CARDS.map(card => renderCardEntry(card)).join('');

  // Show panel
  panel.classList.add('visible');
}

function hideMyCardsPanel() {
  const panel = document.getElementById('myCardsPanel');
  if (panel) {
    panel.classList.remove('visible');
  }
}

// ─── Card Rendering ───────────────────────────────────────────────────────────

function renderCardEntry(card) {
  const statusLabels = {
    applying: 'Applying',
    approved: 'Approved',
    active: 'Active'
  };

  const cardImageSvg = generateMyCardSvg(card);
  const benefitsHtml = card.benefits.map(b => `
    <div class="my-card-benefit">
      <span class="my-card-benefit-icon">&#10003;</span>
      <span>${escapeMyCardsHtml(b)}</span>
    </div>
  `).join('');

  const progressHtml = card.status === 'applying' ? `
    <div class="my-card-progress">
      <div class="my-card-progress-bar">
        <div class="my-card-progress-fill" style="width: ${card.progress}%"></div>
      </div>
      <div class="my-card-progress-text">${card.progress}% complete - ${escapeMyCardsHtml(card.progressStep)}</div>
    </div>
  ` : '';

  return `
    <div class="my-card-entry">
      <div class="my-card-top">
        <img class="my-card-image" src="${cardImageSvg}" alt="${escapeMyCardsHtml(card.name)}">
        <div class="my-card-info">
          <div class="my-card-bank">${escapeMyCardsHtml(card.bank)}</div>
          <div class="my-card-name">${escapeMyCardsHtml(card.name)}</div>
          <div class="my-card-status ${card.status}">
            <span class="my-card-status-dot"></span>
            ${statusLabels[card.status]}
          </div>
          ${progressHtml}
        </div>
      </div>
      <div class="my-card-benefits">
        <div class="my-card-benefits-title">Card Benefits</div>
        ${benefitsHtml}
      </div>
    </div>
  `;
}

function generateMyCardSvg(card) {
  const colors = card.cardColor || { primary: '#333', secondary: '#666' };
  const bankShort = card.bank === 'American Express' ? 'AMEX' : card.bank;

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.6 54" width="180" height="114">
      <defs>
        <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary}"/>
          <stop offset="100%" style="stop-color:${colors.secondary}"/>
        </linearGradient>
      </defs>
      <rect width="85.6" height="54" rx="4" fill="url(#cg)"/>
      <rect x="8" y="12" width="14" height="11" rx="2" fill="#D4AF37"/>
      <rect x="10" y="14" width="10" height="2" fill="#B8960C"/>
      <rect x="10" y="18" width="10" height="2" fill="#B8960C"/>
      <text x="8" y="35" font-family="Arial,sans-serif" font-size="5" fill="white" opacity="0.8">****  ****  ****  9876</text>
      <text x="8" y="42" font-family="Arial,sans-serif" font-size="4" fill="white" opacity="0.7">CARDHOLDER NAME</text>
      <text x="8" y="50" font-family="Arial,sans-serif" font-size="5" font-weight="bold" fill="white">${bankShort}</text>
    </svg>
  `)}`;
}

function escapeMyCardsHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMyCards);
} else {
  initMyCards();
}
