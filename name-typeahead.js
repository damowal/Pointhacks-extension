'use strict';

// ─── First Name Typeahead ──────────────────────────────────────────────────────
// Suggests common first names as user types

const FIRST_NAMES = [
  // Male names - popular in Australia
  'James', 'John', 'Michael', 'David', 'Robert', 'William', 'Thomas', 'Daniel',
  'Matthew', 'Christopher', 'Andrew', 'Joshua', 'Anthony', 'Mark', 'Paul',
  'Steven', 'Kevin', 'Jason', 'Brian', 'George', 'Edward', 'Richard', 'Charles',
  'Joseph', 'Timothy', 'Ryan', 'Benjamin', 'Nicholas', 'Samuel', 'Alexander',
  'Patrick', 'Peter', 'Luke', 'Jack', 'Oliver', 'Noah', 'Ethan', 'Liam',
  'Mason', 'Jacob', 'Logan', 'Lucas', 'Henry', 'Sebastian', 'Aiden', 'Owen',
  'Dylan', 'Nathan', 'Adrian', 'Aaron', 'Adam', 'Cameron', 'Connor', 'Jayden',
  'Hunter', 'Lachlan', 'Cooper', 'Harrison', 'Archer', 'Hugo', 'Leo', 'Max',
  'Oscar', 'Charlie', 'Harry', 'Angus', 'Finn', 'Riley', 'Kai', 'Xavier',

  // Female names - popular in Australia
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan',
  'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra',
  'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Dorothy', 'Carol',
  'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura',
  'Cynthia', 'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela',
  'Emma', 'Nicole', 'Helen', 'Samantha', 'Katherine', 'Christine', 'Debra',
  'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather', 'Diane',
  'Ruth', 'Julie', 'Olivia', 'Joyce', 'Virginia', 'Victoria', 'Kelly', 'Lauren',
  'Christina', 'Joan', 'Evelyn', 'Judith', 'Megan', 'Andrea', 'Cheryl', 'Hannah',
  'Jacqueline', 'Martha', 'Gloria', 'Teresa', 'Ann', 'Sara', 'Madison', 'Frances',
  'Kathryn', 'Janice', 'Jean', 'Abigail', 'Alice', 'Judy', 'Sophia', 'Grace',
  'Denise', 'Amber', 'Doris', 'Marilyn', 'Danielle', 'Beverly', 'Isabella',
  'Theresa', 'Diana', 'Natalie', 'Brittany', 'Charlotte', 'Marie', 'Kayla', 'Alexis',
  'Lori', 'Chloe', 'Ava', 'Mia', 'Zoe', 'Lily', 'Ella', 'Ruby', 'Sophie',
  'Amelia', 'Isla', 'Harper', 'Willow', 'Ivy', 'Matilda', 'Evie', 'Sienna',
  'Scarlett', 'Aria', 'Layla', 'Audrey', 'Lucy', 'Stella', 'Georgia', 'Piper'
].sort();

let nameHighlightedIndex = -1;

function initNameTypeahead() {
  const input = document.getElementById('firstName');
  const dropdown = document.getElementById('firstNameDropdown');

  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    const value = input.value.trim();

    if (value.length < 1) {
      hideNameDropdown(dropdown);
      return;
    }

    // Filter matching names (case-insensitive, starts with)
    const searchLower = value.toLowerCase();
    const matches = FIRST_NAMES.filter(name =>
      name.toLowerCase().startsWith(searchLower)
    ).slice(0, 8);

    if (matches.length === 0 || (matches.length === 1 && matches[0].toLowerCase() === searchLower)) {
      hideNameDropdown(dropdown);
      return;
    }

    renderNameSuggestions(dropdown, matches, input, value);
  });

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    if (!dropdown.classList.contains('visible')) return;

    const items = dropdown.querySelectorAll('.autocomplete-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      nameHighlightedIndex = Math.min(nameHighlightedIndex + 1, items.length - 1);
      updateNameHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nameHighlightedIndex = Math.max(nameHighlightedIndex - 1, 0);
      updateNameHighlight(items);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (nameHighlightedIndex >= 0 && items[nameHighlightedIndex]) {
        e.preventDefault();
        items[nameHighlightedIndex].click();
      }
    } else if (e.key === 'Escape') {
      hideNameDropdown(dropdown);
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(() => hideNameDropdown(dropdown), 150);
  });
}

function renderNameSuggestions(dropdown, names, input, typed) {
  nameHighlightedIndex = -1;
  const typedLower = typed.toLowerCase();

  dropdown.innerHTML = names.map(name => {
    // Highlight the matching part
    const matchEnd = typed.length;
    const highlighted = `<strong>${escapeNameHtml(name.substring(0, matchEnd))}</strong>${escapeNameHtml(name.substring(matchEnd))}`;
    return `
      <div class="autocomplete-item" data-value="${escapeNameHtml(name)}">
        <span class="autocomplete-main">${highlighted}</span>
      </div>
    `;
  }).join('');

  dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
    item.addEventListener('click', () => {
      input.value = item.dataset.value;
      hideNameDropdown(dropdown);
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  dropdown.classList.add('visible');
}

function updateNameHighlight(items) {
  items.forEach((item, idx) => {
    item.classList.toggle('highlighted', idx === nameHighlightedIndex);
  });
}

function hideNameDropdown(dropdown) {
  dropdown.classList.remove('visible');
  nameHighlightedIndex = -1;
}

function escapeNameHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNameTypeahead);
} else {
  initNameTypeahead();
}
