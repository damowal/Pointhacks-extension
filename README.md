# Point Hacks AutoFill

A Chrome extension that auto-fills credit card application forms on major Australian bank websites.

## Supported Banks

- ANZ
- NAB
- Commonwealth Bank
- Westpac
- American Express Australia

## Features

- **One-click form filling** - Fill entire credit card application forms instantly
- **Smart field matching** - Uses keyword scoring to accurately match form fields
- **Cloud sync** - Optionally sync your profile across devices with Google sign-in
- **Address lookup** - Australian address autocomplete via Addressify API
- **Typeahead suggestions** - Email domains, first names, and occupations
- **SPA compatible** - Works with React, Vue, Angular, and other framework-based forms
- **Privacy focused** - All data stored locally by default

## Installation

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pointhacks-autofill.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked" and select the cloned directory

5. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon to open the popup
2. Fill in your personal details, employment info, and financials
3. Click "Save Locally" to store your profile
4. Navigate to a supported bank's credit card application page
5. Click the extension icon and press "Fill Form on Page"

## Form Fields

The extension supports comprehensive form filling including:

| Category | Fields |
|----------|--------|
| Personal | Salutation, name, DOB, gender, marital status, dependents, email, phone, citizenship |
| Address | Street address, suburb, state, postcode, years at address, residential status |
| Employment | Status, type, employer, occupation, industry, years employed |
| Income | Annual income, other income |
| Expenses | Rent/mortgage, groceries, transport, utilities, insurance, entertainment, childcare, education |
| Assets | Property value, vehicle value, savings |
| Liabilities | Credit limits, balances, loans, BNPL |
| Identity | Driver licence, passport, Medicare |

## Project Structure

```
├── manifest.json          # Chrome extension manifest (MV3)
├── popup.html/css/js      # Extension popup UI
├── content.js/css         # Injected into bank pages for form filling
├── background.js          # Service worker for OAuth handling
├── auth.js                # Firebase authentication
├── sync.js                # Cloud sync functionality
├── firebase-config.js     # Firebase configuration
├── address-lookup.js      # Addressify API integration
├── email-typeahead.js     # Email domain suggestions
├── name-typeahead.js      # First name suggestions
├── occupation-typeahead.js # Occupation suggestions
├── offers.js              # Credit card offers display
├── my-cards.js            # User's saved cards
└── icons/                 # Extension icons
```

## Technical Details

- **Manifest Version**: 3 (MV3)
- **Field Matching**: Collects hints from name, id, placeholder, labels, aria-labels, fieldset legends, and group labels. Normalises text and scores against keyword lists - longest match wins.
- **Framework Compatibility**: Uses native value setter with input/change event dispatch for React/Vue/Angular compatibility
- **SPA Support**: Retries filling up to 3 times with 1.5s delays for dynamically loaded forms

## Privacy

- All profile data is stored locally in Chrome storage by default
- Cloud sync is optional and requires explicit sign-in
- No data is sent to third parties except:
  - Addressify (for address autocomplete, when used)
  - Firebase (for cloud sync, when signed in)

## Development

No build step required. The extension runs directly from source files.

To modify:
1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card

## License

MIT License - see [LICENSE](LICENSE)

## Disclaimer

This extension is for personal use to simplify form filling. Users are responsible for ensuring the accuracy of auto-filled information. This project is not affiliated with any of the supported banks.
