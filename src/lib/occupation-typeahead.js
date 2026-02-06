'use strict';

// ─── Occupation Typeahead ──────────────────────────────────────────────────────
// Suggests common occupations/job titles as user types

const OCCUPATIONS = [
  // Technology & IT
  'Software Engineer', 'Software Developer', 'Web Developer', 'Frontend Developer',
  'Backend Developer', 'Full Stack Developer', 'Mobile Developer', 'iOS Developer',
  'Android Developer', 'DevOps Engineer', 'Site Reliability Engineer', 'Data Engineer',
  'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'AI Engineer',
  'Cloud Architect', 'Solutions Architect', 'Technical Architect', 'Systems Administrator',
  'Network Administrator', 'Database Administrator', 'IT Manager', 'IT Support',
  'Technical Support', 'Help Desk Analyst', 'Cybersecurity Analyst', 'Security Engineer',
  'QA Engineer', 'Test Engineer', 'Scrum Master', 'Product Manager', 'Product Owner',
  'Project Manager', 'Program Manager', 'Business Analyst', 'Systems Analyst',
  'UX Designer', 'UI Designer', 'UX/UI Designer', 'Graphic Designer', 'Web Designer',

  // Healthcare
  'Doctor', 'Physician', 'General Practitioner', 'Surgeon', 'Specialist',
  'Nurse', 'Registered Nurse', 'Nurse Practitioner', 'Midwife', 'Paramedic',
  'Dentist', 'Dental Hygienist', 'Pharmacist', 'Physiotherapist', 'Occupational Therapist',
  'Psychologist', 'Psychiatrist', 'Counsellor', 'Social Worker', 'Aged Care Worker',
  'Disability Support Worker', 'Medical Receptionist', 'Practice Manager',

  // Finance & Accounting
  'Accountant', 'Financial Analyst', 'Financial Planner', 'Financial Adviser',
  'Investment Analyst', 'Investment Banker', 'Bank Manager', 'Bank Teller',
  'Loan Officer', 'Mortgage Broker', 'Insurance Agent', 'Insurance Underwriter',
  'Auditor', 'Tax Accountant', 'Bookkeeper', 'Payroll Officer', 'Credit Analyst',
  'Risk Analyst', 'Compliance Officer', 'Actuary', 'Stockbroker', 'Trader',

  // Legal
  'Lawyer', 'Solicitor', 'Barrister', 'Paralegal', 'Legal Secretary',
  'Legal Assistant', 'Judge', 'Magistrate', 'Court Clerk',

  // Education
  'Teacher', 'Primary School Teacher', 'Secondary School Teacher', 'High School Teacher',
  'University Lecturer', 'Professor', 'Tutor', 'Teaching Assistant', 'Principal',
  'School Administrator', 'Librarian', 'Early Childhood Educator', 'Childcare Worker',
  'Special Education Teacher', 'Education Consultant', 'Training Coordinator',

  // Engineering
  'Engineer', 'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer',
  'Electronic Engineer', 'Chemical Engineer', 'Structural Engineer', 'Environmental Engineer',
  'Mining Engineer', 'Petroleum Engineer', 'Aerospace Engineer', 'Biomedical Engineer',
  'Industrial Engineer', 'Manufacturing Engineer', 'Process Engineer', 'Project Engineer',
  'Design Engineer', 'Maintenance Engineer', 'Quality Engineer', 'Safety Engineer',

  // Trades & Construction
  'Electrician', 'Plumber', 'Carpenter', 'Builder', 'Construction Worker',
  'Construction Manager', 'Site Manager', 'Foreman', 'Bricklayer', 'Painter',
  'Tiler', 'Roofer', 'Plasterer', 'Cabinet Maker', 'Joiner', 'Welder',
  'Mechanic', 'Auto Mechanic', 'Diesel Mechanic', 'HVAC Technician', 'Locksmith',
  'Landscaper', 'Gardener', 'Handyman',

  // Sales & Marketing
  'Sales Manager', 'Sales Representative', 'Account Manager', 'Account Executive',
  'Business Development Manager', 'Sales Consultant', 'Retail Sales Assistant',
  'Marketing Manager', 'Marketing Coordinator', 'Digital Marketing Manager',
  'SEO Specialist', 'Content Marketing Manager', 'Social Media Manager',
  'Brand Manager', 'Public Relations Manager', 'Communications Manager',
  'Advertising Manager', 'Media Buyer', 'Copywriter', 'Content Writer',

  // Administration & Office
  'Office Manager', 'Office Administrator', 'Administrative Assistant',
  'Executive Assistant', 'Personal Assistant', 'Receptionist', 'Secretary',
  'Data Entry Clerk', 'Filing Clerk', 'Mail Clerk', 'Customer Service Representative',
  'Call Centre Agent', 'Customer Support Specialist',

  // Management & Executive
  'CEO', 'Chief Executive Officer', 'CFO', 'Chief Financial Officer',
  'CTO', 'Chief Technology Officer', 'COO', 'Chief Operating Officer',
  'Managing Director', 'Director', 'General Manager', 'Operations Manager',
  'HR Manager', 'Human Resources Manager', 'Recruitment Manager', 'Recruiter',

  // Hospitality & Tourism
  'Chef', 'Head Chef', 'Sous Chef', 'Cook', 'Kitchen Hand', 'Baker', 'Pastry Chef',
  'Restaurant Manager', 'Hotel Manager', 'Front Desk Agent', 'Concierge',
  'Waiter', 'Waitress', 'Bartender', 'Barista', 'Housekeeper', 'Room Attendant',
  'Tour Guide', 'Travel Agent', 'Event Coordinator', 'Event Manager',

  // Retail
  'Retail Manager', 'Store Manager', 'Assistant Manager', 'Sales Associate',
  'Cashier', 'Stock Clerk', 'Merchandiser', 'Buyer', 'Visual Merchandiser',

  // Transport & Logistics
  'Truck Driver', 'Delivery Driver', 'Bus Driver', 'Taxi Driver', 'Uber Driver',
  'Forklift Operator', 'Warehouse Worker', 'Warehouse Manager', 'Logistics Manager',
  'Supply Chain Manager', 'Procurement Manager', 'Shipping Coordinator',
  'Pilot', 'Flight Attendant', 'Train Driver',

  // Creative & Media
  'Artist', 'Photographer', 'Videographer', 'Film Director', 'Producer',
  'Editor', 'Video Editor', 'Sound Engineer', 'Musician', 'Actor', 'Animator',
  'Journalist', 'Reporter', 'News Anchor', 'Broadcaster',

  // Science & Research
  'Scientist', 'Research Scientist', 'Laboratory Technician', 'Lab Manager',
  'Chemist', 'Biologist', 'Physicist', 'Geologist', 'Environmental Scientist',
  'Research Assistant', 'Clinical Research Coordinator',

  // Government & Public Service
  'Police Officer', 'Firefighter', 'Paramedic', 'Defence Force Member',
  'Public Servant', 'Policy Analyst', 'Government Administrator',

  // Other Common
  'Consultant', 'Freelancer', 'Contractor', 'Self-Employed', 'Business Owner',
  'Entrepreneur', 'Real Estate Agent', 'Property Manager', 'Cleaner',
  'Security Guard', 'Personal Trainer', 'Fitness Instructor', 'Hairdresser',
  'Beautician', 'Massage Therapist', 'Veterinarian', 'Vet Nurse',
  'Farmer', 'Farm Worker', 'Agricultural Worker'
].sort();

