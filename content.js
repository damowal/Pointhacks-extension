'use strict';

// ════════════════════════════════════════════════════════════════════════════
// BANK DETECTION
// ════════════════════════════════════════════════════════════════════════════

const BANK_MAP = {
  'anz.com.au':              'ANZ',
  'anz.com':                 'ANZ',
  'nab.com.au':              'NAB',
  'commbank.com.au':         'Commonwealth Bank',
  'westpac.com.au':          'Westpac',
  'americanexpress.com':     'American Express'
};

function detectBank() {
  const host = window.location.hostname;
  for (const [domain, name] of Object.entries(BANK_MAP)) {
    if (host === domain || host.endsWith('.' + domain)) return name;
  }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// ALIAS TABLES  —  used when resolving <select> or <input type="radio">
// ════════════════════════════════════════════════════════════════════════════

const STATE_ALIASES = {
  NSW: ['nsw', 'new south wales'],
  VIC: ['vic', 'victoria'],
  QLD: ['qld', 'queensland'],
  SA:  ['sa',  'south australia'],
  WA:  ['wa',  'western australia'],
  TAS: ['tas', 'tasmania'],
  NT:  ['nt',  'northern territory'],
  ACT: ['act', 'australian capital territory']
};

const EMPLOYMENT_ALIASES = {
  employed:      ['employed', 'full-time', 'full time', 'fulltime', 'part-time', 'part time', 'parttime', 'casual'],
  self_employed: ['self-employed', 'self employed', 'selfemployed'],
  unemployed:    ['unemployed', 'not employed'],
  retired:       ['retired', 'pension', 'pensioner'],
  student:       ['student', 'studying'],
  homemaker:     ['homemaker', 'stay at home']
};

const SALUTATION_ALIASES = {
  mr:   ['mr', 'mr.', 'mister'],
  mrs:  ['mrs', 'mrs.'],
  ms:   ['ms', 'ms.'],
  miss: ['miss'],
  dr:   ['dr', 'dr.', 'doctor']
};

const GENDER_ALIASES = {
  male:   ['male', 'm'],
  female: ['female', 'f'],
  other:  ['other', 'prefer not to say', 'do not wish to disclose']
};

const MARITAL_ALIASES = {
  single:    ['single', 'never married', 'unmarried'],
  married:   ['married'],
  de_facto:  ['de facto', 'defacto', 'de-facto', 'domestic partner', 'partner'],
  divorced:  ['divorced'],
  widowed:   ['widowed', 'widow', 'widower'],
  separated: ['separated']
};

const CITIZENSHIP_ALIASES = {
  citizen:            ['australian citizen', 'citizen', 'aus citizen'],
  permanent_resident: ['permanent resident', 'pr', 'permanent visa'],
  visa_holder:        ['visa holder', 'temporary resident', 'temporary visa', 'work visa', 'student visa']
};

const RESIDENTIAL_ALIASES = {
  own:      ['own', 'owner', 'own outright', 'fully owned', 'own home'],
  mortgage: ['mortgage', 'mortgaged', 'paying off mortgage', 'home loan'],
  rent:     ['rent', 'renting', 'tenant', 'renter'],
  board:    ['board', 'boarding', 'boarder'],
  parents:  ['parents', 'living with parents', 'family home', 'with family'],
  other:    ['other']
};

const EMPLOYMENT_TYPE_ALIASES = {
  full_time: ['full time', 'full-time', 'fulltime', 'permanent full time'],
  part_time: ['part time', 'part-time', 'parttime', 'permanent part time'],
  casual:    ['casual', 'casual employment'],
  contract:  ['contract', 'contractor', 'fixed term', 'temporary']
};

// ════════════════════════════════════════════════════════════════════════════
// FIELD DEFINITIONS
// Each entry: key (matches popup profile keys), kw (keywords used for matching)
// Keywords are matched against normalised hint text; longer match wins.
// ════════════════════════════════════════════════════════════════════════════

const FIELD_DEFS = [
  // ── income ──
  { key: 'annualIncome',     kw: ['gross annual income', 'annual income', 'annual_income', 'yearly income', 'income per annum', 'gross income', 'salary per year', 'pa income', 'total income before tax', 'income before tax'] },
  { key: 'otherIncome',      kw: ['other income', 'additional income', 'secondary income', 'rental income', 'investment income', 'bonus income'] },
  { key: 'monthlyIncome',    kw: ['gross monthly income', 'monthly income', 'monthly_income', 'income per month', 'monthly salary'] },

  // ── living expenses (detailed breakdown for NAB, CBA, etc.) ──
  { key: 'rentMortgage',     kw: ['rent or mortgage', 'rent mortgage', 'monthly rent', 'mortgage payment', 'rent payment', 'housing costs', 'accommodation costs', 'housing expense'] },
  { key: 'groceries',        kw: ['groceries', 'food expenses', 'food and groceries', 'supermarket', 'grocery expenses'] },
  { key: 'transport',        kw: ['transport', 'transportation', 'travel expenses', 'commute', 'petrol', 'fuel', 'car expenses', 'public transport'] },
  { key: 'utilities',        kw: ['utilities', 'utility bills', 'electricity', 'gas and electricity', 'water rates', 'phone and internet', 'energy bills'] },
  { key: 'insurance',        kw: ['insurance', 'insurance premiums', 'health insurance', 'car insurance', 'home insurance', 'life insurance'] },
  { key: 'entertainment',    kw: ['entertainment', 'recreation', 'leisure', 'dining out', 'subscriptions', 'streaming services', 'hobbies'] },
  { key: 'childcare',        kw: ['childcare', 'child care', 'daycare', 'day care', 'nanny costs', 'babysitting'] },
  { key: 'education',        kw: ['education', 'school fees', 'tuition', 'university fees', 'education expenses', 'school expenses'] },
  { key: 'monthlyExpenses',  kw: ['other expenses', 'other monthly expenses', 'miscellaneous expenses', 'monthly expenses', 'living expenses', 'monthly living costs', 'total monthly expenses', 'household expenses'] },

  // ── assets ──
  { key: 'propertyValue',    kw: ['property value', 'home value', 'real estate value', 'property worth', 'house value', 'estimated property value'] },
  { key: 'vehicleValue',     kw: ['vehicle value', 'car value', 'motor vehicle value', 'vehicle worth', 'cars and vehicles'] },
  { key: 'savings',          kw: ['savings', 'savings balance', 'bank savings', 'cash savings', 'total savings', 'money in bank'] },

  // ── liabilities ──
  { key: 'totalCreditLimit', kw: ['total credit limit', 'credit card limits', 'existing credit limits', 'combined credit limit', 'current credit limit'] },
  { key: 'creditCardBalance', kw: ['credit card balance', 'credit card debt', 'outstanding credit card', 'credit card owing', 'amount owing on credit cards'] },
  { key: 'numCreditCards',   kw: ['number of credit cards', 'how many credit cards', 'credit cards held', 'existing credit cards'] },
  { key: 'loanBalance',      kw: ['loan balance', 'personal loan balance', 'car loan balance', 'other loans', 'outstanding loans', 'loan amount owing'] },
  { key: 'loanRepayment',    kw: ['loan repayment', 'monthly loan repayment', 'loan payment', 'personal loan repayment', 'car loan repayment'] },
  { key: 'bnplBalance',      kw: ['buy now pay later', 'bnpl balance', 'bnpl', 'afterpay', 'zip pay', 'klarna', 'humm', 'buy now pay later balance'] },

  // ── calculated totals (computed from individual fields) ──
  { key: 'totalMonthlyExpenses', kw: ['total monthly expenses', 'total expenses', 'total living expenses', 'combined expenses', 'all expenses'] },
  { key: 'totalAssets',      kw: ['total assets', 'total asset value', 'combined assets', 'net assets'] },
  { key: 'totalLiabilities', kw: ['total liabilities', 'total debts', 'combined liabilities', 'total debt', 'outstanding debts'] },

  // ── employment ──
  { key: 'employmentStatus', kw: ['employment status', 'employment_status', 'employment situation', 'your employment', 'current employment'] },
  { key: 'employmentType',   kw: ['employment type', 'type of employment', 'employment basis', 'full time part time', 'work type'] },
  { key: 'yearsAtEmployer',  kw: ['years with employer', 'years at employer', 'length of employment', 'time at employer', 'years employed', 'how long employed', 'time with current employer'] },
  { key: 'employer',         kw: ['employer name', 'current employer', 'employer', 'company name', 'business name', 'name of employer'] },
  { key: 'employerPhone',    kw: ['employer phone', 'employer contact', 'work phone', 'employer telephone', 'business phone'] },
  { key: 'occupation',       kw: ['occupation', 'job title', 'job_title', 'your occupation', 'profession', 'position title', 'role'] },
  { key: 'industry',         kw: ['industry', 'sector', 'industry type', 'field of work', 'business type'] },

  // ── address ──
  { key: 'address2',         kw: ['address line 2', 'address_line_2', 'addressline2', 'unit number', 'apartment number', 'suite', 'flat number', 'unit flat'] },
  { key: 'address1',         kw: ['street address', 'address line 1', 'address_line_1', 'addressline1', 'residential address', 'home address', 'current address', 'street name and number', 'address'] },
  { key: 'yearsAtAddress',   kw: ['years at this address', 'years at address', 'length of residence', 'how long at address', 'time at current address', 'years at current address'] },
  { key: 'residentialStatus', kw: ['residential status', 'living situation', 'housing status', 'home ownership', 'do you own or rent', 'accommodation type'] },

  // ── personal ──
  { key: 'firstName',        kw: ['first name', 'first_name', 'firstname', 'given name', 'given_name', 'givenname', 'first names', 'fname'] },
  { key: 'middleName',       kw: ['middle name', 'middle_name', 'middlename', 'middle names', 'other names'] },
  { key: 'lastName',         kw: ['last name', 'last_name', 'lastname', 'surname', 'family name', 'family_name', 'familyname', 'last names', 'lname'] },
  { key: 'fullName',         kw: ['full name', 'fullname', 'full legal name', 'your full name'] },
  { key: 'salutation',       kw: ['salutation', 'title', 'prefix', 'honourific', 'honorific'] },
  { key: 'dob',              kw: ['date of birth', 'dateofbirth', 'date_of_birth', 'dob', 'birth date', 'birthdate'] },
  { key: 'dobDay',           kw: ['day of birth', 'birth day', 'dob day', 'day (dd)', 'day born'] },
  { key: 'dobMonth',         kw: ['month of birth', 'birth month', 'dob month', 'month (mm)', 'month born'] },
  { key: 'dobYear',          kw: ['year of birth', 'birth year', 'dob year', 'year (yyyy)', 'year born'] },
  { key: 'gender',           kw: ['gender', 'sex'] },
  { key: 'maritalStatus',    kw: ['marital status', 'relationship status', 'married single', 'are you married'] },
  { key: 'dependents',       kw: ['number of dependents', 'dependents', 'dependants', 'number of dependants', 'how many dependents'] },
  { key: 'citizenship',      kw: ['citizenship', 'citizenship status', 'residency status', 'australian citizen', 'permanent resident', 'visa status'] },
  { key: 'email',            kw: ['email address', 'email', 'e-mail', 'electronic mail'] },
  { key: 'phone',            kw: ['mobile phone number', 'mobile phone', 'mobile number', 'phone number', 'phone', 'mobile', 'contact number', 'cell phone'] },

  // ── location ──
  { key: 'postcode',         kw: ['postcode', 'post code', 'postal code', 'post_code', 'zip code', 'zipcode'] },
  { key: 'suburb',           kw: ['suburb', 'suburb/city', 'city', 'town', 'locality'] },
  { key: 'state',            kw: ['state/territory', 'state territory', 'state_territory', 'state', 'territory'] },
  { key: 'country',          kw: ['country of residence', 'country'] },

  // ── identity verification ──
  { key: 'licenceNumber',    kw: ['driver licence number', 'drivers licence', 'licence number', 'license number', 'driving licence', 'dl number'] },
  { key: 'licenceState',     kw: ['licence state', 'license state', 'licence issued', 'state of issue', 'issuing state'] },
  { key: 'passportNumber',   kw: ['passport number', 'passport no', 'passport'] },
  { key: 'passportCountry',  kw: ['passport country', 'country of issue', 'passport issued'] },
  { key: 'medicareNumber',   kw: ['medicare number', 'medicare card number', 'medicare'] },
  { key: 'medicareRef',      kw: ['medicare reference', 'medicare ref', 'reference number on medicare', 'irn', 'individual reference number'] }
];

// ════════════════════════════════════════════════════════════════════════════
// HINT COLLECTION  —  gathers every text clue an element offers
// ════════════════════════════════════════════════════════════════════════════

function collectHints(el) {
  const hints = [];

  // 1. Direct attributes
  for (const attr of ['name', 'id', 'placeholder', 'title', 'aria-label']) {
    const v = el.getAttribute(attr);
    if (v) hints.push(v);
  }

  // 2. aria-labelledby (may reference multiple ids)
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    labelledBy.split(/\s+/).forEach(id => {
      const ref = document.getElementById(id);
      if (ref) hints.push(ref.textContent);
    });
  }

  // 3. <label for="…">
  if (el.id) {
    try {
      const lbl = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
      if (lbl) hints.push(lbl.textContent);
    } catch (_) { /* malformed id */ }
  }

  // 4. Ancestor <label>
  const ancestorLabel = el.closest('label');
  if (ancestorLabel) hints.push(ancestorLabel.textContent);

  // 5. Sibling label inside the same parent
  const parent = el.parentElement;
  if (parent) {
    const sibLabel = parent.querySelector('label');
    if (sibLabel && !sibLabel.contains(el)) hints.push(sibLabel.textContent);
  }

  // 6. Fieldset <legend>  (catches "Date of Birth" wrapping DD / MM / YYYY)
  const fieldset = el.closest('fieldset');
  if (fieldset) {
    const legend = fieldset.querySelector(':scope > legend');
    if (legend) hints.push(legend.textContent);
  }

  // 7. Nearest ancestor with a class containing "group" / "field" that has its own label
  const group = el.closest('[class*="group"], [class*="field-wrap"], [class*="field-container"], [class*="form-item"]');
  if (group && group !== parent) {
    const gl = group.querySelector('label, [class*="label"], [class*="title"]');
    if (gl && !gl.contains(el)) hints.push(gl.textContent);
  }

  return hints;
}

