# Paywall Content Expansion (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the one-sentence placeholder `body` on 23 of the 31 existing content items with real, full-length content, so the paywall delivers actual value instead of a single paragraph.

**Architecture:** All content lives in the `seedContent` array in `scripts/seed.ts` as HTML strings (matching the style the renderer already expects). No schema or route changes. `npm run db:seed` upserts by `content.slug` via `onConflictDoUpdate`, so re-running it after editing bodies safely updates the live Neon rows in place.

**Tech Stack:** TypeScript, Drizzle ORM, Neon Postgres, `tsx` + `dotenv-cli` (already wired via `npm run db:seed`).

## Global Constraints

- Body HTML must use the existing style already present in `scripts/seed.ts`: `<h2>` section headings, `<p>` paragraphs, `<ul>/<li>` for lists, `<pre><code>` for code/config blocks. No markdown — the renderer does `dangerouslySetInnerHTML` on raw HTML (`app/content/[slug]/page.tsx:301`).
- No fabricated specific prices, benchmark scores, or version-specific claims that go stale fast (e.g. "$0.42/hr" or "40% faster"). Use qualitative comparisons and explicit "check current pricing/docs" pointers instead.
- Word count targets below are targets, not hard limits — favor being genuinely useful over hitting a number exactly.
- Workshops (7 items) and the audio roundtable (1 item) are explicitly OUT OF SCOPE for this plan — do not touch their `body` fields.
- Every touched item keeps its existing `slug`, `type`, `track`, `isPremium`, `isPublished`, `durationMinutes`, `difficulty`, `tags`, `title`, `description` — only `body` changes.

---

## Task 1: Verification tooling + Infrastructure & Agents content (6 items)

**Files:**
- Create: `scripts/verify-seed.ts` (already created — see below, reuse in all later tasks)
- Modify: `scripts/seed.ts` (6 content entries: `self-hosted-stack-afternoon`, `gpu-rental-arbitrage`, `self-hosted-docker-compose-template`, `agents-vs-workflows`, `agent-loop-starter-kit`, `debugging-stuck-agents`)

**Interfaces:**
- Produces: `scripts/verify-seed.ts` — run as `dotenv -e .env.local -- tsx scripts/verify-seed.ts <slug> [<slug>...]`, prints body char-length and whether it contains `<h2>` for each slug, `MISSING` if the slug doesn't exist. Exit code 0 on success (it always exits 0 unless the DB query itself throws — its job is to print for a human to eyeball, not to assert).

- [x] **Step 1: Create the verification script**

Already created at `scripts/verify-seed.ts`:

```typescript
import { getDb, content } from "@/src/db";
import { inArray } from "drizzle-orm";

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.error("Usage: dotenv -e .env.local -- tsx scripts/verify-seed.ts <slug> [<slug> ...]");
  process.exit(1);
}

async function main() {
  const db = getDb();
  const rows = await db
    .select({ slug: content.slug, title: content.title, body: content.body })
    .from(content)
    .where(inArray(content.slug, slugs));

  const found = new Map(rows.map((r) => [r.slug, r]));
  for (const slug of slugs) {
    const row = found.get(slug);
    if (!row) {
      console.log(`MISSING  ${slug}`);
      continue;
    }
    const len = (row.body || "").length;
    const hasHeading = (row.body || "").includes("<h2>");
    console.log(`${len.toString().padStart(6)} chars  h2=${hasHeading ? "y" : "n"}  ${slug}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Write `self-hosted-stack-afternoon` (free guide, ~900 words)**

Replace its `body` in `scripts/seed.ts` with HTML structured as:
- `<h2>Why Self-Host?</h2>` — privacy, no rate limits, cost ceiling once you're past hobby scale, and the learning value of owning the full stack.
- `<h2>What You'll Need</h2>` — a machine with 16GB+ RAM (GPU optional — a quantized small model runs fine on CPU, just slower), Docker installed, ~2-3 hours.
- `<h2>Step 1: Install Ollama and Pull a Model</h2>` — installing Ollama, `ollama pull` for a small instruction-tuned model (name 2-3 realistic current options like Llama 3.1 8B or Qwen2.5 7B as examples of the *class* of model, not a specific pinned claim about which is "best"), quick `ollama run` smoke test.
- `<h2>Step 2: Stand Up Postgres</h2>` — running Postgres via Docker, mention the `pgvector` extension for when they want embeddings/RAG later.
- `<h2>Step 3: Wire It Together With n8n</h2>` — n8n as the self-hosted glue: a webhook node receiving text, an HTTP Request node calling Ollama's local API, a Postgres node storing the result.
- `<h2>A First Workflow</h2>` — concretely: webhook receives a block of text → Ollama summarizes it → summary + original stored in Postgres. Describe the node chain.
- `<h2>Common Gotchas</h2>` as a `<ul>` — port conflicts between services, models too large for available RAM (point at quantized GGUF variants), n8n webhooks being open by default (add basic auth).
- `<h2>Where to Go Next</h2>` — mention that once this outgrows one machine, GPU rental and a proper docker-compose setup are the next steps (soft internal pointer, no link needed).

- [ ] **Step 3: Write `gpu-rental-arbitrage` (premium playbook, ~1500 words)**

Structure:
- `<h2>The Problem</h2>` — buying GPUs for spiky/bursty workloads rarely pencils out; utilization math (a GPU sitting idle 80% of the time is a bad purchase regardless of sticker price).
- `<h2>Decision Framework: Workload Shape First</h2>` — three shapes: steady-state (near-constant load), bursty (spiky, unpredictable), experimental (one-off training runs). The right provider differs by shape, not just by price.
- `<h2>Provider Profiles</h2>` with an `<h3>` (or bolded `<p>`) per provider, qualitative only:
  - RunPod: community + secure cloud tiers, per-second billing, wide marketplace of GPU types, has spot/interruptible pricing for tolerant workloads.
  - Vast.ai: peer-to-peer marketplace of individually-owned machines — typically the cheapest option, but reliability and trust vary by host; best suited to experimentation, not production serving.
  - Lambda: feels more like a managed cloud than a marketplace — reserved and on-demand instances, generally a better fit for sustained training runs where you want predictability over rock-bottom price.