let occupationHighlightedIndex = -1;

function initOccupationTypeahead() {
  const input = document.getElementById('occupation');
  const dropdown = document.getElementById('occupationDropdown');

  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    const value = input.value.trim();

    if (value.length < 2) {
      hideOccupationDropdown(dropdown);
      return;
    }

    // Filter matching occupations (case-insensitive, includes search term)
    const searchLower = value.toLowerCase();
    const startsWithMatches = OCCUPATIONS.filter(occ =>
      occ.toLowerCase().startsWith(searchLower)
    );
    const containsMatches = OCCUPATIONS.filter(occ =>
      !occ.toLowerCase().startsWith(searchLower) && occ.toLowerCase().includes(searchLower)
    );

    // Prioritize startsWith matches, then contains matches
    const matches = [...startsWithMatches, ...containsMatches].slice(0, 8);

    if (matches.length === 0 || (matches.length === 1 && matches[0].toLowerCase() === searchLower)) {
      hideOccupationDropdown(dropdown);
      return;
    }

    renderOccupationSuggestions(dropdown, matches, input, value);
  });

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    if (!dropdown.classList.contains('visible')) return;

    const items = dropdown.querySelectorAll('.autocomplete-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      occupationHighlightedIndex = Math.min(occupationHighlightedIndex + 1, items.length - 1);
      updateOccupationHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      occupationHighlightedIndex = Math.max(occupationHighlightedIndex - 1, 0);
      updateOccupationHighlight(items);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (occupationHighlightedIndex >= 0 && items[occupationHighlightedIndex]) {
        e.preventDefault();
        items[occupationHighlightedIndex].click();
      }
    } else if (e.key === 'Escape') {
      hideOccupationDropdown(dropdown);
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(() => hideOccupationDropdown(dropdown), 150);
  });
}

function renderOccupationSuggestions(dropdown, occupations, input, typed) {
  occupationHighlightedIndex = -1;
  const typedLower = typed.toLowerCase();

  dropdown.innerHTML = occupations.map(occ => {
    // Highlight the matching part
    const lowerOcc = occ.toLowerCase();
    const matchIndex = lowerOcc.indexOf(typedLower);
    let highlighted;

    if (matchIndex >= 0) {
      const before = occ.substring(0, matchIndex);
      const match = occ.substring(matchIndex, matchIndex + typed.length);
      const after = occ.substring(matchIndex + typed.length);
      highlighted = `${escapeOccHtml(before)}<strong>${escapeOccHtml(match)}</strong>${escapeOccHtml(after)}`;
    } else {
      highlighted = escapeOccHtml(occ);
    }

    return `
      <div class="autocomplete-item" data-value="${escapeOccHtml(occ)}">
        <span class="autocomplete-main">${highlighted}</span>
      </div>
    `;
  }).join('');

  dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
    item.addEventListener('click', () => {
      input.value = item.dataset.value;
      hideOccupationDropdown(dropdown);
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  dropdown.classList.add('visible');
}

function updateOccupationHighlight(items) {
  items.forEach((item, idx) => {
    item.classList.toggle('highlighted', idx === occupationHighlightedIndex);
  });
}

function hideOccupationDropdown(dropdown) {
  dropdown.classList.remove('visible');
  occupationHighlightedIndex = -1;
}

function escapeOccHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOccupationTypeahead);
} else {
  initOccupationTypeahead();
}
