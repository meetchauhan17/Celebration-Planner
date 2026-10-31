# Celebration & Event Planner

## Chosen Vertical
**[Challenge 5] Celebration & Event Planner**

---

## Approach and Logic

### Two-Layer Architecture
The Celebration & Event Planner separates planning into two deliberate layers:
1. **Deterministic Calculation Engine (`/src/lib/engine`)**: Pure, reproducible mathematical and algorithmic logic with zero side effects and zero AI involvement. It powers:
   - Budget allocation, category floor guarantees (e.g. ₹500/guest wedding catering floor, ₹250/guest birthday, ₹150/guest community), priority shifts, and proportional rebalancing.
   - Lead-time scheduling, short-notice compression, and critical task risk assessment.
   - Vendor procurement checklist generation, quote-to-budget comparison, and "next-to-book" prioritization.
   - Catering buffer computation (`confirmed + 10%` rounded up) and RFC 5545 iCalendar (`.ics`) generation.
2. **Generative AI Layer (`/src/lib/ai`)**: Grounded inspiration and planning concierges powered by Groq (`llama-3.3-70b-versatile`). It powers:
   - Structured idea generation with strict JSON schema adherence (`/api/ideas`).
   - Conversational planning concierge (`/api/assistant`) that references strictly aggregate event statistics.

### Why This Split Makes Decisions Explainable and Testable
- **Auditability**: Every rupee allocated in the budget is mathematically explainable through base weights, city tier multipliers, and priority adjustments.
- **Reliability & Testability**: 100% of mathematical formulas, schedule compressions, and quote checks are unit-tested without flaky mock completions or network dependencies.
- **Graceful Fallbacks**: If the AI key is absent or Groq returns 429/5xx, the deterministic engine seamlessly returns rule-based suggestions and answers.

### User Context Sensitivity
Outputs adapt deterministically based on user inputs:
- **Event Type**: Weddings prioritize hospitality and venue; birthdays anchor dining, entertainment, and cake; community gatherings emphasize safety permits, lighting/sound, and outreach.
- **Guest Count & Budget**: Determines per-guest metrics and enforces minimum catering viability floors.
- **Event Date**: Lead times adapt from comprehensive multi-month roadmaps to high-priority compressed schedules when notice is short.
- **City Tier**: Metro events scale venue and logistics allocations; tier-2 and towns preserve balanced spreads.
- **Venue Type**: Outdoor venues trigger infrastructure and weather contingency provisions; indoor venues prioritize hall decor.
- **Priorities & Dietary Needs**: Additive points boost mapped categories (e.g., `+3%` to catering for food priority).

#### 3 Concrete Examples
1. **Outdoor Wedding 20 Days Away (Metro, ₹15,00,000, 200 Guests)**:
   - *Timeline*: Detects short notice (< 30 days) and compresses overdue critical milestones (venue contract, marriage license, caterer deposit), spreading them over consecutive days to prevent overwhelming the planner.
   - *Budget*: Metro venue anchor + outdoor weather contingency reserve (≥ 4%).
   - *Vendors*: Flags venue and catering as urgent "Next to book".
2. **Indoor Birthday 60 Days Away (Tier-2 City, ₹50,000, 40 Guests)**:
   - *Budget*: Anchors 35% to catering, 15% to entertainment, 6% to cake, and 4% to return gifts.
   - *Timeline*: Normal cadence (venue selection at 30 days, cake tasting at 10 days, RSVPs at 14 days).
   - *Catering*: Automatic buffer suggests food orders for 44 attendees.
3. **Community Cultural Festival 120 Days Away (Town, ₹3,00,000, 500 Guests)**:
   - *Budget*: Allocates 12% to sound/lighting, 8% to safety/permits, and 10% to volunteer promotion.
   - *Timeline*: Municipal permit deadlines anchored 45 days prior, volunteer briefing 14 days out.

---

## How the Solution Works: 11-Page User Flow

1. **Home (`/`)**: Broad editorial lead spread introducing celebration planning capabilities, key features, and entry points into the planning wizard.
2. **Plan Wizard (`/plan`)**: Accessible 4-step wizard (*The Basics*, *Scale and Place*, *Money*, *Preferences*) with live per-guest calculations, catering floor warnings, and accessible keyboard navigation.
3. **Events Directory (`/events`)**: Horizontal directory of all saved celebrations, separating upcoming and past events, with delete confirmation dialogs and zero data loss.
4. **Event Overview (`/events/[id]`)**: Newspaper front-page overview with headline, editorial data summary, factual numerical strip, and urgent next-action callouts.
5. **Budget Ledger (`/events/[id]/budget`)**: Financial ledger displaying planned allocations, editable actual spend, live variance tracking, over-budget warnings, and proportional category rebalancing.
6. **Timeline Roadmap (`/events/[id]/timeline`)**: Grouped milestones (*Overdue*, *This Week*, *This Month*, *Later*, *Done*), critical/at-risk indicators, inline status controls, custom task creation, and timeline regeneration.
7. **Vendor Procurement (`/events/[id]/vendors`)**: Directory of key service providers, "Next to book" critical badges, quote-to-budget comparison, "Use quote as actual spend" actions, and question disclosures.
8. **Guest Directory & RSVPs (`/events/[id]/guests`)**: Complete attendee tracker with single and bulk import (deduplicated), per-diet breakdowns, 10% buffer catering headcount, and anti-injection CSV export.
9. **Ideas Desk (`/events/[id]/ideas`)**: AI-powered creative concept generator with unequal visual hierarchy (prominent lead entry + 4 supporting entries), provenance notes (*AI* vs *Fallback*), and a pinned scrapbook.
10. **Planning Assistant (`/events/[id]/assistant`)**: Two-column spread featuring instant inquiry prompts and an accessible conversation stream adhering to strict privacy filters.
11. **Summary Broadsheet (`/events/[id]/summary`)**: A unified, printable broadsheet compiling headlines, budget tables, critical tasks, vendors, catering numbers, and pinned concepts. Includes RFC 5545 `.ics` export, JSON backup/restore, and complete storage reset.