// ════════════════════════════════════════════════════════════════════════════
// FIELD MATCHING  —  normalise hints, score against keyword lists
// ════════════════════════════════════════════════════════════════════════════

function normalise(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function matchField(el) {
  const hints   = collectHints(el);
  const hintStr = normalise(hints.join(' '));
  if (!hintStr) return null;

  let bestDef   = null;
  let bestScore = 0;

  for (const def of FIELD_DEFS) {
    for (const kw of def.kw) {
      const nkw = normalise(kw);
      if (hintStr.includes(nkw) && nkw.length > bestScore) {
        bestScore = nkw.length;
        bestDef   = def;
      }
    }
  }

  // ── Special case: bare DD / MM / YYYY inside a DOB context ──
  if (bestScore < 4) {
    const hasDobCtx = /birth|dob|age/.test(hintStr);
    if (hasDobCtx) {
      const bare = normalise(el.placeholder || el.name || el.getAttribute('aria-label') || '');
      if (/^(dd|day)$/.test(bare))       return { key: 'dobDay' };
      if (/^(mm|month)$/.test(bare))     return { key: 'dobMonth' };
      if (/^(yy|yyyy|year)$/.test(bare)) return { key: 'dobYear' };
    }
  }

  return bestScore >= 3 ? bestDef : null;
}

// ════════════════════════════════════════════════════════════════════════════
// VALUE RESOLUTION  —  derive the value to write from the user profile
// ════════════════════════════════════════════════════════════════════════════

function valueForKey(key, profile) {
  switch (key) {
    case 'fullName':
      return [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ');
    case 'monthlyIncome': {
      const n = Number((profile.annualIncome || '').replace(/[^0-9.]/g, ''));
      return n ? String(Math.round(n / 12)) : '';
    }
    case 'totalMonthlyExpenses': {
      // Sum all expense categories
      const expenseFields = ['rentMortgage', 'groceries', 'transport', 'utilities', 'insurance', 'entertainment', 'childcare', 'education', 'monthlyExpenses', 'loanRepayment'];
      const total = expenseFields.reduce((sum, f) => {
        const v = Number((profile[f] || '').replace(/[^0-9.]/g, ''));
        return sum + (v || 0);
      }, 0);
      return total ? String(total) : '';
    }
    case 'totalAssets': {
      // Sum all asset fields
      const assetFields = ['propertyValue', 'vehicleValue', 'savings'];
      const total = assetFields.reduce((sum, f) => {
        const v = Number((profile[f] || '').replace(/[^0-9.]/g, ''));
        return sum + (v || 0);
      }, 0);
      return total ? String(total) : '';
    }
    case 'totalLiabilities': {
      // Sum all liability fields
      const liabilityFields = ['creditCardBalance', 'loanBalance', 'bnplBalance'];
      const total = liabilityFields.reduce((sum, f) => {
        const v = Number((profile[f] || '').replace(/[^0-9.]/g, ''));
        return sum + (v || 0);
      }, 0);
      return total ? String(total) : '';
    }
    case 'dobDay':        return (profile.dob || '').split('/')[0] || '';
    case 'dobMonth':      return (profile.dob || '').split('/')[1] || '';
    case 'dobYear':       return (profile.dob || '').split('/')[2] || '';
    case 'country':       return 'Australia';
    case 'passportCountry': return profile.passportCountry || 'Australia';
    default:              return profile[key] || '';
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SELECT RESOLUTION  —  map a profile value onto the closest <option>
// ════════════════════════════════════════════════════════════════════════════

function resolveOption(select, fieldKey, rawValue) {
  const options = Array.from(select.options).filter(o => o.value !== '');
  if (!options.length) return null;

  const lower = rawValue.toLowerCase().trim();

  // Pick the right alias table
  const aliasMap =
    fieldKey === 'state'            ? STATE_ALIASES :
    fieldKey === 'licenceState'     ? STATE_ALIASES :
    fieldKey === 'employmentStatus' ? EMPLOYMENT_ALIASES :
    fieldKey === 'employmentType'   ? EMPLOYMENT_TYPE_ALIASES :
    fieldKey === 'salutation'       ? SALUTATION_ALIASES :
    fieldKey === 'gender'           ? GENDER_ALIASES :
    fieldKey === 'maritalStatus'    ? MARITAL_ALIASES :
    fieldKey === 'citizenship'      ? CITIZENSHIP_ALIASES :
    fieldKey === 'residentialStatus'? RESIDENTIAL_ALIASES :
    fieldKey === 'country'          ? { australia: ['australia', 'aus'] } :
    fieldKey === 'passportCountry'  ? { australia: ['australia', 'aus'] } :
    null;

  if (aliasMap) {
    // Find the canonical key that matches the user's stored value
    let canon = null;
    for (const [k, aliases] of Object.entries(aliasMap)) {
      if (k === lower || aliases.includes(lower)) { canon = k; break; }
    }

    if (canon) {
      const all = [canon, ...(aliasMap[canon] || [])];
      // Try to match an <option> whose value or text starts with / equals one of the aliases
      for (const opt of options) {
        const ov = opt.value.toLowerCase().trim();
        const ot = opt.text.toLowerCase().trim();
        if (all.some(a => ov === a || ot === a || ot.startsWith(a + ' ') || ov.startsWith(a))) {
          return opt.value;
        }
      }
    }
  }

  // Fallback: exact value match → exact text match → contains match
  let hit = options.find(o => o.value.toLowerCase().trim() === lower);
  if (hit) return hit.value;
  hit = options.find(o => o.text.toLowerCase().trim() === lower);
  if (hit) return hit.value;
  hit = options.find(o => o.text.toLowerCase().includes(lower));
  if (hit) return hit.value;

  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// NATIVE VALUE SETTER  —  bypasses React/Vue/Angular controlled-input traps
// ════════════════════════════════════════════════════════════════════════════

function setNative(el, value) {
  if (el.tagName === 'SELECT') {
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }

  // Use the prototype setter so frameworks' getters/setters don't swallow the write
  const proto  = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;          // fallback
  }

  el.dispatchEvent(new Event('input',  { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

// ════════════════════════════════════════════════════════════════════════════
// VISUAL FEEDBACK  —  highlight filled elements + slide-in toast
// ════════════════════════════════════════════════════════════════════════════

function highlight(el) {
  el.classList.add('cc-af-filled');
  setTimeout(() => el.classList.remove('cc-af-filled'), 4000);
}

function showToast(msg, type) {
  const prev = document.getElementById('cc-af-toast');
  if (prev) prev.remove();

  const toast = document.createElement('div');
  toast.id    = 'cc-af-toast';
  toast.className = 'cc-af-toast cc-af-toast--' + (type || 'ok');
  toast.innerHTML =
    '<span class="cc-af-toast-icon">' + (type === 'warn' ? '⚠' : '✓') + '</span>' +
    '<span class="cc-af-toast-msg">' + msg + '</span>';

  document.body.appendChild(toast);

  // Trigger CSS transition on next frame
  requestAnimationFrame(() =>
    requestAnimationFrame(() => toast.classList.add('cc-af-toast--visible'))
  );

  // Auto-dismiss after 3.2 s
  setTimeout(() => {
    toast.classList.remove('cc-af-toast--visible');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN FILL LOGIC
// ════════════════════════════════════════════════════════════════════════════

function fillPage(profile) {
  const selector =
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]),' +
    'select,' +
    'textarea';

  const elements = document.querySelectorAll(selector);
  const filled   = [];

  for (const el of elements) {
    // Skip elements that are not visible (display:none / not in layout)
    if (!el.offsetParent && el.type !== 'radio') continue;

    const def = matchField(el);
    if (!def) continue;

    const value = valueForKey(def.key, profile);
    if (!value) continue;

    // ── Radio buttons ────────────────────────────────────────────────────
    if (el.type === 'radio') {
      const radioLabel = normalise(
        (el.parentElement ? el.parentElement.textContent : '') +
        ' ' + (el.value || '')
      );
      const aliasMap =
        def.key === 'gender'            ? GENDER_ALIASES :
        def.key === 'salutation'        ? SALUTATION_ALIASES :
        def.key === 'employmentStatus'  ? EMPLOYMENT_ALIASES :
        def.key === 'employmentType'    ? EMPLOYMENT_TYPE_ALIASES :
        def.key === 'maritalStatus'     ? MARITAL_ALIASES :
        def.key === 'citizenship'       ? CITIZENSHIP_ALIASES :
        def.key === 'residentialStatus' ? RESIDENTIAL_ALIASES :
        null;

      if (aliasMap) {
        const lv = value.toLowerCase();
        let canon = null;
        for (const [k, arr] of Object.entries(aliasMap)) {
          if (k === lv || arr.includes(lv)) { canon = k; break; }
        }
        if (canon) {
          const all = [canon, ...(aliasMap[canon] || [])];
          if (all.some(a => radioLabel.includes(a))) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            filled.push(def.key);
            highlight(el);
          }
        }
      }
      continue;
    }

    // ── <select> ─────────────────────────────────────────────────────────
    if (el.tagName === 'SELECT') {
      const resolved = resolveOption(el, def.key, value);
      if (resolved !== null) {
        setNative(el, resolved);
        filled.push(def.key);
        highlight(el);
      }
      continue;
    }

    // ── date input (type="date" wants YYYY-MM-DD) ────────────────────────
    if (el.type === 'date' && def.key === 'dob') {
      const parts = value.split('/');           // stored as DD/MM/YYYY
      if (parts.length === 3) {
        setNative(el, parts[2] + '-' + parts[1] + '-' + parts[0]);
        filled.push(def.key);
        highlight(el);
      }
      continue;
    }

    // ── text / email / tel / textarea ─────────────────────────────────────
    setNative(el, value);
    filled.push(def.key);
    highlight(el);
  }

  // Deduplicate (e.g. radio group fires same key)
  return [...new Set(filled)];
}

// ════════════════════════════════════════════════════════════════════════════
// MESSAGE LISTENER  —  popup talks to us via chrome.runtime messaging
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// CRO TIPS SYSTEM — In-page guidance to improve form completion rates
// ════════════════════════════════════════════════════════════════════════════

const CRO_TIPS = {
  personal: {
    title: 'Personal Details',
    icon: '👤',
    keywords: ['personal', 'about you', 'your details', 'applicant details', 'primary applicant'],
    tips: [
      { type: 'trust', text: 'Your information is encrypted and secure' },
      { type: 'help', text: 'Use your legal name exactly as it appears on your ID' },
      { type: 'social', text: '94% of applicants complete this section in under 2 minutes' }
    ]
  },
  contact: {
    title: 'Contact Information',
    icon: '📱',
    keywords: ['contact', 'email', 'phone', 'mobile', 'how to reach'],
    tips: [
      { type: 'help', text: 'Use a mobile number you check regularly for verification codes' },
      { type: 'trust', text: 'We only contact you about your application' }
    ]
  },
  address: {
    title: 'Address Details',
    icon: '🏠',
    keywords: ['address', 'residential', 'where you live', 'current address', 'home address'],
    tips: [
      { type: 'help', text: 'Use your current residential address as shown on utility bills' },
      { type: 'social', text: 'Most applicants have lived at their address for 3+ years' },
      { type: 'momentum', text: 'Great progress! Address details help verify your identity' }
    ]
  },
  employment: {
    title: 'Employment Details',
    icon: '💼',
    keywords: ['employment', 'occupation', 'job', 'work', 'employer', 'income'],
    tips: [
      { type: 'help', text: 'Include your gross (before tax) annual income' },
      { type: 'trust', text: 'Income details are used only for credit assessment' },
      { type: 'social', text: 'The average successful applicant earns $75,000+ annually' }
    ]
  },
  financial: {
    title: 'Financial Information',
    icon: '💰',
    keywords: ['financial', 'assets', 'liabilities', 'expenses', 'savings', 'debts'],
    tips: [
      { type: 'help', text: 'Include all regular expenses like rent, utilities, and subscriptions' },
      { type: 'trust', text: 'Accurate figures help ensure responsible lending' },
      { type: 'momentum', text: 'Almost there! This is the final key section' }
    ]
  },
  identity: {
    title: 'Identity Verification',
    icon: '🪪',
    keywords: ['identity', 'verification', 'id', 'passport', 'driver', 'license', 'medicare'],
    tips: [
      { type: 'help', text: 'Have your ID document ready — details must match exactly' },
      { type: 'trust', text: 'Identity checks protect you from fraud' },
      { type: 'social', text: '98% of verifications complete instantly' }
    ]
  }
};

const TIP_ICONS = {
  trust: '🔒',
  help: '💡',
  social: '👥',
  momentum: '🚀',
  urgency: '⏰'
};

let tipsInjected = false;
let progressInjected = false;

function injectCroTips() {
  const bank = detectBank();
  if (!bank) return;

  // Always inject progress indicator on bank sites
  if (!progressInjected && !document.querySelector('.ph-cro-progress')) {
    console.log('[Point Hacks] Injecting progress indicator');
    if (injectProgressIndicator()) {
      progressInjected = true;
    }
  }

  if (tipsInjected) return;

  // Find form sections on the page
  const sections = findFormSections();
  console.log('[Point Hacks] Found', sections.length, 'form sections');
  let injectedCount = 0;

  for (const section of sections) {
    const tipData = matchSectionToTips(section.element);
    if (tipData && !section.element.querySelector('.ph-cro-tips')) {
      console.log('[Point Hacks] Injecting tip for:', tipData.title);
      injectTipBox(section.element, tipData, section.position);
      injectedCount++;
    }
  }

  // If no specific sections found, inject a general welcome tip near any form or main content
  if (injectedCount === 0) {
    const form = document.querySelector('form');
    const main = document.querySelector('main, [role="main"], .main, #main, .content, #content');
    const target = form || main;

    if (target && !document.querySelector('.ph-cro-tips')) {
      console.log('[Point Hacks] Injecting welcome tip near:', target.tagName);
      injectWelcomeTip(target, bank);
      injectedCount++;
    }
  }

  if (injectedCount > 0) {
    tipsInjected = true;
  }
}

function injectWelcomeTip(form, bank) {
  const tipBox = document.createElement('div');
  tipBox.className = 'ph-cro-tips';
  tipBox.innerHTML = `
    <div class="ph-cro-tips-header">
      <span class="ph-cro-tips-icon">✈️</span>
      <span class="ph-cro-tips-title">Point Hacks Assistant</span>
      <button class="ph-cro-tips-close" title="Dismiss">×</button>
    </div>
    <div class="ph-cro-tips-body">
      <div class="ph-cro-tip ph-cro-tip--help">
        <span class="ph-cro-tip-icon">💡</span>
        <span class="ph-cro-tip-text">Click the extension icon to auto-fill this ${bank} application</span>
      </div>
      <div class="ph-cro-tip ph-cro-tip--trust">
        <span class="ph-cro-tip-icon">🔒</span>
        <span class="ph-cro-tip-text">Your data stays on your device - never sent to our servers</span>
      </div>
      <div class="ph-cro-tip ph-cro-tip--social">
        <span class="ph-cro-tip-icon">👥</span>
        <span class="ph-cro-tip-text">Most applications take under 10 minutes to complete</span>
      </div>
    </div>
  `;

  tipBox.querySelector('.ph-cro-tips-close').addEventListener('click', () => {
    tipBox.classList.add('ph-cro-tips--hidden');
    setTimeout(() => tipBox.remove(), 300);
  });

  form.insertAdjacentElement('beforebegin', tipBox);
}

function findFormSections() {
  const sections = [];

  // Look for common section containers
  const selectors = [
    'fieldset',
    '[class*="section"]',
    '[class*="panel"]',
    '[class*="card"]',
    '[class*="form-group"]',
    '[class*="step"]',
    'form > div',
    '[role="group"]'
  ];

  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach(el => {
      // Must contain form elements
      if (!el.querySelector('input, select, textarea')) return;

      // Skip tiny containers (likely individual fields)
      const inputs = el.querySelectorAll('input, select, textarea');
      if (inputs.length < 2) return;

      // Skip if already processed or is a child of processed section
      if (sections.some(s => s.element.contains(el) || el.contains(s.element))) return;

      sections.push({
        element: el,
        position: 'beforebegin' // Insert before section
      });
    });
  }

  return sections;
}

function matchSectionToTips(element) {
  const text = normalise(element.textContent || '');
  const heading = element.querySelector('h1, h2, h3, h4, h5, legend, [class*="title"], [class*="heading"]');
  const headingText = heading ? normalise(heading.textContent || '') : '';
  const combined = headingText + ' ' + text.substring(0, 500);

  let bestMatch = null;
  let bestScore = 0;

  for (const [key, data] of Object.entries(CRO_TIPS)) {
    for (const kw of data.keywords) {
      if (combined.includes(kw) && kw.length > bestScore) {
        bestScore = kw.length;
        bestMatch = { key, ...data };
      }
    }
  }

  return bestMatch;
}

function injectTipBox(section, tipData, position) {
  const tipBox = document.createElement('div');
  tipBox.className = 'ph-cro-tips';
  tipBox.innerHTML = `
    <div class="ph-cro-tips-header">
      <span class="ph-cro-tips-icon">${tipData.icon}</span>
      <span class="ph-cro-tips-title">${tipData.title}</span>
      <button class="ph-cro-tips-close" title="Dismiss">×</button>
    </div>
    <div class="ph-cro-tips-body">
      ${tipData.tips.map(tip => `
        <div class="ph-cro-tip ph-cro-tip--${tip.type}">
          <span class="ph-cro-tip-icon">${TIP_ICONS[tip.type]}</span>
          <span class="ph-cro-tip-text">${tip.text}</span>
        </div>
      `).join('')}
    </div>
  `;

  // Add close handler
  tipBox.querySelector('.ph-cro-tips-close').addEventListener('click', () => {
    tipBox.classList.add('ph-cro-tips--hidden');
    setTimeout(() => tipBox.remove(), 300);
  });

  section.insertAdjacentElement(position, tipBox);
}

function injectProgressIndicator() {
  // Don't inject if already exists or no body
  if (document.querySelector('.ph-cro-progress')) return true;
  if (!document.body) {
    console.log('[Point Hacks] No document.body yet, will retry');
    return false;
  }

  const progress = document.createElement('div');
  progress.className = 'ph-cro-progress';
  progress.innerHTML = `
    <div class="ph-cro-progress-inner">
      <div class="ph-cro-progress-brand">
        <span class="ph-cro-progress-logo">✈️</span>
        <span class="ph-cro-progress-name">Point Hacks</span>
      </div>
      <div class="ph-cro-progress-stats">
        <div class="ph-cro-progress-stat">
          <span class="ph-cro-progress-value" id="phFieldsCompleted">0</span>
          <span class="ph-cro-progress-label">Fields Done</span>
        </div>
        <div class="ph-cro-progress-stat">
          <span class="ph-cro-progress-value" id="phTimeEstimate">~3 min</span>
          <span class="ph-cro-progress-label">Remaining</span>
        </div>
      </div>
      <button class="ph-cro-progress-minimize" id="phProgressMinimize">−</button>
    </div>
  `;

  try {
    document.body.appendChild(progress);
    console.log('[Point Hacks] Progress indicator injected successfully');

    // Track form completion
    trackFormProgress();

    // Minimize button
    const minBtn = document.getElementById('phProgressMinimize');
    if (minBtn) {
      minBtn.addEventListener('click', () => {
        progress.classList.toggle('ph-cro-progress--minimized');
      });
    }
    return true;
  } catch (e) {
    console.error('[Point Hacks] Failed to inject progress indicator:', e);
    return false;
  }
}

function trackFormProgress() {
  const updateProgress = () => {
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), select, textarea');
    let filled = 0;
    let total = 0;

    inputs.forEach(el => {
      if (!el.offsetParent) return;
      total++;
      if (el.value && el.value.trim()) filled++;
    });

    const remaining = total - filled;
    const estimate = remaining <= 3 ? '~1 min' : remaining <= 8 ? '~2 min' : '~3 min';

    const fieldsEl = document.getElementById('phFieldsCompleted');
    const timeEl = document.getElementById('phTimeEstimate');

    if (fieldsEl) fieldsEl.textContent = filled;
    if (timeEl) timeEl.textContent = estimate;
  };

  // Initial update
  updateProgress();

  // Update on input changes
  document.addEventListener('input', updateProgress);
  document.addEventListener('change', updateProgress);
}

// Inject tips when page is ready
function initCroTips() {
  const bank = detectBank();
  console.log('[Point Hacks] Initializing on:', window.location.hostname, '| Detected bank:', bank);

  if (!bank) {
    console.log('[Point Hacks] No bank detected, skipping CRO tips');
    return;
  }

  // Try immediately
  injectCroTips();

  // Retry after short delay (for SPAs that load content dynamically)
  setTimeout(injectCroTips, 800);
  setTimeout(injectCroTips, 2000);
  setTimeout(injectCroTips, 4000);
  setTimeout(injectCroTips, 6000);

  // Re-inject on SPA navigation / dynamic content
  const observer = new MutationObserver(() => {
    if (!progressInjected || !tipsInjected) {
      setTimeout(injectCroTips, 300);
    }
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } else {
    // Wait for body to exist
    const bodyWaiter = setInterval(() => {
      if (document.body) {
        clearInterval(bodyWaiter);
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        injectCroTips();
      }
    }, 100);
  }
}

// Start CRO tips system
console.log('[Point Hacks] Content script loaded on:', window.location.hostname);

function startCroSystem() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCroTips);
  } else {
    initCroTips();
  }
}

// Start immediately
startCroSystem();

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {

  // ── DETECT_BANK (sync) ─────────────────────────────────────────────────
  if (msg.type === 'DETECT_BANK') {
    sendResponse({ bank: detectBank() });
    return false;                               // no async needed
  }

  // ── FILL_FORM (async — retries for SPAs) ──────────────────────────────
  if (msg.type === 'FILL_FORM') {
    const tryFill = (retriesLeft) => {
      const filled = fillPage(msg.profile);
      const bank   = detectBank();

      if (filled.length > 0 || retriesLeft <= 0) {
        // Show on-page toast
        if (filled.length > 0) {
          showToast('Filled ' + filled.length + ' field' + (filled.length !== 1 ? 's' : '') + ' on ' + bank, 'ok');
        } else {
          showToast('No matching form fields found on this page', 'warn');
        }
        sendResponse({ success: true, filledCount: filled.length, filled, bank });
      } else {
        // Wait and retry (handles lazy-loaded SPA forms)
        setTimeout(() => tryFill(retriesLeft - 1), 1500);
      }
    };

    tryFill(2);      // up to 2 retries (total ≈ 3 s)
    return true;     // keep message channel open for async sendResponse
  }

  return false;
});
