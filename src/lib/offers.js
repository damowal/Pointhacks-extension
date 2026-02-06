'use strict';

// ─── Point Hacks Special Offers ───────────────────────────────────────────────
// Featured credit card offers from pointhacks.com.au

// Bank brand colors
const BANK_COLORS = {
  NAB: { primary: '#C8102E', secondary: '#1A1A1A' },
  Westpac: { primary: '#D5002B', secondary: '#1F1F1F' },
  Amex: { primary: '#006FCF', secondary: '#FFFFFF' },
  ANZ: { primary: '#007DBA', secondary: '#1A1A1A' },
  CBA: { primary: '#FFCC00', secondary: '#000000' }
};

// Generate SVG credit card image
function generateCardSvg(bankName) {
  const colors = BANK_COLORS[bankName] || { primary: '#333', secondary: '#fff' };
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.6 54" width="120" height="76">
      <defs>
        <linearGradient id="g${bankName}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary}"/>
          <stop offset="100%" style="stop-color:${colors.secondary}"/>
        </linearGradient>
      </defs>
      <rect width="85.6" height="54" rx="4" fill="url(#g${bankName})"/>
      <rect x="8" y="14" width="12" height="10" rx="2" fill="#D4AF37" opacity="0.9"/>
      <rect x="10" y="16" width="8" height="2" fill="#B8960C"/>
      <rect x="10" y="20" width="8" height="2" fill="#B8960C"/>
      <text x="8" y="36" font-family="Arial,sans-serif" font-size="5" fill="white" opacity="0.9">****  ****  ****  1234</text>
      <text x="8" y="48" font-family="Arial,sans-serif" font-size="4" font-weight="bold" fill="white" opacity="0.8">${bankName}</text>
    </svg>
  `)}`;
}

// Generate SVG bank logo
function generateLogoSvg(bankName) {
  const colors = BANK_COLORS[bankName] || { primary: '#333', secondary: '#fff' };

  const logos = {
    NAB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <polygon points="12,2 22,22 2,22" fill="${colors.primary}"/>
    </svg>`,
    Westpac: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <text x="4" y="18" font-family="Arial,sans-serif" font-size="16" font-weight="bold" fill="${colors.primary}">W</text>
    </svg>`,
    Amex: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <rect width="24" height="24" rx="4" fill="${colors.primary}"/>
      <text x="5" y="17" font-family="Arial,sans-serif" font-size="12" font-weight="bold" fill="white">AX</text>
    </svg>`,
    ANZ: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <rect width="24" height="24" rx="4" fill="${colors.primary}"/>
      <text x="1" y="17" font-family="Arial,sans-serif" font-size="10" font-weight="bold" fill="white">ANZ</text>
    </svg>`,
    CBA: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <rect width="24" height="24" fill="${colors.primary}"/>
      <polygon points="0,0 24,0 24,12 0,24" fill="${colors.secondary}"/>
    </svg>`
  };

  return `data:image/svg+xml,${encodeURIComponent(logos[bankName] || logos.ANZ)}`;
}

const FEATURED_OFFERS = [
  {
    bank: 'NAB',
    cardName: 'Qantas Rewards Signature',
    points: '130,000',
    pointsType: 'Qantas Points',
    fee: '$420 p.a.',
    url: 'https://www.pointhacks.com.au/credit-cards/nab-qantas-rewards-signature/'
  },
  {
    bank: 'Westpac',
    cardName: 'Altitude Qantas Black',
    points: '150,000',
    pointsType: 'Qantas Points',
    fee: '$370 p.a.',
    url: 'https://www.pointhacks.com.au/credit-cards/westpac-altitude-black/'
  },
  {
    bank: 'Amex',
    cardName: 'Qantas Ultimate',
    points: '100,000',
    pointsType: 'Qantas Points',
    fee: '$450 p.a.',
    url: 'https://www.pointhacks.com.au/credit-cards/american-express-qantas-ultimate/'
  },
  {
    bank: 'ANZ',
    cardName: 'Rewards Black',
    points: '130,000',
    pointsType: 'Bonus Points',
    fee: '$375 p.a.',
    url: 'https://www.pointhacks.com.au/credit-cards/anz-rewards-black/'
  },
  {
    bank: 'CBA',
    cardName: 'Ultimate Awards',
    points: '100,000',
    pointsType: 'Awards Points',
    fee: '$399 p.a.',
    url: 'https://www.pointhacks.com.au/credit-cards/commbank-ultimate-awards/'
  }
];

// ─── Render Offers ────────────────────────────────────────────────────────────

function initOffers() {
  const carousel = document.getElementById('offersCarousel');
  if (!carousel) return;

  const html = FEATURED_OFFERS.map(offer => `
    <a class="offer-card" href="${offer.url}" target="_blank">
      <div class="offer-card-header">
        <img class="offer-bank-logo" src="${generateLogoSvg(offer.bank)}" alt="${escapeOfferHtml(offer.bank)}">
        <span class="offer-bank">${escapeOfferHtml(offer.bank)}</span>
      </div>
      <div class="offer-card-image-wrap">
        <img class="offer-card-image" src="${generateCardSvg(offer.bank)}" alt="${escapeOfferHtml(offer.cardName)}">
      </div>
      <div class="offer-points">${escapeOfferHtml(offer.points)}</div>
      <div class="offer-points-label">${escapeOfferHtml(offer.pointsType)}</div>
      <div class="offer-card-name">${escapeOfferHtml(offer.cardName)}</div>
      <div class="offer-fee">${escapeOfferHtml(offer.fee)}</div>
    </a>
  `).join('');

  carousel.innerHTML = html;
}

function escapeOfferHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOffers);
} else {
  initOffers();
}
