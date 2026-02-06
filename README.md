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

## Quick Start

### Development Setup

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Watch for changes (auto-rebuild)
npm run build:watch
```

### Load in Chrome

1. Run `npm run build`
2. Open `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `dist/` directory

## Project Structure

```
├── src/
│   ├── popup/              # Extension popup UI
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── content/            # Content scripts (injected into bank pages)
│   │   ├── content.js
│   │   └── content.css
│   ├── background/         # Service worker
│   │   └── background.js
│   ├── lib/                # Shared libraries
│   │   ├── auth.js         # Firebase authentication
│   │   ├── sync.js         # Cloud sync
│   │   ├── firebase-config.js
│   │   ├── address-lookup.js
│   │   ├── email-typeahead.js
│   │   ├── name-typeahead.js
│   │   ├── occupation-typeahead.js
│   │   ├── offers.js
│   │   └── my-cards.js
│   └── assets/
│       └── icons/          # Extension icons
├── scripts/                # Build scripts
│   ├── build.js            # Copies src to dist
│   └── zip.js              # Creates distributable ZIP
├── dist/                   # Built extension (gitignored)
├── .github/workflows/      # CI/CD
│   └── ci.yml
├── manifest.json           # Chrome extension manifest
├── package.json            # npm scripts & dependencies
├── eslint.config.js        # ESLint configuration
├── .prettierrc             # Prettier configuration
├── README.md
├── LICENSE
└── PRIVACY.md
```

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build extension to `dist/` |
| `npm run build:watch` | Watch mode - rebuild on changes |
| `npm run zip` | Build and create distributable ZIP |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run clean` | Remove `dist/` and ZIP files |

## Form Fields

The extension supports comprehensive form filling:

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

## CI/CD

GitHub Actions automatically:
- Runs ESLint and Prettier checks on PRs
- Builds the extension
- Creates ZIP artifacts
- Publishes releases when tags are pushed (`v*`)

### Creating a Release

```bash
# Update version in manifest.json and package.json
npm version patch  # or minor/major

# Push with tags
git push origin main --tags
```

## Technical Details

- **Manifest Version**: 3 (MV3)
- **Field Matching**: Collects hints from name, id, placeholder, labels, aria-labels, fieldset legends. Normalises text and scores against keyword lists - longest match wins.
- **Framework Compatibility**: Uses native value setter with input/change event dispatch for React/Vue/Angular compatibility
- **SPA Support**: Retries filling up to 3 times with 1.5s delays for dynamically loaded forms

## Privacy

- All profile data is stored locally in Chrome storage by default
- Cloud sync is optional and requires explicit sign-in
- See [PRIVACY.md](PRIVACY.md) for full privacy policy

## License

MIT License - see [LICENSE](LICENSE)

## Disclaimer

This extension is for personal use to simplify form filling. Users are responsible for ensuring the accuracy of auto-filled information. This project is not affiliated with any of the supported banks.
