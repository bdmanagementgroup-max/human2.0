# Paywall Content Expansion — Phase 1: Flesh Out Existing Stubs

**Date:** 2026-07-30
**Status:** Approved

## Problem

The content catalog (`src/db/schema.ts` → `tracks`/`content`, seeded via `scripts/seed.ts`) is fully architected: 9 tracks, 31 content items, all `isPublished: true`, with well-targeted titles and metadata. But a database audit (querying the live Neon DB directly) found the actual `body` field on every item is 105–173 characters — one or two sentences — not real content. None have `videoUrl` or `downloadUrl` set. A subscriber who pays today reaches a paywall that opens onto a single paragraph.

This is a content-writing gap, not a code/architecture gap. This spec covers writing real content into the slots that already exist and already render correctly (`app/content/[slug]/page.tsx` renders `content.body` as raw HTML via `dangerouslySetInnerHTML` inside a `prose prose-invert` container).

## Scope

23 of the 31 existing content items get full, real content written now:

| Type | Count | Premium | Free |
|---|---|---|---|
| Guide | 10 | 1 (GDPR/CCPA, privacy track) | 9 (one per track) |
| Playbook | 6 | 6 | 0 |
| Template | 4 | 4 | 0 |
| Code | 3 | 3 | 0 |
| **Total in scope** | **23** | **14** | **9** |

**Deferred to Phase 2 (not in this spec):** 7 workshops + 1 audio roundtable (8 items). These imply real video/audio recording, which has a different production process and isn't achievable by writing alone. Their existing stub metadata is left as-is.

**Non-goals:** no new tracks, no new content items beyond the existing 31, no DB schema changes, no file-hosting infrastructure for downloads, no admin UI changes, no video/audio production.

## Content depth and structure per type

All bodies are HTML strings matching the existing style already used in `scripts/seed.ts` (`<h2>`, `<p>`, `<ul>`, etc.), since that's what the renderer expects.

- **Guides** (10 total: 9 free + 1 premium): ~800–1200 words. Decision-framework style matching their existing titles (e.g. "X vs Y: tradeoffs for Z"). Practical and opinionated. No fabricated specific pricing or benchmark numbers (these go stale and erode trust) — comparisons are qualitative, with an explicit note to "check current pricing" where a number would normally go.
  - Free guides: ~800–1000 words. These are the conversion mechanism (the only content a non-subscriber sees), so they get real depth, not filler — just less than premium playbooks.
  - The 1 premium guide (GDPR/CCPA Basics): ~1000–1200 words, compliance-checklist style.
- **Playbooks** (6, all premium): ~1200–1800 words. Numbered, step-by-step operational process with concrete decision points. These are the highest-value premium items and get the most depth.
- **Templates** (4, all premium): Short explanation (what it's for, how to use it, when to reach for it) + the actual file content embedded as `<pre><code>` blocks (e.g. a real `docker-compose.yml`, a real content-calendar structure, a real shot-list template). Per decision: no external file hosting — the file content lives directly in the body.
- **Code items** (3, all premium): Short explanation + real, functional starter code in `<pre><code>` blocks (e.g. an agent retry/memory loop, a QLoRA training script skeleton, an STT→LLM→TTS pipeline scaffold). Working patterns illustrating the described architecture, not pseudocode.

## Delivery mechanism

All body content is written directly into the `seedContent` array in `scripts/seed.ts`, replacing the current one-sentence `body` values. `npm run db:seed` is then re-run to push to Neon. The seed script already performs `onConflictDoUpdate` keyed on `content.slug` (see `scripts/seed.ts` lines ~568–574), so re-running it safely updates the 23 existing rows in place without creating duplicates or requiring a migration.

## Sequencing

Content is written in batches by track (roughly 2–3 tracks per pass), not as one single edit, so a mistake or bad batch doesn't block the rest of the work:

1. infrastructure + agents
2. video + voice
3. marketing + sales
4. creative + privacy
5. finetuning

After each batch: re-run `npm run db:seed`, spot-check that the batch's items round-trip correctly (title/body match what was written).

## Verification

- `npm run build` after all batches are seeded, to confirm no type errors were introduced.
- Load one item of each content type (guide, playbook, template, code) in the dev server (`npm run dev`) and view `/content/<slug>` to confirm the HTML renders correctly inside the `prose` container — headings, lists, and specifically `<pre><code>` blocks, since code blocks are new content in this table (existing stub content never exercised that rendering path).
- Confirm the free/premium gate still behaves correctly (free guides visible without subscription, the other 14 items still gated) — this logic is unchanged, but worth confirming nothing regressed.

## Open follow-up (Phase 2, out of scope here)

The 7 workshops + 1 audio item need a decision on production approach before they can ship: convert to written long-form format (deliverable via writing, like this phase), or write full scripts and hold `videoUrl`/audio empty until recorded. Revisit after Phase 1 ships.