---

## Assumptions Made
- **Currency**: Defaults to Indian Rupee (INR / ₹) with standard locale formatting.
- **Catering Floors**: Benchmark catering floors (₹500 for weddings, ₹250 for birthdays, ₹150 for community gatherings) are realistic estimates for planning guidance.
- **City Tiers**: City tier classifications (metro, tier-2, town) are user-declared to reflect anticipated cost of living and vendor rates.
- **Vendor Rates**: Prices shown reflect user-entered estimates or vendor quotes; live marketplace pricing or availability is not queried.
- **Storage**: All personal event data lives entirely in the browser's `localStorage` (`celebration-planner:v1`); no account registration or external server database is required.
- **AI Guidance**: AI outputs serve as creative suggestions and directional planning support, not contracted commitments.

---

## Security and Privacy
- **Server-Side API Key**: `GROQ_API_KEY` is loaded strictly in server-only modules (`/src/lib/ai/groq.ts`) and is never leaked to the client bundle.
- **Zero HTML Injection**: No usage of `dangerouslySetInnerHTML`, `innerHTML`, or `eval()`.
- **Guest Privacy Enforcement**: Guest names, contact numbers, and personal details are strictly isolated in the browser and are never transmitted to AI endpoints.
- **CSV Formula Injection Sanitization**: All exported CSV cells starting with `=`, `+`, `-`, or `@` are safely prefixed with an apostrophe (`'`).
- **Input Validation & Rate Limiting**: All API routes enforce strict Zod schemas, payload size caps, and per-IP in-memory rate limiting.
- **Security Headers**: `next.config.mjs` configures strict Content Security Policy (`CSP`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, and `Permissions-Policy`.

---

## Accessibility
- **WCAG 2.1 AA Compliance**: All pages pass `axe-core` accessibility audits with **0 violations**.
- **Keyboard Navigation**: Comprehensive keyboard support across wizard fieldsets, interactive listing rows, disclosures, modal dialogs, and table inputs with visible focus rings.
- **Color Independence**: Color is never the sole conveyor of information (e.g. "Over", "Critical", "At risk", and "Next to book" badges all feature explicit text labels).
- **Contrast Ratios**: Body text (`#1a1917` ink) and muted labels (`#4a4843`) achieve high contrast ratios against canvas backgrounds (`#f9f8f5`), exceeding the 4.5:1 requirement.
- **Motion & Responsive Scaling**: Zero decorative animations or motion transitions (`prefers-reduced-motion` natively respected); tested without layout breakage at 200% and 400% zoom, as well as on 375px mobile viewports.

---

## Testing

### Running Tests
```bash
# Run all unit, integration, and accessibility tests
npm test

# Run tests with test coverage report
npm test -- --coverage
```

### Coverage Scope
- **Pure Engines (`/src/lib/engine`)**: >85% statement and branch coverage across budget allocation, scheduling, vendor prioritization, catering buffers, and iCalendar generation.
- **Domain Models (`/src/lib/domain`)**: Strict schema validation tests for brief parameters, planned event structures, and boundary checks.
- **UI & Accessibility**: Automated `jest-axe` audits across all 11 core routes.
- **End-to-End Integration Flow**: Full wizard completion validating budget sum integrity, milestone generation, and vendor procurement.

---

## Tech Stack and Setup Instructions

### Tech Stack
- **Framework**: Next.js 14 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (strict mode)
- **Styling**: Newsprint Editorial Design System (pure semantic CSS & custom properties; no Tailwind CSS)
- **Validation**: Zod
- **Testing**: Vitest, React Testing Library, `jest-axe`
- **AI SDK**: Groq SDK (`llama-3.3-70b-versatile`)

### Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd "Celebration & Event Planner"
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables (Optional)**:
   ```bash
   cp .env.example .env.local
   # Add your GROQ_API_KEY in .env.local (if omitted, high-quality rule-based fallback responses will be used)
   ```
4. **Run development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Limitations and Disclaimer
- **Not Legal, Financial, or Professional Advice**: This tool provides planning guidance, structural schedules, and estimated allocations.
- **Vendor & Authority Verification**: Always confirm formal contracts, pricing, licenses, noise permits, and security requirements with certified vendors and local municipal authorities.

