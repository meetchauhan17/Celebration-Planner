# Demonstration Script (2 Minutes)

This script walks through the core capabilities of the Celebration & Event Planner in 2 minutes.

---

### Step 1: Discover & Start Planning (0:00 - 0:20)
1. Navigate to the **Home Page (`/`)**:
   - Point out the broadsheet lead editorial headline, the compact factual strip (*3 event types*, *client-side browser storage*), and the directory navigation.
2. Click **"Start planning an event"** to open the **Plan Wizard (`/plan`)**.

---

### Step 2: The Multi-Step Wizard & Short-Notice Detection (0:20 - 0:45)
1. **Step 1 (The Basics)**:
   - Select event type: **Wedding**.
   - Name: `Diya & Kabir's Outdoor Celebration`.
   - Date: Select a date **20 days from today**.
   - Advance to Step 2.
2. **Step 2 (Scale & Place)**:
   - Guests: `180`.
   - City: `Jaipur` (Select **Tier 2 City**).
   - Venue: **Outdoor**.
   - Advance to Step 3.
3. **Step 3 (Money)**:
   - Budget: Enter `₹12,00,000`.
   - Point out the live per-guest figure (`₹6,667 per guest`) and note that it comfortably satisfies the ₹500 wedding catering floor.
   - Advance to Step 4.
4. **Step 4 (Preferences)**:
   - Select priorities: **Catering & Dining**, **Venue & Atmosphere**, and **Guest Comfort**.
   - Note how remaining priority checkboxes are disabled with clear accessible text when 3 are chosen.
   - Click **"Generate your celebration plan"**.

---

### Step 3: Event Overview & Compressed Timeline (0:45 - 1:05)
1. Arrive at the **Event Overview (`/events/[id]`)**:
   - Notice the newspaper front-page spread: countdown (`20 days`), per-guest budget, and the prominent **Next Action** callout highlighting the earliest critical milestone.
2. Navigate to **Timeline (`/events/[id]/timeline`)**:
   - Point out the short-notice feasibility warning banner: the engine detected that an outdoor wedding requires more than 20 days of normal lead time.
   - Overdue tasks have been automatically staggered starting from today, with critical tasks prioritized.

---

### Step 4: Budget Ledger Rebalancing & Vendor Booking (1:05 - 1:25)
1. Navigate to **Budget (`/events/[id]/budget`)**:
   - Review planned allocations and progress bars.
   - Edit the actual spend on Catering to show an over-budget status.
   - Click "Adjust planned budget" on Decor and demonstrate proportional rebalancing without letting contingency fall below 4%.
2. Navigate to **Vendors (`/events/[id]/vendors`)**:
   - Point out the red **"Next to book"** badge on the vendor matching the earliest critical timeline task.
   - Change a vendor's status to **Booked**, enter a quote, and click **"Use quote as actual spend"** to automatically sync with the budget ledger.

---

### Step 5: Creative Ideas, AI Assistant & Broadsheet Export (1:25 - 2:00)
1. Navigate to **Ideas (`/events/[id]/ideas`)**:
   - Select focus: **Décor & Ambiance**, mood: `Royal Rajasthani heritage`.
   - Click **"Generate ideas"**: observe the plain-text status announcement (no decorative spinners).
   - Review the unequal newspaper layout (large lead idea + 4 supporting ideas).
   - Click **"Save idea"** to pin a concept to the event scrapbook.
2. Navigate to **Assistant (`/events/[id]/assistant`)**:
   - Click the prompt button: **"What should I do this week?"**.
   - View the grounded answer referencing actual Rajasthan outdoor wedding tasks, with honest attribution (*"Answered by AI"* or *"Answered from your plan data"*).
3. Navigate to **Summary (`/events/[id]/summary`)**:
   - Scroll through the unified broadsheet displaying the headline, budget ledger, top 10 milestones, vendor commitments, catering headcount, and pinned ideas.
   - Click **"Download calendar (.ics)"** to export the compliant iCalendar file.
   - Click **"Print this plan"** to trigger the clean print stylesheet (notice how navigation, buttons, and colors convert cleanly to a printed physical sheet).