- `<h2>How to Benchmark Before Committing</h2>` — spin up the smallest instance on 2-3 candidates, run your *actual* workload (not a synthetic benchmark), measure wall-clock time and egress cost together, not just $/hr.
- `<h2>A Burst-vs-Reserve Decision Rule</h2>` — qualitative rule of thumb: if your workload is running most of the time, ownership or a reserved instance usually wins once you account for idle-GPU waste; if it's spiky or unpredictable, on-demand rental wins even at a higher nominal $/hr.
- `<h2>Common Traps</h2>` as `<ul>` — egress fees quietly eating the savings, cold-start time counted as billable time, spot/interruptible instances getting reclaimed mid-job (checkpoint your training runs so a reclaim doesn't cost you the whole run).
- `<h2>Checklist Before You Rent</h2>` as `<ul>` — 6 items: confirmed workload shape, benchmarked on your real workload, checked egress pricing, checkpointing in place if using spot/interruptible, compared at least 2 providers, know your walk-away utilization threshold.

- [ ] **Step 4: Write `self-hosted-docker-compose-template` (premium template)**

Structure: short explanation (`<h2>What's Inside</h2>`, `<p>` explaining the three services and when to reach for this vs. the afternoon guide above), then `<h2>The Compose File</h2>` followed by a `<pre><code>` block containing this actual file:

```yaml
version: "3.9"

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  postgres:
    image: pgvector/pgvector:pg16
    container_name: postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  caddy:
    image: caddy:2-alpine
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - ollama

volumes:
  ollama_data:
  postgres_data:
  caddy_data:
  caddy_config:
```

Followed by a short `<h2>Usage Notes</h2>` covering: drop a `.env` next to the file with `POSTGRES_PASSWORD` set, the `deploy.resources` GPU block is a no-op on machines without an NVIDIA GPU/nvidia-container-toolkit (remove it to run CPU-only), and a minimal `Caddyfile` example (`your-domain.com { reverse_proxy ollama:11434 }`) as its own small `<pre><code>` block.

- [ ] **Step 5: Write `agents-vs-workflows` (free guide, ~900 words)**

Structure:
- `<h2>The Distinction</h2>` — workflows are deterministic (you can draw the flowchart); agents plan under uncertainty (the next step depends on what happened in the last one).
- `<h2>A Simple Test</h2>` — if you can draw the full flowchart of every branch ahead of time, it's a workflow, not an agent.
- `<h2>Why "Agent" Gets Reached For Anyway</h2>` — buzzword pull, but also genuine cases get mislabeled in both directions.
- `<h2>When Workflows Win</h2>` — structured business logic: cheaper, faster, far easier to debug because every path is known in advance.
- `<h2>When You Actually Need an Agent</h2>` — open-ended research/investigation tasks, where the number of steps and which tools to call depend on what earlier steps returned.
- `<h2>A Hybrid Pattern: Agents Inside Workflows</h2>` — bound an agent's autonomy to a single node inside a larger, otherwise-deterministic workflow graph, so you get flexibility where it's needed without losing observability everywhere else.
- `<h2>Red Flags You've Over-Engineered</h2>` as `<ul>` — an "agent" used for a fixed 3-step task, no ability to inspect a trace of what it actually did, cost that scales unpredictably with input.

- [ ] **Step 6: Write `agent-loop-starter-kit` (premium code item)**

Structure: short `<h2>What's Inside</h2>` explanation, then `<h2>The Loop</h2>` with a `<pre><code>` block containing this actual Python starter (a real, coherent skeleton — not pseudocode):

```python
"""
Minimal agent loop: bounded retries, short-term memory, and a human-approval
gate before any side-effecting tool call. Extend `TOOLS` and `call_llm` for
your own stack.
"""

import hashlib
import json
from dataclasses import dataclass, field

MAX_STEPS = 12
MAX_RETRIES_PER_STEP = 2
SIDE_EFFECTING_TOOLS = {"send_email", "create_ticket", "charge_card"}


@dataclass
class AgentState:
    goal: str
    history: list[dict] = field(default_factory=list)
    seen_calls: set[str] = field(default_factory=set)

    def add(self, role: str, content: str) -> None:
        self.history.append({"role": role, "content": content})
        # keep the window bounded so context doesn't slowly poison itself
        if len(self.history) > 20:
            self.history = self.history[-20:]


def call_llm(state: AgentState) -> dict:
    """Replace with your actual model call. Must return a dict shaped like:
    {"action": "tool_call" | "final_answer", "tool": str, "args": dict, "content": str}
    """
    raise NotImplementedError


def call_tool(tool: str, args: dict) -> str:
    """Dispatch to your actual tool implementations."""
    raise NotImplementedError


def request_human_approval(tool: str, args: dict) -> bool:
    """Block on human sign-off for side-effecting actions. Replace with a
    real approval channel (Slack prompt, dashboard queue, etc.)."""
    print(f"APPROVAL NEEDED: {tool}({args}) — approve? [y/N]")
    return input().strip().lower() == "y"


def call_signature(tool: str, args: dict) -> str:
    payload = json.dumps({"tool": tool, "args": args}, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


def run_agent(goal: str) -> str:
    state = AgentState(goal=goal)
    state.add("system", f"Goal: {goal}")

    for step in range(MAX_STEPS):
        decision = call_llm(state)

        if decision["action"] == "final_answer":
            return decision["content"]

        tool, args = decision["tool"], decision["args"]
        signature = call_signature(tool, args)

        if signature in state.seen_calls:
            state.add("system", "Repeated identical tool call detected — try a different approach.")
            continue
        state.seen_calls.add(signature)

        if tool in SIDE_EFFECTING_TOOLS and not request_human_approval(tool, args):
            state.add("system", f"Human declined approval for {tool}. Try an alternative.")
            continue

        retries = 0
        while retries <= MAX_RETRIES_PER_STEP:
            try:
                result = call_tool(tool, args)
                state.add("tool", result)
                break
            except Exception as exc:
                retries += 1
                state.add("system", f"{tool} failed ({exc}), retry {retries}/{MAX_RETRIES_PER_STEP}")
        else:
            state.add("system", f"{tool} failed after {MAX_RETRIES_PER_STEP} retries — abandoning this path.")

    return "Stopped: reached MAX_STEPS without a final answer."
```

Followed by `<h2>Extending It</h2>` — implement `call_llm` against your provider, implement `call_tool` per tool, and swap `request_human_approval` for a real approval channel before using this against anything that spends money or contacts a real person.

- [ ] **Step 7: Write `debugging-stuck-agents` (premium playbook, ~1400 words)**

Structure:
- `<h2>Common Failure Modes</h2>` as `<ul>` — repeated identical tool calls, context poisoning (a bad early result keeps getting re-read and re-reasoned about), missing termination conditions, tool schema mismatches causing silent retries.
- `<h2>Instrument the Loop First</h2>` — log every tool call with its arguments and a hash of the result, before trying to fix anything; you can't fix what you can't see.
- `<h2>Fix 1: Hard Step Caps</h2>` — a `MAX_STEPS` ceiling is not optional, it's the backstop for every other failure mode.
- `<h2>Fix 2: Repeat-Call Detection</h2>` — hash tool+args, if the same signature appears twice, force a different path instead of letting it loop.
- `<h2>Fix 3: Context Window Hygiene</h2>` — summarize or drop failed attempts from history instead of letting them accumulate; a context full of past failures biases the model toward repeating them.
- `<h2>Fix 4: Explicit Termination Conditions</h2>` — define what "done" looks like as a checkable condition, not just "the model said it's done."
- `<h2>Fix 5: Cost/Time Circuit Breakers</h2>` — a wall-clock or token-spend ceiling that kills the run independent of step count, for the failure mode where each step is expensive.
- `<h2>A Debugging Checklist</h2>` as `<ul>` — is every call logged, is there a step cap, is there repeat-call detection, is history bounded, is "done" a checkable condition, is there a cost ceiling.

- [ ] **Step 8: Run the seed script**

Run: `npm run db:seed`
Expected: Output lines `✓ <title>` for all 9 tracks and all 31 content items, ending in `Done!` with exit code 0.

- [ ] **Step 9: Verify this batch**

Run: `npx dotenv -e .env.local -- npx tsx scripts/verify-seed.ts self-hosted-stack-afternoon gpu-rental-arbitrage self-hosted-docker-compose-template agents-vs-workflows agent-loop-starter-kit debugging-stuck-agents`
Expected: all 6 lines show `h2=y` and a char count in the thousands (roughly 3000+ for guides/playbooks, 1500+ for the template/code item — not the old ~130-char stub).

- [ ] **Step 10: Commit**

```bash
git add scripts/seed.ts scripts/verify-seed.ts
git commit -m "content: flesh out infrastructure and agents track content"
```

---

## Task 2: Video & Voice content (5 items)

**Files:**
- Modify: `scripts/seed.ts` (5 content entries: `video-model-comparison`, `shot-list-prompt-chain-template`, `ai-video-post-production`, `tts-comparison`, `realtime-voice-agent-starter`)

- [ ] **Step 1: Write `video-model-comparison` (free guide, ~900 words)**

Structure, qualitative only (no invented specific pricing/benchmark numbers):
- `<h2>What Actually Differs Between Them</h2>` — motion/physics realism, character and scene consistency across a sequence, prompt adherence and directability (camera moves, style control), typical generation length limits, access model (API vs. consumer app vs. waitlist).
- `<h2>Sora</h2>`, `<h2>Veo</h2>`, `<h2>Kling</h2>` — one short `<p>` each on where it tends to be strongest and what kind of content it suits best, framed as general tendencies rather than pinned benchmark claims.
- `<h2>Picking by Use Case</h2>` as `<ul>` — quick social content, product ads, narrative/character-driven shorts — which tradeoffs matter most for each.
- `<h2>A Note on This Comparison Aging</h2>` — these models ship new versions often; treat this as a framework for *how* to compare, and re-check current capabilities before a real production decision.

- [ ] **Step 2: Write `shot-list-prompt-chain-template` (premium template)**

Structure: `<h2>What's Inside</h2>` explaining the continuity problem (each generation is stateless, so consistency has to be engineered via the prompt chain, not assumed), then `<h2>Shot List Template</h2>` with an actual HTML `<table>`:

```html
<table>
  <thead>
    <tr><th>Shot #</th><th>Description</th><th>Camera</th><th>Character Ref Tags</th><th>Continuity Notes</th></tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>Wide establishing shot, character enters frame</td><td>Static wide</td><td>[char:jane-v1]</td><td>Baseline outfit/lighting for the sequence</td></tr>
    <tr><td>2</td><td>Medium shot, character speaks</td><td>Slow push-in</td><td>[char:jane-v1]</td><td>Match lighting direction from shot 1</td></tr>
    <tr><td>3</td><td>Close-up reaction</td><td>Static close</td><td>[char:jane-v1]</td><td>Same outfit, carry emotional beat forward</td></tr>
  </tbody>
</table>
```

Then `<h2>The Prompt-Chaining Pattern</h2>` — describe carrying a fixed character/style description block verbatim into every shot's prompt (the `[char:jane-v1]` tag in the table stands in for that reusable block), changing only the shot-specific action/camera language between generations, and always seeding the next shot's reference frame from the last frame of the previous shot when the tool supports image-to-video conditioning.

- [ ] **Step 3: Write `ai-video-post-production` (premium playbook, ~1300 words)**

Structure:
- `<h2>Why Raw Output Needs a Pass</h2>` — generated clips commonly come out short, at lower resolution than final delivery needs, with occasional motion artifacts.
- `<h2>Upscaling</h2>` — the tradeoff between AI upscalers (can hallucinate detail, needs a light touch) vs. traditional upscaling (safer, less "creative" but predictable); when to use which.
- `<h2>Frame Interpolation</h2>` — smoothing motion and boosting perceived framerate, and the specific artifact to watch for (ghosting around fast-moving edges) when overusing it.
- `<h2>Color Grading Pass</h2>` — why disparate generations drift in color/contrast from each other, and applying one consistent grade across the whole sequence rather than trusting each clip individually.
- `<h2>Stitching Shots Together</h2>` — crossfades to hide hard cuts between generations, and matching motion direction across cut points so the eye doesn't catch the seam.
- `<h2>Sound Design Pass</h2>` — generated video is silent by default; ambient bed + sync sound effects do more for perceived production value than another visual polish pass.
- `<h2>A QC Checklist Before Shipping</h2>` as `<ul>` — 5-6 items covering resolution/framerate targets met, color consistency across cuts, no visible interpolation artifacts on fast motion, audio synced, final export format matches the target platform.

- [ ] **Step 4: Write `tts-comparison` (free guide, ~900 words)**

Structure, qualitative only:
- `<h2>What Actually Matters</h2>` — latency (real-time conversational use vs. pre-rendered narration have very different tolerances), voice quality/naturalness, and control over emotion/pacing.
- `<h2>Hosted (ElevenLabs and similar)</h2>` — strong quality and voice-cloning out of the box, usage-based cost, no infrastructure to run, but you're dependent on their API uptime and pricing changes.
- `<h2>Self-Hosted / Open-Source TTS</h2>` — full control and no per-character cost ceiling, but you own the GPU/latency-tuning work and quality is more setup-dependent.
- `<h2>A Decision Framework</h2>` as `<ul>` — real-time voice agent (latency dominates), pre-rendered content narration (quality dominates, latency doesn't matter), high-volume low-margin use case (self-hosted cost math starts to win), consent/ethics of voice cloning (get explicit permission, don't clone a real person's voice without it).

- [ ] **Step 5: Write `realtime-voice-agent-starter` (premium code item)**

Structure: `<h2>What's Inside</h2>` explanation of the STT → LLM → TTS streaming shape and why latency has to be designed in from the start (not bolted on), then `<h2>The Pipeline</h2>` with a `<pre><code>` block containing this Python skeleton:

```python
"""
Streaming voice pipeline skeleton: audio in -> STT -> LLM -> TTS -> audio out.
Each stage streams to the next as soon as it has a usable chunk, instead of
waiting for the previous stage to fully finish, to keep end-to-end latency low.
"""

import asyncio
from collections.abc import AsyncIterator


async def stream_transcript(audio_chunks: AsyncIterator[bytes]) -> AsyncIterator[str]:
    """Feed audio chunks to your STT provider and yield partial/final transcript
    fragments as they become available. Replace with your actual STT client."""
    raise NotImplementedError


async def stream_llm_response(transcript_fragments: AsyncIterator[str]) -> AsyncIterator[str]:
    """Accumulate transcript fragments into complete utterances (e.g. on a pause
    or end-of-turn signal), send to your LLM, and yield response text chunks as
    they stream back. Replace with your actual LLM client."""
    raise NotImplementedError


async def stream_speech(text_chunks: AsyncIterator[str]) -> AsyncIterator[bytes]:
    """Send text chunks to your TTS provider as soon as a sentence boundary is
    reached (don't wait for the full response) and yield audio bytes as they're
    generated. Replace with your actual TTS client."""
    raise NotImplementedError


async def run_pipeline(audio_in: AsyncIterator[bytes]) -> AsyncIterator[bytes]:
    transcript = stream_transcript(audio_in)
    response_text = stream_llm_response(transcript)
    async for audio_chunk in stream_speech(response_text):
        yield audio_chunk


async def main():
    # Wire `audio_in` to your actual mic/telephony audio source (e.g. a
    # websocket receiving raw PCM frames), and pipe `run_pipeline`'s output
    # to your audio playback / telephony sink.
    async def audio_in() -> AsyncIterator[bytes]:
        raise NotImplementedError

    async for out_chunk in run_pipeline(audio_in()):
        await asyncio.sleep(0)  # replace with your actual playback write


if __name__ == "__main__":
    asyncio.run(main())
```

Followed by `<h2>Where Latency Actually Comes From</h2>` — the three biggest sources in order: waiting for a full STT utterance instead of streaming partials, waiting for the full LLM response instead of streaming and starting TTS on the first sentence, and network hops between three separate provider APIs (colocating them or using a single vendor's bundled pipeline cuts this significantly).

- [ ] **Step 6: Run the seed script**

Run: `npm run db:seed`
Expected: same success output as Task 1, `Done!` with exit code 0.

- [ ] **Step 7: Verify this batch**

Run: `npx dotenv -e .env.local -- npx tsx scripts/verify-seed.ts video-model-comparison shot-list-prompt-chain-template ai-video-post-production tts-comparison realtime-voice-agent-starter`
Expected: all 5 lines show `h2=y` with char counts in the thousands.

- [ ] **Step 8: Commit**

```bash
git add scripts/seed.ts
git commit -m "content: flesh out video and voice track content"
```

---

## Task 3: Marketing & Sales content (6 items)

**Files:**
- Modify: `scripts/seed.ts` (6 content entries: `ai-content-engine`, `cold-outreach-playbook`, `content-calendar-template`, `ai-sdr-playbook`, `call-transcript-crm-pipeline`, `objection-handling-playbook`)

- [ ] **Step 1: Write `ai-content-engine` (free guide, ~900 words)**

Structure:
- `<h2>The Core Idea</h2>` — one well-developed idea (an insight, a customer story, a data point) is worth more reformatted ten ways than ten shallow separate ideas.
- `<h2>Step 1: Pick an Idea Worth Repeating</h2>` — criteria: something you actually believe, something specific enough to have an opinion, something that survives being said five different ways.
- `<h2>Step 2: Write the Long Form First</h2>` — a blog post or a script — the long form forces you to actually think it through; everything else is extraction, not creation.
- `<h2>Step 3: Extract, Don't Regenerate</h2>` — pull the sharpest 2-3 sentences for social posts, the structure for an email, the visual beat for a short video, instead of asking an LLM to "make a tweet about X" from scratch each time (this is why quality holds up across formats — they all trace back to the same well-thought-out source).
- `<h2>Step 4: Match Format to Channel Norms</h2>` — a table or `<ul>` mapping: blog (SEO-length, structured headers), LinkedIn/X (short, opinion-forward), email (narrative, one clear CTA), short-form video (hook in the first 2 seconds, script written to be spoken not read).
- `<h2>A Weekly Rhythm</h2>` — one long-form piece → same-week repurposing pass → the following week's idea drawn from what resonated.

- [ ] **Step 2: Write `cold-outreach-playbook` (premium playbook, ~1400 words)**

Structure:
- `<h2>Why AI Outreach Reads as Spam</h2>` — generic personalization tokens ("Hi {{firstName}}, I saw you work at {{company}}") that add no real information, and volume that outpaces actual relevance-checking.
- `<h2>Real Personalization vs. Token-Filling</h2>` — the difference between inserting a name and referencing something specific and true about the recipient that a human would recognize as evidence you actually looked.
- `<h2>A Tiered Personalization System</h2>` — tier 1 (firmographic: industry, company size — cheap, low signal), tier 2 (behavioral: a recent funding round, a job posting, a tech-stack signal — medium effort, medium signal), tier 3 (direct: something from their own content/public statements — highest effort, highest signal, reserve for your best-fit accounts).
- `<h2>Writing at Volume Without Sounding Templated</h2>` — vary sentence structure and length deliberately across a batch (a template with only the name swapped is detectable by rhythm, not just content), keep messages short enough that a real person would plausibly type them.
- `<h2>The Follow-Up Sequence</h2>` — each follow-up should add new information, not just restate the ask; a sequence of pure reminders reads as more spam, not less.
- `<h2>What to Track</h2>` as `<ul>` — reply rate by personalization tier (to know if the expensive tier is earning its cost), positive-reply rate specifically (not just any reply), and time-to-first-reply.

- [ ] **Step 3: Write `content-calendar-template` (premium template)**

Structure: `<h2>What's Inside</h2>` explanation, then `<h2>The Calendar</h2>` with an actual HTML `<table>`:

```html
<table>
  <thead>
    <tr><th>Week</th><th>Core Idea</th><th>Long-Form</th><th>Repurposed: Social</th><th>Repurposed: Email</th><th>Repurposed: Short Video</th><th>Status</th></tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>e.g. a customer result worth explaining</td><td>Blog post draft</td><td>3 posts pulled from the 3 sharpest lines</td><td>Narrative version with one CTA</td><td>15-30s script from the strongest visual beat</td><td>Not started</td></tr>
    <tr><td>2</td><td></td><td></td><td></td><td></td><td></td><td>Not started</td></tr>
  </tbody>
</table>
```

Then `<h2>The Repurposing Checklist</h2>` as `<ul>` baked into every row's workflow — confirm the long-form draft is finished and reviewed before extracting anything from it, pull direct quotes/lines rather than re-summarizing, match each repurposed piece's tone to its channel norms, schedule the long-form and its repurposed pieces across the week rather than same-day (spread reach instead of competing with yourself).

- [ ] **Step 4: Write `ai-sdr-playbook` (free guide, ~900 words)**

Structure:
- `<h2>The Approach</h2>` — score and route leads before a rep is looped in, so reps only spend time on people worth talking to.
- `<h2>What to Score On</h2>` as `<ul>` — explicit fit signals (company size, industry, stated need in the inbound form), behavioral signals (pages visited, content downloaded, time-on-site), and urgency signals (specific timeline mentioned, competitor mentioned).
- `<h2>The Qualification Flow</h2>` — inbound lead arrives → AI extracts/scores against the criteria above → routes into tiers (route to rep now, nurture sequence, disqualify) → only the top tier reaches a human immediately.
- `<h2>Where This Goes Wrong</h2>` as `<ul>` — over-trusting the score without a human spot-check loop, scoring criteria that don't actually correlate with close rate (review against real outcomes periodically), disqualifying too aggressively and losing real pipeline.
- `<h2>A Minimum Viable Version</h2>` — you don't need a custom model to start; a scoring rubric plus an LLM call that extracts the relevant fields from an inbound form/chat transcript is enough to prove the approach before investing further.

- [ ] **Step 5: Write `call-transcript-crm-pipeline` (premium template)**

Structure: `<h2>What's Inside</h2>` explanation, then `<h2>The Pipeline</h2>` as an ordered `<ol>` (call recorded → transcribed → structured fields extracted via LLM → written to CRM fields → flagged for human review if confidence is low), then `<h2>Example Extraction Schema</h2>` with a `<pre><code>` block containing a real JSON schema:

```json
{
  "call_summary": "string, 2-3 sentences",
  "pain_points": ["string"],
  "budget_mentioned": "string or null",
  "timeline_mentioned": "string or null",
  "objections_raised": ["string"],
  "next_step_agreed": "string or null",
  "sentiment": "positive | neutral | negative",
  "confidence": "number 0-1, below 0.6 should route to human review before CRM write"
}
```

Then `<h2>Usage Notes</h2>` — run extraction against the schema above with a structured-output/JSON-mode call so the CRM write is a direct field mapping rather than free-text parsing, and treat the `confidence` field as a real gate, not decoration — low-confidence extractions should queue for a human glance before they land in the CRM, since a wrong field silently written into a CRM is worse than a missing one.

- [ ] **Step 6: Write `objection-handling-playbook` (premium playbook, ~1300 words)**

Structure:
- `<h2>The Approach</h2>` — mine your own closed-won call transcripts for objection-response pairs instead of writing generic scripts from a training course.
- `<h2>Step 1: Pull the Raw Material</h2>` — gather transcripts from your best-performing reps' closed-won calls specifically (not a random sample — you want what actually works).
- `<h2>Step 2: Extract Objection/Response Pairs</h2>` — for each transcript, identify the moment an objection was raised and the exact response that followed it, before the conversation moved on.
- `<h2>Step 3: Cluster by Objection Type</h2>` — price, timing, competitor comparison, internal buy-in, "need to think about it" — group the extracted responses under each so you can see which framing recurs across your best reps.
- `<h2>Step 4: Turn Patterns Into Scripts</h2>` — write the script as the *pattern* behind the successful responses (acknowledge → reframe → specific proof point), not a verbatim transcript quote, so reps can adapt it in the moment instead of reciting it.
- `<h2>Step 5: Keep It a Living Document</h2>` — re-mine every quarter; the objections that matter shift as your product, pricing, and competitive landscape change, and a script frozen from a year ago starts working against you.
- `<h2>Common Mistakes</h2>` as `<ul>` — building scripts from *any* call instead of closed-won calls specifically, writing responses that sound good in a training doc but don't match how your actual top reps talk, treating the script as a rule instead of a starting point reps adapt live.

- [ ] **Step 7: Run the seed script**

Run: `npm run db:seed`
Expected: same success output as previous tasks, `Done!` with exit code 0.

- [ ] **Step 8: Verify this batch**

Run: `npx dotenv -e .env.local -- npx tsx scripts/verify-seed.ts ai-content-engine cold-outreach-playbook content-calendar-template ai-sdr-playbook call-transcript-crm-pipeline objection-handling-playbook`
Expected: all 6 lines show `h2=y` with char counts in the thousands.

- [ ] **Step 9: Commit**

```bash
git add scripts/seed.ts
git commit -m "content: flesh out marketing and sales track content"
```

---

## Task 4: Creative & Privacy content (4 items)

**Files:**
- Modify: `scripts/seed.ts` (4 content entries: `personal-style-library`, `ai-api-data-handling`, `air-gapped-stack-playbook`, `gdpr-ccpa-basics`)

- [ ] **Step 1: Write `personal-style-library` (free guide, ~900 words)**

Structure:
- `<h2>The Problem</h2>` — generating one great image is easy; generating a visually consistent *set* across a project without a system is not, because prompt wording alone drifts between sessions.
- `<h2>What a Style Library Actually Is</h2>` — a curated, organized set of reference images and the prompt language that reliably reproduces their look, kept together so you're not reconstructing your style from memory every time.
- `<h2>Step 1: Collect Reference Images Deliberately</h2>` — pull from your own best past generations, not just external inspiration, since your own successful outputs are proof the style is achievable with your current tools.
- `<h2>Step 2: Extract the Repeatable Language</h2>` — for each reference, write down the specific style/lighting/composition terms that produced it, not just "I liked this one" — the terms are the reusable asset, not the image itself.
- `<h2>Step 3: Organize by Use Case, Not Just Aesthetic</h2>` — group by where you'll actually use it (hero images, social thumbnails, product shots) since the same aesthetic often needs different compositional rules per use case.
- `<h2>Step 4: Version It</h2>` — treat style references like a versioned asset (v1, v2) as your brand evolves, so old projects can be regenerated in their original style even after your current style has moved on.
- `<h2>Keeping It Current</h2>` — revisit and prune quarterly; models update and some reference-reproduction techniques stop working exactly the same way, so a library needs occasional re-validation, not just accumulation.

- [ ] **Step 2: Write `ai-api-data-handling` (free guide, ~900 words)**

Structure — general framework, not pinned claims about any single provider's current policy (those change and this content shouldn't go stale the day a provider updates their terms):
- `<h2>The Reality</h2>` — what happens to a prompt/output depends entirely on the specific provider, plan tier, and API vs. consumer-product surface you're using — there's no single universal answer.
- `<h2>The Questions That Actually Matter</h2>` as `<ul>` — is this input used to train future models by default, is there an opt-out and is it self-serve or does it require a support request, what's the retention window before data is deleted, is there a zero-data-retention or enterprise agreement available, does the answer differ between the API and the consumer chat product from the same company.
- `<h2>Where to Actually Find the Answer</h2>` — the provider's data-processing/DPA page and API-specific terms, not the general marketing privacy page — these frequently say different things, and only the API-specific terms bind API usage.
- `<h2>Practical Defaults If You're Unsure</h2>` as `<ul>` — treat anything sent to a consumer chat UI as potentially used for training unless explicitly stated otherwise, prefer API access with an explicit no-training agreement for anything sensitive, never send data you wouldn't be comfortable seeing in a training set if the policy turns out to be more permissive than you assumed.
- `<h2>This Changes Often</h2>` — re-check policies when a provider changes plans or when you're about to scale usage significantly, not just once at initial adoption.

- [ ] **Step 3: Write `air-gapped-stack-playbook` (premium playbook, ~1400 words)**

Structure:
- `<h2>When Self-Hosted Isn't Private Enough</h2>` — self-hosting still typically has outbound network access (package installs, telemetry, DNS lookups); a true air-gapped requirement means zero external network dependency, which is a stricter and more deliberate build.
- `<h2>What Has to Change From a Normal Self-Hosted Stack</h2>` as `<ul>` — model weights downloaded once and stored locally rather than pulled at runtime, no telemetry/analytics calls from any component, no auto-update mechanisms that phone home, DNS resolution disabled or pointed only at an internal resolver.
- `<h2>Building the Model Layer</h2>` — download and checksum-verify model weights on a connected machine, transfer via physical media or a controlled one-way transfer mechanism, never let the air-gapped machine initiate an outbound model download itself.
- `<h2>Building the Application Layer</h2>` — vendor all dependencies at build time on a connected machine (container images, Python/Node packages), ship the built artifact across the gap rather than building on the air-gapped side.
- `<h2>Auditing for Leaks</h2>` — run the stack with network access physically disconnected and confirm it still functions; anything that silently degrades or errors on disconnect had a hidden dependency you missed.
- `<h2>Operational Discipline</h2>` as `<ul>` — every update goes through the same connected-build → transfer → verify cycle as the initial install, no exceptions "just this once" for a quick patch, maintain a manifest of exactly what's running and its provenance.
- `<h2>Who Actually Needs This</h2>` — this is meaningfully more operational overhead than standard self-hosting; reserve it for genuine regulatory/contractual air-gap requirements, not as a default privacy posture.

- [ ] **Step 4: Write `gdpr-ccpa-basics` (premium guide, ~1100 words)**

Structure, compliance-checklist style, framed as "basics an operator needs to know before shipping," not legal advice:
- `<h2>Not Legal Advice</h2>` — a short, honest framing paragraph: this is an operator's starting checklist, not a substitute for actual legal review before you ship anything that touches real user data at scale.
- `<h2>What Both Laws Are Actually About</h2>` — giving people meaningful control over their own personal data: knowing what's collected, why, and being able to access or delete it.
- `<h2>GDPR Basics for AI Features</h2>` as `<ul>` — a documented lawful basis for processing personal data through an AI feature, data minimization (don't send more personal data to a model than the feature actually needs), the right to erasure applying to data you've stored even if the underlying model itself can't be made to "forget" a specific interaction, and Data Processing Agreements with any third-party model provider that touches EU user data.
- `<h2>CCPA Basics for AI Features</h2>` as `<ul>` — disclosure of what personal data is collected and shared with third parties (including model API providers), an opt-out mechanism for the sale/sharing of personal information, and honoring deletion requests across every system that stores the data, not just your primary database.
- `<h2>The AI-Specific Wrinkle</h2>` — when a third-party model provider is in the data path, your compliance obligations extend to what *they* do with that data too — their DPA terms and retention/training policies become part of your own compliance posture, not a separate concern.
- `<h2>A Practical Pre-Launch Checklist</h2>` as `<ul>` — 6 items: documented what personal data the feature touches, confirmed a lawful basis (GDPR) or disclosure (CCPA), DPA in place with every third-party provider in the data path, deletion requests provably propagate to all storage locations including provider-side logs where possible, minimized what's actually sent to the model, had actual legal review before shipping to production.

- [ ] **Step 5: Run the seed script**

Run: `npm run db:seed`
Expected: same success output as previous tasks, `Done!` with exit code 0.

- [ ] **Step 6: Verify this batch**

Run: `npx dotenv -e .env.local -- npx tsx scripts/verify-seed.ts personal-style-library ai-api-data-handling air-gapped-stack-playbook gdpr-ccpa-basics`
Expected: all 4 lines show `h2=y` with char counts in the thousands.

- [ ] **Step 7: Commit**

```bash
git add scripts/seed.ts
git commit -m "content: flesh out creative and privacy track content"
```

---

## Task 5: Fine-Tuning content (2 items)

**Files:**
- Modify: `scripts/seed.ts` (2 content entries: `finetune-vs-prompt`, `qlora-training-eval-template`)

- [ ] **Step 1: Write `finetune-vs-prompt` (free guide, ~900 words)**

Structure:
- `<h2>The Framework</h2>` — fine-tuning is expensive in both money and iteration speed compared to prompting; most problems people bring to it are actually solved by better prompting or retrieval.
- `<h2>Try This First: Better Prompting</h2>` — more specific instructions, few-shot examples in the prompt itself, and structured output constraints solve a surprising share of "the model isn't doing what I want" complaints.
- `<h2>Try This Second: Retrieval</h2>` — if the problem is the model not knowing something (not the model behaving wrong), retrieval-augmented context usually beats fine-tuning, and it updates instantly when your underlying data changes instead of requiring retraining.
- `<h2>When Fine-Tuning Actually Wins</h2>` as `<ul>` — you need a consistent output *format* or *voice* that's hard to hold reliably via prompting alone at volume, you need lower per-request latency/cost than a large general model with a long prompt, or you're teaching a narrow, well-defined skill that doesn't need broad world knowledge.
- `<h2>The Real Cost of Fine-Tuning</h2>` — it's not just compute — it's building a labeled dataset, the iteration loop being slow (you can't just edit a prompt and re-test in seconds), and needing to re-run the process whenever the base model updates or requirements shift.
- `<h2>A Decision Test</h2>` — before fine-tuning, ask: have you actually maxed out prompting and retrieval first, is the problem really about format/voice/cost rather than knowledge, and do you have (or can you build) a dataset good enough to fine-tune on. If any answer is no, that's the cheaper problem to solve first.

- [ ] **Step 2: Write `qlora-training-eval-template` (premium code item)**

Structure: `<h2>What's Inside</h2>` explanation (a QLoRA training script skeleton paired with an eval harness, because a fine-tune you can't measure before/after isn't provably an improvement), then `<h2>Training Script Skeleton</h2>` with a `<pre><code>` block:

```python
"""
QLoRA fine-tuning skeleton using peft + bitsandbytes + transformers.
Fill in MODEL_NAME, DATASET_PATH, and OUTPUT_DIR for your setup.
"""

from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import load_dataset
import torch

MODEL_NAME = "your-base-model-here"
DATASET_PATH = "path/to/your/dataset.jsonl"
OUTPUT_DIR = "./qlora-output"

bnb_config = dict(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
)
model = prepare_model_for_kbit_training(model)

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)
model = get_peft_model(model, lora_config)

dataset = load_dataset("json", data_files=DATASET_PATH, split="train")


def tokenize(example):
    return tokenizer(example["text"], truncation=True, max_length=1024)


tokenized_dataset = dataset.map(tokenize, remove_columns=dataset.column_names)

training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    num_train_epochs=3,
    learning_rate=2e-4,
    fp16=False,
    bf16=True,
    logging_steps=10,
    save_strategy="epoch",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
)

trainer.train()
model.save_pretrained(OUTPUT_DIR)
```

Then `<h2>Eval Harness Skeleton</h2>` with a second `<pre><code>` block:

```python
"""
Minimal before/after eval harness: run the same prompt set through the base
model and the fine-tuned model, score both, and compare. Replace `score`
with a metric that matches what you're actually optimizing for (exact-match,
a rubric-based LLM judge, etc.) — accuracy alone rarely captures format/voice
improvements, which are often the actual point of a QLoRA fine-tune.
"""

import json


def load_eval_set(path: str) -> list[dict]:
    with open(path) as f:
        return [json.loads(line) for line in f]


def generate(model, tokenizer, prompt: str) -> str:
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    output = model.generate(**inputs, max_new_tokens=256)
    return tokenizer.decode(output[0], skip_special_tokens=True)


def score(prediction: str, reference: str) -> float:
    """Replace with your actual scoring logic."""
    raise NotImplementedError


def run_eval(model, tokenizer, eval_set: list[dict]) -> float:
    scores = [
        score(generate(model, tokenizer, item["prompt"]), item["reference"])
        for item in eval_set
    ]
    return sum(scores) / len(scores)


if __name__ == "__main__":
    eval_set = load_eval_set("eval_set.jsonl")
    # Load base_model/base_tokenizer and finetuned_model/finetuned_tokenizer
    # separately, then compare:
    # base_score = run_eval(base_model, base_tokenizer, eval_set)
    # finetuned_score = run_eval(finetuned_model, finetuned_tokenizer, eval_set)
    # print(f"base: {base_score:.3f}  finetuned: {finetuned_score:.3f}")
    pass
```

Followed by `<h2>Why the Eval Harness Matters More Than the Training Script</h2>` — the training script above is close to boilerplate; the eval harness is where the actual judgment call lives, because "did this fine-tune help" is only answerable if you scored the same eval set both before and after with a metric that reflects what you actually wanted to improve.

- [ ] **Step 3: Run the seed script**

Run: `npm run db:seed`
Expected: same success output as previous tasks, `Done!` with exit code 0.

- [ ] **Step 4: Verify this batch**

Run: `npx dotenv -e .env.local -- npx tsx scripts/verify-seed.ts finetune-vs-prompt qlora-training-eval-template`
Expected: both lines show `h2=y` with char counts in the thousands.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed.ts
git commit -m "content: flesh out fine-tuning track content"
```

---

## Task 6: Full verification

**Files:** None modified — this task only verifies.

- [ ] **Step 1: Type-check and build**

Run: `npm run build`
Expected: build completes successfully with no type errors (the `body` field is `text` in the schema, so any valid string is accepted — this mainly guards against an accidental syntax error introduced while editing `scripts/seed.ts`).

- [ ] **Step 2: Verify all 23 items in one pass**

Run: `npx dotenv -e .env.local -- npx tsx scripts/verify-seed.ts self-hosted-stack-afternoon gpu-rental-arbitrage self-hosted-docker-compose-template agents-vs-workflows agent-loop-starter-kit debugging-stuck-agents video-model-comparison shot-list-prompt-chain-template ai-video-post-production tts-comparison realtime-voice-agent-starter ai-content-engine cold-outreach-playbook content-calendar-template ai-sdr-playbook call-transcript-crm-pipeline objection-handling-playbook personal-style-library ai-api-data-handling air-gapped-stack-playbook gdpr-ccpa-basics finetune-vs-prompt qlora-training-eval-template`
Expected: all 23 lines show `h2=y`, none show `MISSING`, none show a char count under 1000.

- [ ] **Step 3: Spot-check rendering in the browser**

Run: `npm run dev`, then visit one item per content type to confirm the HTML renders correctly inside the `prose prose-invert` container (`app/content/[slug]/page.tsx`):
- `/content/gpu-rental-arbitrage` (playbook) — headings and lists render with correct spacing/styling.
- `/content/self-hosted-docker-compose-template` (template) — the `<pre><code>` YAML block is readable, not broken by the surrounding prose styles.
- `/content/agent-loop-starter-kit` (code) — the Python `<pre><code>` block renders correctly, including indentation.
- `/content/self-hosted-stack-afternoon` (free guide) — confirm it's visible without being signed in / without an active subscription, since this one has `isPremium: false`.

Expected: all four render cleanly with no visibly broken HTML (unescaped tags showing as text, unstyled raw `<pre>` overflowing the container, etc.). If code blocks overflow or don't wrap, note it — that's a pre-existing CSS gap in the `prose` styling, not a content bug, and would be a separate small follow-up (add `overflow-x-auto` to the code block styling in `globals.css` or the article wrapper).

- [ ] **Step 4: Confirm the paywall gate still behaves correctly**

Visit `/content/gpu-rental-arbitrage` (premium) while signed out — expected: the "Member Content" gate renders instead of the body (per `app/content/[slug]/page.tsx:271-286`), unaffected by this batch of content-only changes.

