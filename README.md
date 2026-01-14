# $ecurePoint

**The Budget App Built for Those Who Serve**

A comprehensive personal finance and budgeting application designed specifically for the military and veteran community. Unlike mainstream budget apps, $ecurePoint understands military pay structures, deployment cycles, and the unique financial situations service members face.

-----

## Table of Contents

- [Overview](#overview)
- [Target Audience](#target-audience)
- [Features](#features)
  - [Military-Specific Income Tracking](#military-specific-income-tracking)
  - [Military-Specific Expenses](#military-specific-expenses)
  - [Deployment Mode](#deployment-mode)
  - [Transition Tools](#transition-tools)
  - [Core Budgeting Features](#core-budgeting-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Subscription Tiers](#subscription-tiers)
- [Development Roadmap](#development-roadmap)
- [Design Philosophy](#design-philosophy)
- [Privacy & Security](#privacy--security)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

-----

## Overview

$ecurePoint fills a gap in the personal finance app market. Service members and veterans deal with pay structures, allowances, and financial situations that apps like Mint, YNAB, and Every Dollar simply don’t understand. BAH, BAS, drill pay, VA disability, deployment savings, TSP, SGLI—these aren’t edge cases for our users, they’re everyday reality.

This app speaks their language.

-----

## Target Audience

|User Group           |Key Needs                                                                    |
|---------------------|-----------------------------------------------------------------------------|
|**Active Duty**      |Track base pay + allowances, TSP contributions, deployment mode, PCS planning|
|**National Guard**   |Irregular drill pay tracking, civilian + military income management          |
|**Reserve**          |Same as Guard, plus activation pay transitions                               |
|**Veterans**         |VA disability tracking (tax-free), retirement pay, GI Bill housing allowance |
|**Military Families**|Family budget management, deployment financial planning, separation allowance|

-----

## Features

### Military-Specific Income Tracking

The app recognizes and properly categorizes all military income sources:

**Base Pay & Allowances**

- Base pay by rank and time in service (TIS)
- BAH (Basic Allowance for Housing) with location-based rates
- BAS (Basic Allowance for Subsistence)
- OHA (Overseas Housing Allowance) for OCONUS assignments
- COLA (Cost of Living Allowance)
- Family Separation Allowance (FSA)

**Special & Incentive Pays**

- Hazardous Duty Pay
- Flight Pay / Aviation Incentive Pay
- Sea Pay
- Jump Pay / Parachute Pay
- Dive Pay
- Foreign Language Proficiency Pay
- Special Duty Assignment Pay
- Hardship Duty Pay
- Hostile Fire / Imminent Danger Pay
- Combat Zone Tax Exclusion (CZTE) tracking

**Guard & Reserve Specific**

- Drill pay with irregular schedule support
- Annual Training (AT) pay
- Activation / Mobilization pay transitions
- TRICARE Reserve Select premiums

**Veteran Income**

- VA Disability Compensation (properly marked tax-free)
- Military Retirement Pay
- SBP (Survivor Benefit Plan) deduction tracking
- Combat-Related Special Compensation (CRSC)
- Concurrent Retirement and Disability Pay (CRDP)
- GI Bill Monthly Housing Allowance (MHA)
- VR&E (Voc Rehab) subsistence allowance

**Tax Intelligence**

- Automatic identification of tax-free income (BAH, BAS, VA disability, combat pay)
- Combat Zone Tax Exclusion period tracking
- Tax-advantaged vs taxable income reporting

### Military-Specific Expenses

Pre-built expense categories that matter:

**Military Deductions**

- SGLI / VGLI premiums
- TSP contributions (Traditional and Roth, tracked separately)
- AFSA / Armed Forces Benefit Association
- Military Star Card
- Allotments (with destination tracking)

**Healthcare**

- TRICARE Prime/Select/Reserve Select premiums
- TRICARE copays
- VA copays
- Dental (FEDVIP/TRICARE Dental)

**Military Life Expenses**

- Uniform and gear purchases (tax deduction flagging)
- Mess dues / dining facility charges
- Unit fund contributions
- PCS move expenses (reimbursable vs out-of-pocket tracking)
- Storage costs during PCS
- Military-specific travel

### Deployment Mode

A dedicated operational mode for deployed service members:

**Automated Adjustments**

- Reduced expense profile (suspend or reduce categories like dining out, entertainment, fuel)
- Hostile Fire / Imminent Danger Pay automatic inclusion
- Family Separation Allowance tracking
- Combat Zone Tax Exclusion activation

**Deployment Financial Tools**

- Savings acceleration tracking (watch your deployment savings grow)
- Allotment management suggestions
- Bill pay calendar adjusted for limited connectivity
- Emergency fund monitoring for family at home
- Return date countdown with projected savings total

**Offline Functionality**

- Full app functionality without internet connection
- Data syncs when connectivity restored
- Critical for deployed and field environments

### Transition Tools

For service members approaching ETS, retirement, or medical separation:

**Countdown & Planning**

- ETS/Retirement countdown with financial milestones
- Terminal leave value calculator
- Final PCS move entitlement estimator
- Leave sellback calculator
- Separation pay estimator (if applicable)

**Civilian Transition**

- Military to civilian income comparison calculator
- BAH loss impact projections
- Healthcare cost planning (loss of TRICARE)
- TSP rollover guidance
- VA disability claim timeline (expected income projection)

**BRS vs Legacy Retirement**

- Blended Retirement System calculator
- TSP matching tracker
- Continuation pay planning

### Core Budgeting Features

Beyond military-specific features, $ecurePoint is a fully-featured budget app:

**Budgeting Methods**

- Zero-based budgeting (every dollar has a job)
- Envelope/category-based budgeting
- Pay-yourself-first automated savings
- 50/30/20 rule templates
- Custom budget creation

**Income & Expense Management**

- Multi-income household support
- Recurring transaction automation
- Pay period alignment (1st and 15th military pay dates)
- Bill due date tracking with payment reminders
- Receipt photo capture and storage
- Transaction categorization (auto + manual)
- Split transaction support

**Savings & Goals**

- Multiple savings goals with visual progress
- Military-relevant goal templates:
  - ETS Fund
  - Deployment Savings
  - PCS Fund
  - Emergency Fund (3-6 months)
  - Vehicle Replacement
  - Home Down Payment
  - Vacation Fund
- Goal milestone celebrations

**Debt Management**

- Debt payoff tracking
- Snowball method (smallest balance first)
- Avalanche method (highest interest first)
- Debt-free date projection
- Interest saved calculations

**Reporting & Insights**

- Monthly spending reports
- Year-over-year comparisons
- Category trend analysis
- Net worth tracking
- Cash flow visualization
- Export to CSV/PDF

**Account Management**

- Multiple account support (checking, savings, credit cards)
- Manual account entry (no bank linking required for privacy-conscious users)
- Optional bank sync via Plaid (user choice)
- Account reconciliation tools

-----

## Tech Stack

|Layer               |Technology                                |Rationale                                                             |
|--------------------|------------------------------------------|----------------------------------------------------------------------|
|**Framework**       |React Native + Expo                       |Cross-platform (iOS + Android) from single codebase, rapid development|
|**Language**        |TypeScript                                |Type safety, better developer experience, fewer runtime errors        |
|**State Management**|Zustand or Redux Toolkit                  |Lightweight, predictable state management                             |
|**Navigation**      |React Navigation                          |Industry standard for React Native                                    |
|**Backend**         |Firebase or Supabase                      |Auth, database, real-time sync, serverless functions                  |
|**Database**        |Firestore or Supabase PostgreSQL          |Flexible document storage or relational as needed                     |
|**Local Storage**   |AsyncStorage + SQLite                     |Offline-first capability, local data persistence                      |
|**Authentication**  |Firebase Auth / Supabase Auth             |Email/password, OAuth providers                                       |
|**Payments**        |RevenueCat                                |Subscription management across iOS and Android                        |
|**Charts**          |Victory Native or React Native Chart Kit  |Data visualization                                                    |
|**Forms**           |React Hook Form + Zod                     |Form handling and validation                                          |
|**Styling**         |NativeWind (Tailwind for RN) or StyleSheet|Consistent, maintainable styling                                      |

-----

## Project Structure

```
securepoint/
├── app/                          # Expo Router app directory
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── dashboard.tsx
│   │   ├── transactions.tsx
│   │   ├── budget.tsx
│   │   ├── goals.tsx
│   │   └── settings.tsx
│   ├── deployment/               # Deployment mode screens
│   ├── transition/               # Transition planning screens
│   └── _layout.tsx
├── components/
│   ├── common/                   # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── dashboard/                # Dashboard-specific components
│   ├── transactions/             # Transaction components
│   ├── budget/                   # Budget components
│   └── military/                 # Military-specific components
│       ├── PayCalculator.tsx
│       ├── BAHLookup.tsx
│       ├── DeploymentMode.tsx
│       └── TransitionCountdown.tsx
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useBudget.ts
│   ├── useTransactions.ts
│   └── useMilitaryPay.ts
├── services/                     # External service integrations
│   ├── firebase/
│   ├── supabase/
│   └── revenueCat/
├── store/                        # State management
│   ├── authStore.ts
│   ├── budgetStore.ts
│   ├── transactionStore.ts
│   └── settingsStore.ts
├── utils/                        # Utility functions
│   ├── calculations/
│   │   ├── militaryPay.ts
│   │   ├── taxes.ts
│   │   └── budgetMath.ts
│   ├── formatters.ts
│   └── validators.ts
├── constants/                    # App constants
│   ├── militaryData/
│   │   ├── payTables.ts          # Base pay by rank/TIS
│   │   ├── bahRates.ts           # BAH rates by location
│   │   └── specialPays.ts
│   ├── categories.ts
│   └── theme.ts
├── types/                        # TypeScript type definitions
│   ├── military.ts
│   ├── budget.ts
│   ├── transaction.ts
│   └── user.ts
├── assets/                       # Images, fonts, etc.
├── app.json                      # Expo configuration
├── package.json
├── tsconfig.json
└── README.md
```

-----

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on physical device (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/securepoint.git
cd securepoint

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

```bash
# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Expo Go (scan QR code)
npx expo start
```

### Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build both
eas build --platform all
```

-----

## Environment Variables

Create a `.env` file in the project root:

```env
# Firebase Configuration (if using Firebase)
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Supabase Configuration (if using Supabase)
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# RevenueCat
REVENUECAT_IOS_KEY=your_ios_key
REVENUECAT_ANDROID_KEY=your_android_key

# Environment
NODE_ENV=development
```

**Note:** Never commit `.env` to version control. Add it to `.gitignore`.

-----

## Subscription Tiers

### Free Tier

- Basic budget creation and tracking
- Up to 100 transactions per month
- 3 months transaction history
- Single savings goal
- Standard expense categories
- Basic income tracking

### Premium - $9.99/month or $79.99/year

- Unlimited transactions
- Unlimited transaction history
- Unlimited savings goals
- All military-specific income types
- Deployment Mode
- Transition Planning Tools
- Custom categories
- Advanced reports and analytics
- Data export (CSV, PDF)
- Priority support
- No ads

### Revenue Projections

- Target: $500/month passive income
- Required subscribers at $9.99/month (after Apple’s 15% cut): ~59 users
- At 1.7% conversion rate: ~3,500 downloads needed
- Strategy: iOS-first (2.7x better monetization than Android)

-----

## Development Roadmap

### Phase 1: Foundation (MVP)

- [ ] Project setup (Expo, TypeScript, navigation)
- [ ] Authentication (email/password)
- [ ] Basic dashboard UI
- [ ] Manual transaction entry
- [ ] Simple category management
- [ ] Basic budget creation
- [ ] Local data persistence

### Phase 2: Core Budgeting

- [ ] Full transaction management (add, edit, delete)
- [ ] Recurring transactions
- [ ] Multiple accounts
- [ ] Budget vs actual tracking
- [ ] Basic reporting (monthly summary)
- [ ] Savings goals

### Phase 3: Military Features

- [ ] Military income types (base pay, BAH, BAS, special pays)
- [ ] Tax-free income designation
- [ ] Pay period alignment (1st and 15th)
- [ ] Military expense categories
- [ ] TSP contribution tracking
- [ ] BAH calculator integration

### Phase 4: Deployment Mode

- [ ] Deployment mode toggle
- [ ] Adjusted expense profiles
- [ ] Combat pay integration
- [ ] Offline functionality
- [ ] Deployment savings tracker
- [ ] Family budget separation

### Phase 5: Transition Tools

- [ ] ETS/Retirement countdown
- [ ] Terminal leave calculator
- [ ] Civilian income comparison
- [ ] VA disability projection
- [ ] Separation checklist

### Phase 6: Premium & Launch

- [ ] RevenueCat subscription integration
- [ ] Paywall implementation
- [ ] Advanced analytics
- [ ] Data export features
- [ ] App Store optimization
- [ ] Launch marketing

### Phase 7: Post-Launch

- [ ] User feedback implementation
- [ ] Bank sync option (Plaid)
- [ ] Widget support
- [ ] Apple Watch companion (stretch)
- [ ] Android feature parity
- [ ] Community features

-----

## Design Philosophy

### What We Are

- **Clean and professional.** This is a financial tool, not a game.
- **Respectful of service.** No patronizing “thank you for your service” pop-ups.
- **Functional first.** Every feature earns its place.
- **Accessible.** Works for an E-1 and an O-6.

### What We Are NOT

- **Tacky military themed.** No camo backgrounds. No eagles. No dog tags as icons.
- **Overly complicated.** If it needs a tutorial, it’s too complex.
- **Data hungry.** We collect what we need, nothing more.
- **Preachy.** We’re not here to lecture about finances.

### UI Guidelines

- Dark mode as default option (easier on eyes during night duty)
- High contrast for readability
- Large touch targets (usable with gloves in field)
- Minimal animations (fast, responsive feel)
- Clear visual hierarchy
- Consistent iconography

-----

## Privacy & Security

This community has security clearances. They handle classified information. They are, by training and necessity, privacy-conscious. We respect that.

### Our Commitments

**Data Minimization**

- We only collect data necessary for app functionality
- No tracking beyond basic analytics
- No third-party advertising SDKs

**User Control**

- All data can be exported at any time
- Account deletion removes all data permanently
- No data retention after deletion
- Local-first storage option available

**Transparency**

- Clear, readable privacy policy (not legal jargon)
- Explicit about what we collect and why
- No hidden data sharing

**Security Measures**

- End-to-end encryption for sensitive data
- Secure authentication
- Regular security audits
- No sensitive data in logs

**We Will NEVER**

- Sell your data to third parties
- Share your financial information with advertisers
- Use your data for purposes beyond app functionality
- Require bank account linking (optional feature only)

-----

## Contributing

This is currently a solo project, but contributions may be welcome in the future.

If you’re a veteran or service member with ideas for features, please reach out. Your perspective is valuable.

-----

## License

[To be determined - likely MIT or proprietary]

-----

## Support

**Found a bug?** Open an issue on GitHub.

**Feature request?** We’d love to hear it. Open a discussion.

**General questions?** [Contact method TBD]

-----

## Acknowledgments

Built by a veteran, for veterans and service members.

To those who serve, those who have served, and the families who support them—this one’s for you.

-----

*$ecurePoint is not affiliated with the Department of Defense, Department of Veterans Affairs, or any branch of the U.S. Armed Forces.*
