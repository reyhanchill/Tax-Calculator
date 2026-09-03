# TaxFlow — UK Tax Calculator & Decision Support System

A full-stack UK tax calculation platform built as a Final Year Project. TaxFlow helps individuals, self-employed workers, and small business owners understand their tax obligations across income tax, National Insurance, student loans, pensions, and capital gains.

Built with Next.js 16, React 19, Prisma, and Tailwind CSS.

## What It Does

TaxFlow is a decision-support prototype that estimates UK tax liabilities and provides personalised recommendations. Results are informational estimates and should be checked against HMRC guidance or with a qualified professional.

### Core Features

- **Per-employment PAYE engine** — each job is taxed using its own tax code (1257L, BR, D0, K codes, etc.) rather than blending everything into one calculation
- **Multi-employment support** — add multiple jobs with separate tax codes and pay frequencies; NI thresholds are applied per employer as HMRC requires
- **Tax code validation** — three-state classifier (valid, unusual-warning, invalid-block) that rejects incomplete codes and warns on non-standard ones
- **Emergency code handling** — W1/M1/X non-cumulative basis calculated per period then annualised
- **K-code support** — negative allowance codes that add to taxable income
- **9 tax years** — full dataset from 2018/19 to 2026/27 with year-specific rates, thresholds, and band structures
- **All four UK nations** — England, Scotland (6 bands including Advanced rate), Wales (C prefix), Northern Ireland
- **Scottish tax bands** — Starter (19%), Basic (20%), Intermediate (21%), Higher (42%), Advanced (45%), Top (48%)
- **Student loan repayments** — Plans 1, 2, 4, 5 and Postgraduate with year-specific thresholds
- **Pension auto-enrolment** — qualifying earnings calculation, salary sacrifice NIC savings, basic-rate tax relief
- **Capital gains tax** — residential property, shares/other assets, Business Asset Disposal Relief
- **Dividend and savings tax** — separate allowances and rate structures
- **Marriage Allowance** — M/N suffix code support with correct allowance transfer
- **Personal Allowance taper** — £100k–£125,140 zone with 60% effective marginal rate detection
- **Tax-saving recommendations** — contextual tips that adapt to income level, country, tax year, employment structure, and existing tax codes
- **Business tax estimation** — estimate company profit, Corporation Tax, VAT and director extraction
- **User accounts** — registration, email verification and password reset
- **GDPR compliance** — data export, account deletion, audit logging

## How It Works

### Tax Calculation Flow

1. User enters income per employment (with tax code and pay frequency for each)
2. The parser validates each tax code and classifies it as valid/unusual/invalid
3. If any active employment has an invalid code, calculation is blocked with an error
4. For valid inputs, the per-employment PAYE engine runs:
   - Determines which employment gets the Personal Allowance (highest-income allowance-bearing code)
   - Applies rate-rule codes (BR, D0, D1) as flat-rate tax on the relevant employment
   - Handles K-code taxable uplifts per employment
   - Runs emergency codes on a non-cumulative period basis
5. NIC is calculated separately per employer (each job gets its own Primary Threshold)
6. Student loans, pension, CGT, and other deductions are computed
7. Results show both the per-employment PAYE deduction breakdown and a combined annual-liability comparison
8. Recommendations engine generates contextual tax-saving tips based on the user's specific situation

### Architecture

The tax engine is entirely pure-function based — no side effects, no database calls. All tax calculation logic lives in `src/lib/tax/` and can be tested independently of the UI. The UI layer in `src/components/` consumes the engine through React hooks and `useMemo` for reactive recalculation.

