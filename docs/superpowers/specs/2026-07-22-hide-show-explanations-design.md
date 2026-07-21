# Design Spec: Hide/Show Explanations

**Date:** 2026-07-22
**Client:** Stories (café/F&B brand), engagement led by Ru'ya 360 / KiTS
**Author:** Kits (assistant) + user, via brainstorming session
**Status:** Approved by user, ready for implementation planning

## 1. Purpose

This is the second of three planned changes to the Stories Pricing Benchmark dashboard (the table-decomposition work — sub-project A — is complete and merged to `main`; the Stories brand-color rebrand — sub-project C — is sequenced after this one).

The dashboard currently has one toggle ("Show/Hide Recommendations") that only controls the Findings & Recommendations section, defaults to shown, and every other explanatory paragraph on the page (Methodology, each section's intro text) is always visible and always cluttering the view. The user wants the dashboard to declutter to a "board-facing, no narration" view by default, with explanatory prose available on demand — either all at once (for someone presenting live) or one paragraph at a time (for someone browsing standalone who wants just one thing explained).

## 2. Scope

**In scope:**
- A renamed, repurposed global toggle: "Show Explanations" / "Hide Explanations", defaulting to **hidden**.
- A new per-paragraph reveal control (a "?" button) that lets a viewer reveal one explanatory paragraph without exposing everything else.
- Applying both to every current explanatory paragraph on the page (enumerated in §4).
- Preserving the existing all-or-nothing show/hide behavior of Findings & Recommendations exactly as it works today, just re-keyed to the renamed/re-defaulted flag.

**Out of scope:**
- The Stories brand-color rebrand (sub-project C, separate spec).
- Any change to what data or charts are shown — this only affects visibility of explanatory *text*.
- Persisting the toggle/reveal state across a page reload (not requested; current implementation already resets on reload via plain React state, and this spec doesn't change that).

## 3. Interaction Model

Two controls work together:

1. **Global toggle** (existing button, top of page, relabeled): "Show Explanations" reveals every explanatory paragraph across the whole page at once — the presenter-narration view. "Hide Explanations" (the default) hides all of them, each replaced by a small "?" button in its place.
2. **Per-paragraph "?" button**: while the global state is "hidden," clicking any individual "?" reveals just that one paragraph, without affecting any other paragraph or the global state. This lets a board member browsing the page alone open one thing they're curious about without triggering full presenter mode.

**Reset behavior:** flipping the global toggle to "Hide Explanations" resets every individually-revealed paragraph back to hidden — a viewer can't end up in a confusing half-revealed state after toggling globally. Flipping to "Show Explanations" reveals everything immediately, and the per-paragraph "?" buttons have nothing to do while that's on (there is nothing left to reveal).

## 4. Scope of Application

**Hidden by default, each gets a "?" reveal:**
- The cover's intro sentence ("A full-menu competitive price positioning analysis for Stories…").
- Each `ReportSection` instance's 4 intro paragraphs (heatmap, category positioning, price positioning map, data explorer) — so this applies once per category-group report (Main Menu, Frozen Yogurt Bar, Non-Dairy Menu, and any future groups).
- The Categories In Progress section's intro line.
- The entire Methodology & Data Sources body — "Where this data comes from," the Definitions list, and (when present) Data quality notes — behind **one** "?" for the whole section, not one per sub-block.

**Unchanged — whole-section on/off, tied to the same global flag, no separate "?":**
- Findings & Recommendations — the entire section, including its own heading, continues to show/hide as a unit exactly as it does today. This is the "old functionality" the user asked to preserve.

**Always visible, untouched by this feature:**
- Context Bar (client/period/currency/FX metadata strip).
- Executive Summary (headline sentence + scorecards) — core content, not explanatory prose.
- Footer (confidentiality notice, report period, source).
- Chart tooltips (Category Price Map, Category Positioning) — interactive data display, not page-level explanatory text.
- Data Explorer's results-count line and its row drill-down panel — functional/data content.
- Categories In Progress cards themselves (category name + "Data not yet available").

## 5. State Model

The existing `PresenterModeContext` (React context + `useState`, no persistence) is reused, not replaced:
- Its exposed boolean field is renamed from `showRecommendations` to `showExplanations`.
- Its default initial value changes from `true` to **`false`**.
- The `toggle` function is unchanged in shape.

A new component (name decided at implementation-planning time, e.g. `Explain`) wraps any paragraph that should follow the per-paragraph reveal pattern:
- Reads `showExplanations` from context.
- Holds its own local `revealed` boolean, initially `false`.
- If `showExplanations` is `true`, or the local `revealed` is `true`, renders its children (the real paragraph) directly.
- Otherwise renders a small "?" button; clicking it sets local `revealed` to `true`.
- When `showExplanations` transitions from `true` to `false` (global hide), the local `revealed` state resets to `false` — implementing the reset behavior in §3.

Findings & Recommendations keeps its current pattern of reading the boolean directly and conditionally rendering the whole section — it does not use the new per-paragraph wrapper.

## 6. Visual Design

- The "?" button is a small circular control using the existing Ocean color tokens (consistent with the current toggle button's `rounded-full border border-ocean/20 text-ocean` styling) — not a new visual language.
- It renders in the same document position the paragraph would otherwise occupy, so revealing it doesn't cause large layout jumps elsewhere on the page.
- No new color, animation, or component library is introduced.

## 7. Testing Considerations (for the implementation plan to cover)

- `Explain` component: renders children when `showExplanations` is true; renders a "?" button when false; clicking reveals; toggling the global context from true→false resets an already-revealed instance back to hidden.
- `PresenterModeToggle`: label text updated to "Show Explanations" / "Hide Explanations".
- Existing tests that assumed the old default (`showRecommendations: true`, initial render showing Findings & Recommendations without clicking) need updating for the new default (`showExplanations: false`) — at minimum `PresenterMode.test.tsx`.
- Each explanatory paragraph's call site (page.tsx, ReportSection.tsx, Methodology.tsx) needs its existing tests checked for whether they currently assert on that paragraph's text being present by default — if so, those assertions need to move behind either flipping `showExplanations` on or clicking the paragraph's own "?" first.

## 8. Non-Goals (this spec)

- The Stories brand-color rebrand — separate spec, sequenced after this one.
- Any new data or chart content.
- Cross-session/reload persistence of explanation visibility state.

## 9. Open Assumptions to Confirm

- Internal identifiers (`PresenterModeContext`, `PresenterModeProvider`, `usePresenterMode` file/hook names) are kept as-is rather than renamed to something like "ExplanationContext" — the underlying concept (presenter/narrated view vs. board-facing/quiet view) still fits the existing name, and renaming would be pure churn with no user-visible effect. Only the exposed field name (`showExplanations`) and the button copy change.