The application uses Next.js server actions for authentication, account settings and supporting data operations.

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── dashboard/                # Main authenticated workspace
│   ├── login/                    # Authentication pages
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── verify-email/
│   ├── about-us/
│   ├── privacy/
│   └── roadmap/
│
├── components/
│   ├── TaxCalculator.tsx         # Individual tax calculator UI (890 lines)
│   │                               Per-employment inputs, tax code validation,
│   │                               PAYE breakdown display, annual comparison
│   ├── BusinessTaxHub.tsx        # Business tax estimation tool
│   ├── SelfEmployedAssessment.tsx # Self-employment tax estimator
│   ├── SettingsHub.tsx           # User preferences (country, tax code, pension rates)
│   ├── DashboardShell.tsx        # Authenticated layout wrapper
│   ├── ProfileView.tsx           # User profile and security settings
│   ├── tax-calculator/
│   │   └── constants.ts          # Income type definitions, frequency multipliers
│   ├── business-tax/
│   │   ├── constants.ts          # Business input configuration
│   │   └── ui.tsx                # Business tax UI components
│   ├── self-employed/
│   │   └── constants.ts          # Self-employment input configuration
│   └── landing/                  # Marketing/landing page sections
│       ├── HeroSection.tsx
│       ├── FeaturesSection.tsx
│       ├── PlatformModulesSection.tsx
│       └── ...                   # Other landing page components
│
├── lib/
│   ├── tax/                      # ── Tax Engine (pure functions) ──
│   │   ├── calculators/
│   │   │   └── index.ts          # Core calculation engine (1,237 lines)
│   │   │                           - parseTaxCode(): tax code parser + 3-state validator
│   │   │                           - calculateIncomeTax(): combined annual-liability method
│   │   │                           - calculatePerEmploymentPAYEIncomeTax(): per-job PAYE engine
│   │   │                           - calculateNIC(): per-employer NI with Class 1/2/4
│   │   │                           - calculateStudentLoans(): Plans 1/2/4/5/PG
│   │   │                           - calculatePension(): auto-enrolment + salary sacrifice
│   │   │                           - calculateCGT(): capital gains with BADR
│   │   │                           - calculateFullTax(): orchestrator that runs everything
│   │   │
│   │   ├── data/
│   │   │   └── index.ts          # HMRC rates and thresholds (830 lines)
│   │   │                           9 tax years: 2018/19 → 2026/27
│   │   │                           Income tax bands, NIC thresholds, student loan
│   │   │                           thresholds, pension limits, CGT rates
│   │   │                           Scottish bands maintained separately per year
│   │   │
│   │   ├── types.ts              # TypeScript interfaces for all tax data and results
│   │   ├── recommendations.ts   # Contextual tax-saving tips engine
│   │   │                           Uses year-specific data, detects Marriage Allowance
│   │   │                           codes, multi-employment awareness, Scottish rates
│   │   ├── taxCodeDataset.ts     # Tax code reference data (BR, D0, K codes, suffixes)
│   │   ├── countryTaxCode.ts     # S/C prefix handling for Scottish/Welsh codes
│   │   └── actions.ts            # Server actions: save/update/delete tax entries,
│   │                               GDPR export, account deletion, audit logging
│   │
│   ├── auth/                     # Authentication (bcrypt, email verification, sessions)
│   ├── email/                    # Email verification and password reset
│   ├── newsletter/               # Early-access signup handling
│   ├── db.ts                     # Prisma client singleton
│   └── utils.ts                  # Currency formatting, pay period conversion
│
prisma/
├── schema.prisma                 # Database schema
│                                   User, UserSettings, TaxEntry, IncomeItem,
│                                   Deduction, CapitalGain, AuditLog,
│                                   and supporting account records
└── migrations/                   # Database migration history
```

## Local Setup

1. Copy the environment template and configure your database URL:

```bash
cp .env.example .env
```

2. Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Database

Prisma uses the database configured in `DATABASE_URL`.

- **Local/dev**: PostgreSQL.
- **Production (Vercel)**: use hosted PostgreSQL (Neon, Supabase, Vercel Postgres) and set `DATABASE_URL` in Vercel Environment Variables.

## Deployment

The `build` script runs:
1. `prisma generate`
2. `prisma migrate deploy`
3. `next build`

Vercel applies schema migrations automatically on deploy.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components, Server Actions)
- **UI**: React 19, Tailwind CSS 4, Radix UI primitives
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (production)
- **Auth**: Custom implementation with bcrypt, signed sessions, email verification and password reset
- **Charts**: Recharts
- **Language**: TypeScript 5

## Limitations and Future Work

- Pension annual allowance taper logic (£260k threshold) is stored in data but not enforced in calculations
- Blind Person's Allowance is stored per year but not applied in the calculator
- High Income Child Benefit Charge is not implemented
- Company directors' annual NI method is not implemented (types exist but no calculation logic)
- The app provides estimates only and should not be used as a substitute for professional tax advice
