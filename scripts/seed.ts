import { getDb, tracks, content, type NewTrack, type NewContent } from "@/src/db";
import * as fs from "fs";
import * as path from "path";

const db = getDb();

const n8nWorkflow = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../workflows/production-rag-pipeline.json"), "utf-8")
);

const seedTracks: NewTrack[] = [
  {
    key: "infrastructure",
    title: "Self-Hosted Infrastructure",
    description: "Run your own models, databases, and tools on bare metal or VPS",
    icon: "Server",
    color: "cyan",
    order: 1,
    isActive: true,
  },
  {
    key: "agents",
    title: "Autonomous Agents",
    description: "Build agents that plan, execute, and iterate without hand-holding",
    icon: "Bot",
    color: "violet",
    order: 2,
    isActive: true,
  },
  {
    key: "video",
    title: "Video Generation Models",
    description: "Sora, Veo, Runway, Kling — prompting, workflows, post-production",
    icon: "Video",
    color: "cyan",
    order: 3,
    isActive: true,
  },
  {
    key: "voice",
    title: "Voice & Audio AI",
    description: "Cloning, real-time pipelines, and TTS/STT tradeoffs",
    icon: "Mic",
    color: "violet",
    order: 4,
    isActive: true,
  },
  {
    key: "marketing",
    title: "AI Marketing",
    description: "Content engines, personalization, and outreach at scale",
    icon: "Megaphone",
    color: "cyan",
    order: 5,
    isActive: true,
  },
  {
    key: "sales",
    title: "AI Sales",
    description: "Qualifying leads, summarizing calls, and closing with AI assistance",
    icon: "TrendingUp",
    color: "violet",
    order: 6,
    isActive: true,
  },
  {
    key: "creative",
    title: "Creative & Design",
    description: "Brand-consistent image generation and creative workflows",
    icon: "Palette",
    color: "cyan",
    order: 7,
    isActive: true,
  },
  {
    key: "privacy",
    title: "Privacy & Security",
    description: "Data handling, air-gapped setups, and compliance basics",
    icon: "Shield",
    color: "violet",
    order: 8,
    isActive: true,
  },
  {
    key: "finetuning",
    title: "Model Fine-Tuning",
    description: "LoRA, QLoRA, full fine-tuning — when and how to customize models",
    icon: "Cpu",
    color: "cyan",
    order: 9,
    isActive: true,
  },
];

// Each item's `track` below is a seedTracks `key`, resolved to a real trackId at insert time.
const seedContent: Array<Omit<NewContent, "trackId"> & { track: string }> = [
  // infrastructure
  {
    track: "infrastructure",
    type: "guide",
    title: "Your First Self-Hosted Stack: Ollama + Postgres + n8n in an Afternoon",
    slug: "self-hosted-stack-afternoon",
    description: "A beginner-friendly walkthrough to stand up your own AI stack without a cloud bill.",
    body: `<h2>Why Self-Host?</h2>
<p>Every call to a hosted API leaks a little context to a third party, costs money per token, and is subject to rate limits you don't control. Self-hosting flips all three: your data never leaves your machine, your only cost is electricity and hardware you already own, and there's no ceiling on how hard you can hammer your own inference server. There's also a learning benefit that's easy to undervalue — once you've stood up the full stack yourself, "the AI isn't working" stops being a mystery, because you can see every layer.</p>
<p>None of this means you should self-host everything forever. It means that for a huge class of workloads — internal tools, prototypes, anything privacy-sensitive, anything you're iterating on daily — owning the stack beats renting it. This guide gets you from zero to a working local stack in one afternoon.</p>
<h2>What You'll Need</h2>
<ul>
<li>A machine with at least 16GB of RAM. A GPU helps but isn't required — a quantized small model runs fine on CPU, just slower per response.</li>
<li>Docker installed and working.</li>
<li>About 2-3 hours, most of which is waiting for downloads.</li>
</ul>
<h2>Step 1: Install Ollama and Pull a Model</h2>
<p>Ollama is the easiest on-ramp to running models locally — it handles quantization, memory management, and exposes a simple local API without you having to hand-roll any of it. Install it for your platform, then pull a small instruction-tuned model to start. Something in the 7-8B parameter class is the sweet spot for a first stack — Llama 3.1 8B and Qwen2.5 7B are both reasonable examples of the class of model to reach for; check what's current when you actually do this, since new releases in this size class ship constantly.</p>
<p>Once pulled, run a quick smoke test directly from the command line to confirm the model responds sensibly before you wire anything else to it. If that works, Ollama is already serving an API on its default local port — that's the piece everything else in this stack will talk to.</p>
<h2>Step 2: Stand Up Postgres</h2>
<p>Run Postgres in its own Docker container rather than installing it natively — it's cleaner to reset and easier to back up as a single volume. While you're at it, reach for the <code>pgvector</code> extension even if you don't need embeddings yet. It costs nothing to have installed, and the moment you want retrieval-augmented generation or semantic search over anything you've stored, it's already there.</p>
<h2>Step 3: Wire It Together With n8n</h2>
<p>n8n is the glue that turns "I have a model and a database" into "I have a working system." It's self-hosted, has a visual workflow editor, and speaks HTTP fluently, which is all you need to connect the pieces. Run it as a third container alongside Ollama and Postgres. Inside it, you'll build workflows out of three node types for this stack: a webhook node to receive input, an HTTP Request node to call Ollama's local API, and a Postgres node to write results.</p>
<h2>A First Workflow</h2>
<p>The simplest useful workflow: a webhook receives a block of text, an HTTP Request node sends it to Ollama with a summarization prompt, and a Postgres node stores both the original text and the summary. Concretely, the chain looks like: <strong>Webhook node</strong> (receives POST with a text field) → <strong>HTTP Request node</strong> (POSTs to Ollama's generate endpoint with your prompt template, the incoming text interpolated in) → <strong>Postgres node</strong> (inserts a row with the original text, the summary, and a timestamp). Trigger it with a test POST and confirm a row lands in your table.</p>
<h2>Common Gotchas</h2>
<ul>
<li>Port conflicts between services — Ollama, Postgres, and n8n each want a default port; check nothing else on the machine is already bound to them before you start.</li>
<li>Models too large for available RAM — if a model won't load or crashes on generation, drop down to a smaller parameter count or a more aggressively quantized GGUF variant rather than fighting the machine.</li>
<li>n8n webhooks are open by default — anyone who finds the URL can trigger your workflow. Add basic auth on the webhook node before you expose this beyond your own machine.</li>
</ul>
<h2>Where to Go Next</h2>
<p>Once this setup outgrows a single machine — you need more throughput, more concurrent users, or a model too large to run comfortably on what you have — the next steps are GPU rental for burst capacity and a proper docker-compose setup that codifies all of this instead of running it by hand. Both are covered elsewhere in this track.</p>`,
    durationMinutes: 35,
    difficulty: "beginner",
    tags: ["ollama", "self-hosted", "postgres"],
    isPublished: true,
    isPremium: false,
    publishedAt: new Date(),
  },
  {
    track: "infrastructure",
    type: "workshop",
    title: "Building a Self-Hosted AI Server for Business Workloads",
    slug: "self-hosted-server-workshop",
    description: "Live online workshop — recording included. Sizing hardware, serving models, and keeping the lights on.",
    body: `<h2>Workshop Overview</h2>
<p>This is the recorded version of a live 90-minute workshop on standing up a production-grade self-hosted AI server for real business workloads — not a hobby project. The session covers hardware selection, model serving with vLLM, monitoring, and the operational habits that keep a self-hosted stack reliable when real money depends on it. The recording includes the full build-along, Q&A, and a downloadable runbook you can adapt for your own environment.</p>
<h2>Module 1: Hardware Sizing for Inference Workloads</h2>
<p>We start by classifying your workload shape — steady-state serving, bursty batch, or experimental — because the hardware math is completely different for each. For steady-state serving, you size for peak concurrent requests with headroom; for bursty workloads, you size for job duration and queue depth; for experimental, you rent instead of buy. We walk through a sizing spreadsheet that takes your model size, quantization, target concurrency, and latency SLA, and outputs GPU VRAM requirements, CPU/RAM minimums, and storage estimates. Key rule: always leave 15-20% VRAM headroom for the KV cache at your target context length — hitting OOM under load is the most common production failure mode.</p>
<h2>Module 2: vLLM Deep Dive — From Install to Production Config</h2>
<p>vLLM is the de facto standard for high-throughput LLM serving, but the defaults are tuned for benchmarking, not production. We cover: PagedAttention and how it changes memory planning; continuous batching and why it matters for throughput; the scheduler config flags that actually move the needle (max_num_seqs, max_num_batched_tokens, preemption_mode); distributed inference with tensor parallelism across multiple GPUs; and the OpenAI-compatible API server mode that lets you drop vLLM in as a drop-in replacement for hosted endpoints. We also cover the quantization options — AWQ, GPTQ, and the newer FP8/INT4 kernels — and how to pick one that balances quality loss against VRAM savings for your specific model.</p>
<h2>Module 3: Production Hardening</h2>
<p>A serving stack that works in a notebook fails in production for predictable reasons. We cover: health checks that actually verify model responsiveness, not just process liveness; graceful shutdown and model reloading without dropping in-flight requests; request queuing and timeout policies that prevent cascade failures; logging structured JSON with request IDs for traceability; and Prometheus metrics export with the key dashboards you need (request latency p50/p95/p99, queue depth, GPU utilization, KV cache hit rate). We also walk through a basic Nginx/Caddy reverse proxy config with TLS termination and rate limiting in front of vLLM.</p>
<h2>Module 4: Monitoring and On-Call Readiness</h2>
<p>You're not done when the model serves tokens. We set up: alerting on p99 latency degradation, queue depth spikes, and GPU memory pressure; a runbook for the three most common incidents (OOM, model load failure, throughput collapse); log aggregation that lets you correlate a slow request with what the GPU was doing at that moment; and a simple chaos test — kill the vLLM process and verify your orchestration restarts it with the same model loaded within your RTO. The goal is that when something breaks at 2am, you have a runbook entry that tells you exactly what to check first, not a blank screen and a prayer.</p>
<h2>Module 5: Cost Tracking and Capacity Planning</h2>
<p>Self-hosted doesn't mean free. We build a simple cost model: hardware amortization over 3 years, power at your local rate, colocation or cloud-instance equivalent for comparison, and the ongoing engineering time for updates and incidents. We track tokens-served-per-dollar monthly and set a threshold where renting GPU time becomes cheaper than owning — that's your signal to re-evaluate. The workshop includes a template spreadsheet you can copy and start using immediately.</p>
<h2>What You'll Walk Away With</h2>
<ul>
<li>A complete hardware sizing methodology you can re-run whenever your workload or model changes.</li>
<li>A production vLLM config you can drop into your own server with minimal edits.</li>
<li>A monitoring stack (Prometheus + Grafana dashboards + alert rules) tailored to LLM serving.</li>
<li>An incident runbook template pre-filled for the top three LLM-serving failure modes.</li>
<li>A cost tracking spreadsheet that tells you when to buy vs rent.</li>
</ul>
<h2>Prerequisites</h2>
<p>Familiarity with Linux, Docker, and basic GPU concepts. No prior vLLM experience required. Access to an NVIDIA GPU (cloud or local) for the hands-on portions is recommended but not mandatory — you can follow the config walkthrough and apply it later.</p>`,
    durationMinutes: 90,
    difficulty: "intermediate",
    tags: ["infrastructure", "vllm", "gpu"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "infrastructure",
    type: "playbook",
    title: "GPU Rental Arbitrage: RunPod vs Vast.ai vs Lambda for Bursty Workloads",
    slug: "gpu-rental-arbitrage",
    description: "Cost comparison and a decision framework for renting GPU time instead of buying hardware.",
    body: `<h2>The Problem</h2>
<p>Buying a GPU feels like the "serious" option, but the math rarely works out for spiky or bursty workloads. A GPU sitting idle 80% of the time is a bad purchase no matter how good the sticker price looked, because you're paying its full depreciation and power cost around the clock while only using a fraction of it. Rental flips the cost curve: you pay for compute when you use it, and idle time costs you nothing.</p>
<h2>Decision Framework: Workload Shape First</h2>
<p>Before comparing providers, classify your workload into one of three shapes — this matters more than any per-hour price difference:</p>
<ul>
<li><strong>Steady-state</strong>: near-constant load, e.g. a production inference endpoint serving traffic all day.</li>
<li><strong>Bursty</strong>: spiky and unpredictable, e.g. batch jobs that run a few times a day or on demand.</li>
<li><strong>Experimental</strong>: one-off training runs or exploration, where you spin up, do the work, and tear down.</li>
</ul>
<p>The right provider differs by shape, not just by headline price — a provider that's cheapest for experimentation is often a poor fit for steady-state serving, and vice versa.</p>
<h2>Provider Profiles</h2>
<p><strong>RunPod</strong> — offers both community and secure cloud tiers, bills per second, and has a wide marketplace of GPU types available on demand. Its spot/interruptible pricing tier is a good fit for workloads that can tolerate a job being reclaimed mid-run.</p>
<p><strong>Vast.ai</strong> — a peer-to-peer marketplace of individually-owned machines. Typically the cheapest option on paper, but reliability and trustworthiness vary by host since you're renting from individuals, not a managed fleet. Best suited to experimentation and one-off runs rather than anything production-facing.</p>
<p><strong>Lambda</strong> — feels more like a managed cloud than a marketplace, with reserved and on-demand instances. Generally a better fit for sustained training runs where predictability matters more than squeezing out the rock-bottom price.</p>
<h2>How to Benchmark Before Committing</h2>
<p>Don't trust published specs alone. Spin up the smallest available instance on 2-3 candidate providers and run your <em>actual</em> workload on each — not a synthetic benchmark, which can look completely different from your real usage pattern. Measure wall-clock time to completion and egress cost together, not just the advertised $/hr, since egress and data-transfer fees are where a lot of the "savings" quietly disappear.</p>
<h2>A Burst-vs-Reserve Decision Rule</h2>
<p>As a qualitative rule of thumb: if your workload is running most of the time, ownership or a reserved instance usually wins once you properly account for idle-GPU waste in the "buy" scenario. If your workload is spiky or unpredictable, on-demand rental wins even at a higher nominal $/hr, because you're not paying for the hours you don't use.</p>
<h2>Common Traps</h2>
<ul>
<li>Egress fees quietly eating whatever you saved on compute price — always check data-transfer-out pricing before committing.</li>
<li>Cold-start time counted as billable time on some providers — confirm whether you're paying for the minutes an instance takes to boot and load your model.</li>
<li>Spot/interruptible instances getting reclaimed mid-job — checkpoint your training runs regularly so a reclaim costs you minutes, not the whole run.</li>
</ul>
<h2>Checklist Before You Rent</h2>
<ul>
<li>Confirmed your workload shape (steady-state, bursty, or experimental).</li>
<li>Benchmarked candidates on your real workload, not a synthetic one.</li>
<li>Checked egress/data-transfer pricing, not just compute $/hr.</li>
<li>Checkpointing in place if you're using spot/interruptible instances.</li>
<li>Compared at least two providers head-to-head.</li>
<li>Know your walk-away utilization threshold — the point below which renting stops making sense versus owning.</li>
</ul>`,
    durationMinutes: 25,
    difficulty: "intermediate",
    tags: ["gpu", "cost-optimization"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "infrastructure",
    type: "template",
    title: "Self-Hosted AI Stack Docker Compose Template",
    slug: "self-hosted-docker-compose-template",
    description: "A ready-to-run docker-compose file: local LLM, vector DB, and reverse proxy.",
    body: `<h2>What's Inside</h2>
<p>This is the "graduate" version of the setup from the afternoon self-hosting guide: the same three-service shape (inference, database, reverse proxy), but codified as a single docker-compose file you can bring up with one command, tear down cleanly, and version-control. Reach for this once you're past manually starting containers by hand and want the stack reproducible across machines.</p>
<h2>The Compose File</h2>
<pre><code>version: "3.9"

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
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
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
</code></pre>
<h2>Usage Notes</h2>
<p>Drop a <code>.env</code> file next to <code>docker-compose.yml</code> with <code>POSTGRES_PASSWORD</code> set before running <code>docker compose up -d</code>. The <code>deploy.resources</code> GPU block is a no-op on machines without an NVIDIA GPU and the nvidia-container-toolkit installed — remove that block entirely to run CPU-only. You'll also need a minimal Caddyfile alongside the compose file for TLS termination:</p>
<pre><code>your-domain.com {
    reverse_proxy ollama:11434
}
</code></pre>`,
    durationMinutes: 10,
    difficulty: "intermediate",
    tags: ["docker", "template"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },

  // agents
  {
    track: "agents",
    type: "guide",
    title: "Agents vs Workflows: When You Actually Need Autonomy",
    slug: "agents-vs-workflows",
    description: "Most 'agent' problems are workflow problems in disguise. A framework for telling them apart.",
    body: `<h2>The Distinction</h2>
<p>A workflow is deterministic: every branch is known in advance, and you could draw the full flowchart before running it once. An agent plans under uncertainty: what it does next depends on what happened in the step before, and you can't fully enumerate the paths ahead of time. Most systems that get called "agents" are actually workflows, and most production systems need far less autonomy than their builders initially think.</p>
<h2>A Simple Test</h2>
<p>If you can draw the complete flowchart of every branch ahead of time — including all the error paths — it's a workflow, not an agent. If the number of steps and which tools get called depend on what an earlier step returned in a way you genuinely can't predict beforehand, that's the actual signature of an agent.</p>
<h2>Why "Agent" Gets Reached For Anyway</h2>
<p>Part of it is buzzword pull — "agent" sounds more impressive than "workflow" in a pitch deck. But part of it is genuine mislabeling in both directions: some real agentic problems get built as brittle fixed workflows because that's the more familiar pattern, and some genuinely deterministic problems get wrapped in agent framing because it's currently the more fundable word.</p>
<h2>When Workflows Win</h2>
<p>For structured business logic — a known intake process, a fixed approval chain, a defined data transformation — a workflow is cheaper to run, faster, and far easier to debug, because every path is known in advance and a failure points you directly at the step that broke.</p>
<h2>When You Actually Need an Agent</h2>
<p>Open-ended research or investigation tasks are the clearest case: the number of steps and which tools to call depend entirely on what earlier steps returned, and there's no way to pre-specify the full path. Anything where "figure out what to do next" is itself part of the task is a real candidate for agent autonomy.</p>
<h2>A Hybrid Pattern: Agents Inside Workflows</h2>
<p>The pattern that tends to hold up in production is bounding an agent's autonomy to a single node inside an otherwise deterministic workflow graph. The workflow handles everything with a known shape; the agent is invoked only for the one step that genuinely needs to plan under uncertainty. You get flexibility exactly where it's needed without losing observability everywhere else.</p>
<h2>Red Flags You've Over-Engineered</h2>
<ul>
<li>An "agent" being used for a fixed 3-step task that never actually branches.</li>
<li>No ability to inspect a trace of what the system actually did, step by step.</li>
<li>Cost that scales unpredictably with input, because nothing bounds how many steps or tool calls a run can take.</li>
</ul>`,
    durationMinutes: 20,
    difficulty: "beginner",
    tags: ["agents", "workflows"],
    isPublished: true,
    isPremium: false,
    publishedAt: new Date(),
  },
  {
    track: "agents",
    type: "workshop",
    title: "Building a Multi-Step Research Agent with Tool Use",
    slug: "research-agent-workshop",
    description: "Live online workshop — recording included. Build an agent that searches, reads, and synthesizes.",
    body: `<h2>Workshop Overview</h2>
<p>This is the recorded version of a live 90-minute workshop where we build a research agent from scratch — an agent that takes an open-ended question, searches the web, fetches and reads relevant pages, extracts key claims, cross-references sources, and synthesizes a cited answer. The session covers the full agent loop, tool design, evaluation, and the guardrails that keep a research agent from hallucinating its way into confident wrongness. The recording includes the complete build-along, a working codebase you can clone, and an eval harness to measure quality on your own topics.</p>
<h2>Module 1: The Research Agent Architecture</h2>
<p>We start by drawing the loop on a whiteboard: plan → search → fetch → extract → verify → synthesize → (loop or finish). The critical insight: a research agent isn't one LLM call — it's an orchestration of distinct tools, each with a narrow, verifiable job. We define the tool interfaces upfront so the rest of the build is just wiring: <code>search(query: string) → SearchResult[]</code>, <code>fetch(url: string) → Document</code>, <code>extract(doc: Document, question: string) → Claim[]</code>, <code>verify(claim: Claim, sources: Document[]) → Verification</code>, <code>synthesize(claims: Claim[], question: string) → Answer</code>. Each tool returns structured data, not free text — this is what makes the system debuggable and evaluatable.</p>
<h2>Module 2: Search and Fetch — The Input Pipeline</h2>
<p>We integrate a search API (SerpAPI, Tavily, or your own) and build a fetch layer that handles the real-world mess: paywalls, JavaScript-rendered content, rate limits, robots.txt, and content that's mostly navigation chrome. We implement a readability extractor (Mozilla's Readability or similar) to get clean article text, and a caching layer so re-running the agent on similar topics doesn't re-fetch the same URLs. Key pattern: the fetch tool returns a <code>Document</code> with metadata (url, title, fetched_at, content_hash) so downstream steps can deduplicate and cite precisely.</p>
<h2>Module 3: Extraction and Verification — The Truth Layer</h2>
<p>This is where most research agents fail: they extract claims but don't verify them against the source. We build an extraction prompt that outputs structured claims with inline citations (span indices into the source document), then a separate verification step that checks each claim against its cited spans and flags contradictions or unsupported assertions. We also implement a cross-source consensus check: if three independent sources say X and one says Y, the agent learns to weight accordingly. The verification tool outputs a confidence score per claim, and claims below a threshold get dropped or flagged for human review.</p>
<h2>Module 4: The Agent Loop — Planning, Memory, and Termination</h2>
<p>We wire the tools into a bounded loop with: a step budget (max 12 iterations), a working memory that accumulates verified claims and open sub-questions, a planner that decides the next action based on what's known and what's still missing, and explicit termination conditions — either the planner emits a "sufficient evidence" signal, the step budget expires, or no new claims were found in the last N iterations. We also implement repeat-query detection (hash the search query + params; if seen before, force a different angle) and a cost circuit breaker (max API spend per run).</p>
<h2>Module 5: Evaluation — Measuring What Matters</h2>
<p>A research agent you can't evaluate is a liability. We build an eval harness that runs the agent on a held-out set of research questions with known-good answers, and scores on: citation precision (does every claim in the answer have a supporting source?), citation recall (did the agent find the key sources a human would cite?), factual accuracy (LLM-judge or exact-match against a gold answer), and coherence (does the answer read as a synthesized narrative or a stitched-together list of quotes?). We also measure cost and latency per run. The workshop includes a starter eval set of 20 questions across tech, finance, and science domains.</p>
<h2>Module 6: Guardrails and Failure Modes</h2>
<p>We close with the patterns that keep research agents honest: source diversity requirements (don't cite the same domain for every claim), recency weighting (prefer sources from the last 12 months for fast-moving topics), conflict flagging (surface when sources disagree rather than picking a winner silently), and a human-in-the-loop gate for high-stakes topics (medical, legal, financial) where the agent outputs a draft with flagged uncertainties for expert review. The recording includes a live demo of the agent researching a real-time topic, showing its intermediate steps, and the final cited report.</p>
<h2>What You'll Walk Away With</h2>
<ul>
<li>A complete, runnable research agent codebase (Python, ~400 lines) with pluggable search/fetch backends.</li>
<li>An eval harness and starter question set to measure quality on your own domains.</li>
<li>A tool interface spec you can extend with domain-specific tools (SQL, API, PDF parsers).</li>
<li>A guardrails checklist for deploying research agents in production.</li>
</ul>
<h2>Prerequisites</h2>
<p>Python 3.10+, familiarity with async/await, and an API key for a search provider (SerpAPI, Tavily, or Brave Search). The codebase uses only standard library plus <code>httpx</code>, <code>pydantic</code>, and your LLM provider's SDK.</p>`,
    durationMinutes: 90,
    difficulty: "advanced",
    tags: ["agents", "tool-use"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "agents",
    type: "code",
    title: "Agent Loop Starter Kit: Retries, Memory, and a Human-Approval Gate",
    slug: "agent-loop-starter-kit",
    description: "A production-lean agent loop template with retry logic, short-term memory, and an approval checkpoint.",
    body: `<h2>What's Inside</h2>
<p>A minimal, coherent agent loop you can extend rather than a toy demo: bounded step and retry counts, a rolling memory window so context doesn't slowly poison itself, repeated-call detection, and a human-approval gate that sits in front of anything side-effecting. This is the skeleton to fork, not a framework to install.</p>
<h2>The Loop</h2>
<pre><code>"""
Minimal agent loop: bounded retries, short-term memory, and a human-approval
gate before any side-effecting tool call. Extend \`TOOLS\` and \`call_llm\` for
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
</code></pre>
<h2>Extending It</h2>
<p>Implement <code>call_llm</code> against your actual provider, implement <code>call_tool</code> per tool you want the agent to use, and swap <code>request_human_approval</code> for a real approval channel — a Slack prompt, a dashboard queue — before pointing this at anything that spends money or contacts a real person.</p>`,
    durationMinutes: 15,
    difficulty: "advanced",
    tags: ["agents", "code"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "agents",
    type: "playbook",
    title: "Debugging Agents That Get Stuck in Loops",
    slug: "debugging-stuck-agents",
    description: "Common failure modes for looping agents and how to catch them before they burn your API budget.",
    body: `<h2>Common Failure Modes</h2>
<ul>
<li>Repeated identical tool calls — the agent tries the same thing over and over, expecting a different result.</li>
<li>Context poisoning — a bad early result keeps getting re-read and re-reasoned about, biasing every subsequent decision toward the same mistake.</li>
<li>Missing termination conditions — the loop has no checkable definition of "done," so it either stops arbitrarily or never stops.</li>
<li>Tool schema mismatches — a subtly wrong argument shape causes silent retries instead of a clear failure.</li>
</ul>
<h2>Instrument the Loop First</h2>
<p>Before trying to fix anything, log every tool call with its arguments and a hash of the result. You can't fix what you can't see, and most "the agent is being weird" reports turn out to be one of the four failure modes above once you can actually see the call sequence.</p>
<h2>Fix 1: Hard Step Caps</h2>
<p>A <code>MAX_STEPS</code> ceiling is not optional — it's the backstop for every other failure mode on this list. Whatever else goes wrong, a hard cap guarantees the run terminates instead of burning budget indefinitely.</p>
<h2>Fix 2: Repeat-Call Detection</h2>
<p>Hash the tool name plus its arguments for every call. If the same signature appears twice, force the agent down a different path instead of letting it retry the identical call a third, fourth, or twentieth time.</p>
<h2>Fix 3: Context Window Hygiene</h2>
<p>Summarize or drop failed attempts from history instead of letting them accumulate verbatim. A context window full of past failures biases the model toward repeating them — it's reading its own mistakes as evidence of what to try next.</p>
<h2>Fix 4: Explicit Termination Conditions</h2>
<p>Define what "done" looks like as a checkable condition — a specific field populated, a specific tool call succeeding — not just "the model said it's done." A model claiming success is not the same as success actually being verifiable.</p>
<h2>Fix 5: Cost/Time Circuit Breakers</h2>
<p>Add a wall-clock or token-spend ceiling that kills the run independent of step count. This covers the failure mode a step cap alone misses: a small number of steps that are each individually expensive.</p>
<h2>A Debugging Checklist</h2>
<ul>
<li>Is every tool call logged with its arguments and result?</li>
<li>Is there a hard step cap?</li>
<li>Is there repeat-call detection?</li>
<li>Is conversation history bounded rather than growing unchecked?</li>
<li>Is "done" a checkable condition, not just a model claim?</li>
<li>Is there a cost or wall-clock ceiling independent of step count?</li>
</ul>`,
    durationMinutes: 20,
    difficulty: "intermediate",
    tags: ["agents", "debugging"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },

  // video
  {
    track: "video",
    type: "guide",
    title: "Sora vs Veo vs Kling: A Practical Comparison for Business Content",
    slug: "video-model-comparison",
    description: "Which video model to reach for depending on the content you're producing.",
    body: `<h2>What Actually Differs Between Them</h2>
<p>The headline differences between video generation models come down to a handful of practical axes: motion and physics realism (does a thrown object arc correctly, does cloth move plausibly), character and scene consistency across a sequence of shots, prompt adherence and directability (can you control camera moves and visual style, or just describe a scene and hope), typical generation length limits, and access model — some ship as a clean API, some as a consumer app, some are still waitlist-gated. Which of these matters most to you depends entirely on what you're producing.</p>
<h2>Sora</h2>
<p>Tends to be strongest on scene coherence and handling complex prompts with multiple elements interacting in one shot — a good fit when the content itself has some narrative or scene complexity to it.</p>
<h2>Veo</h2>
<p>Tends to be strongest on cinematic camera control and integrating well with a broader content pipeline — a good fit when directability (specific camera moves, specific visual style) matters more than raw scene complexity.</p>
<h2>Kling</h2>
<p>Tends to be a strong option for character-focused sequences and has been a popular choice for more accessible, faster-turnaround content generation — a good fit for quicker social-first output.</p>
<h2>Picking by Use Case</h2>
<ul>
<li><strong>Quick social content</strong>: prioritize speed and ease of iteration over frame-perfect physics — you'll generate many variations and pick the best.</li>
<li><strong>Product ads</strong>: prioritize prompt adherence and consistency, since brand accuracy matters more than experimental flair.</li>
<li><strong>Narrative or character-driven shorts</strong>: prioritize character/scene consistency across shots above everything else, since a viewer's eye catches continuity breaks immediately.</li>
</ul>
<h2>A Note on This Comparison Aging</h2>
<p>These models ship new versions often, and capabilities that are a clear differentiator today can be matched or exceeded within months. Treat this page as a framework for <em>how</em> to compare video models — the axes that actually matter for your use case — rather than a fixed ranking, and re-check current capabilities before making a real production decision.</p>`,
    durationMinutes: 20,
    difficulty: "beginner",
    tags: ["video", "comparison"],
    isPublished: true,
    isPremium: false,
    publishedAt: new Date(),
  },
  {
    track: "video",
    type: "workshop",
    title: "Prompt-to-Ad: Producing a 30-Second Product Spot End-to-End",
    slug: "prompt-to-ad-workshop",
    description: "Live online workshop — recording included. From prompt to a finished ad, start to finish.",
    body: `<h2>Workshop Overview</h2>
<p>This is the recorded version of a live 100-minute workshop where we produce a complete 30-second product advertisement from a single sentence brief — concept, script, storyboards, generated video clips, voiceover, music, edit, and final export. The session covers the full creative pipeline using current AI video tools (Sora, Veo, Kling, Runway), the prompting strategies that actually yield usable footage, and the post-production workflow that turns raw generations into a polished spot. The recording includes every generation attempt (including the failures), the project files, and a reusable prompt template pack.</p>
<h2>Module 1: From Brief to Shot List — Planning for Generation</h2>
<p>AI video is expensive in credits and time, and most of what you generate won't make the cut. We start by translating a one-sentence product brief into a shot list that's engineered for AI generation: every shot specifies camera type, movement, duration, subject, action, lighting, and the exact prompt language we'll feed the model. We use a "prompt-first" storyboard template where each row is a generation job, not a visual sketch — this forces you to confront the model's limitations before you spend credits. Key principle: design for what the model does well (static or slow movement, clear subjects, strong lighting direction) and avoid what it doesn't (complex multi-character interaction, precise lip sync, consistent text rendering).</p>
<h2>Module 2: Model Selection and Prompt Engineering per Shot</h2>
<p>Not every shot needs the same model. We map shot types to the model that handles them best: establishing shots and environments → Veo (cinematic control); product hero shots → Kling (texture fidelity); character-driven moments → Sora (scene coherence); fast-cut social b-roll → Runway Gen-3 (speed/iteration). For each shot in our list, we write the prompt using a structured template: <code>[subject] + [action] + [camera] + [lighting] + [style tokens] + [negative constraints]</code>. We cover the style tokens that actually work across models (e.g., "commercial lighting, 8K, shallow depth of field, Arri Alexa look") vs. the ones that are placebo. We also show how to use image-to-video conditioning with a reference frame to lock visual consistency across shots — the single biggest lever for character/scene continuity.</p>
<h2>Module 3: Generation Sprint — Live Generation with Commentary</h2>
<p>We generate every shot in the list live, showing the full prompt, the raw output, and the immediate assessment: keep, re-roll, or adjust prompt. This is where the workshop pays for itself — you see the failure modes in real time (morphing hands, physics violations, temporal flicker, aspect ratio drift) and the specific prompt edits that fix them. We generate 3-4 variations per shot and select the best, building a "selects" folder as we go. Total generation time: ~45 minutes for ~18 shots, with commentary on every decision.</p>
<h2>Module 4: Post-Production Pipeline</h2>
<p>Raw generations are not a finished ad. We run the selects through: upscaling (Topaz Video AI or ROI-aware upscaling for hero shots), frame interpolation (RIFE or FILM) to hit 30fps smooth motion, color grading (DaVinci Resolve — one grade across all clips for cohesion), sound design (Artlist/Epidemic Sound for music, ElevenLabs for VO, Foley for product interaction sounds), and the edit (Premiere/CapCut/DaVinci) — pacing to the music bed, matching motion direction across cuts, adding supers and end card. We show the timeline at each stage so you see exactly what changes.</p>
<h2>Module 5: QC and Delivery Specs</h2>
<p>Before export, we run a QC checklist: resolution and framerate match delivery spec (1080p/30fps for most social, 4K/60fps for broadcast), color space is Rec.709, audio is -14 LUFS integrated with true peak under -1dB, no interpolation artifacts on hero shots, supers are title-safe, end card has correct CTA and legal lines. We export ProRes 422 HQ for archive and H.264/HEVC for platform delivery. The workshop includes a QC checklist PDF and delivery spec cheat sheet for Meta, TikTok, YouTube, and connected TV.</p>
<h2>What You'll Walk Away With</h2>
<ul>
<li>A prompt-first storyboard template (Notion/Google Sheets) you can duplicate for any product.</li>
<li>A model-to-shot-type decision matrix for current-gen video models.</li>
<li>A prompt template pack with style tokens that work across Sora, Veo, Kling, Runway.</li>
<li>A post-production checklist and DaVinci Resolve project template with the grading node tree.</li>
<li>A QC checklist and delivery spec sheet for every major platform.</li>
</ul>
<h2>Prerequisites</h2>
<p>Access to at least two of: Sora, Veo, Kling, Runway Gen-3 (free tiers or credits work). DaVinci Resolve (free) installed for the grading/edit sections. Basic familiarity with video editing concepts (timeline, cuts, keyframes). No prior AI video experience required.</p>`,
    durationMinutes: 100,
    difficulty: "intermediate",
    tags: ["video", "advertising"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "video",
    type: "template",
    title: "Shot-List and Prompt-Chain Template for Character Continuity",
    slug: "shot-list-prompt-chain-template",
    description: "Keep characters and scenes consistent across a multi-shot AI video sequence.",
    body: `<h2>What's Inside</h2>
<p>Every AI video generation is stateless — the model has no memory of the shot before it. Consistency across a sequence has to be engineered deliberately via the prompt, not assumed to happen automatically. This template gives you a shot list structure and a prompt-chaining pattern to carry character and style information forward across every shot in a sequence.</p>
<h2>Shot List Template</h2>
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
<h2>The Prompt-Chaining Pattern</h2>
<p>Carry a fixed character and style description block verbatim into every shot's prompt — the <code>[char:jane-v1]</code> tag in the table above stands in for that reusable block, which should describe appearance, outfit, and general visual style in consistent language every time. Change only the shot-specific action and camera language between generations; the character/style block itself never changes mid-sequence. When your tool supports image-to-video conditioning, always seed the next shot's reference frame from the last frame of the previous shot rather than generating from text alone — this is what actually anchors visual continuity across cuts, more than prompt wording alone ever can.</p>`,
    durationMinutes: 10,
    difficulty: "intermediate",
    tags: ["video", "template"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "video",
    type: "playbook",
    title: "Post-Production Fixes for AI Video: Upscaling, Frame Interpolation, Color",
    slug: "ai-video-post-production",
    description: "Cleaning up the rough edges AI video generators leave behind.",
    body: `<h2>Why Raw Output Needs a Pass</h2>
<p>Generated clips almost never come out ready to publish as-is. They commonly arrive short (many generators cap single-shot length well below what a finished sequence needs), at lower resolution than final delivery requires, and with occasional motion artifacts that a quick glance can miss but a full-screen playback won't. Budgeting a post-production pass isn't optional polish — it's part of the actual production process.</p>
<h2>Upscaling</h2>
<p>AI upscalers can hallucinate detail that wasn't in the source, which looks impressive in a still frame and can look wrong in motion — use them with a light touch and always review the upscaled result at actual playback speed. Traditional (non-AI) upscaling is safer and more predictable, if less "creative," and is often the better default when the output needs to look clean rather than enhanced.</p>
<h2>Frame Interpolation</h2>
<p>Interpolation smooths motion and boosts perceived framerate, which helps output that reads as slightly choppy at its native generation framerate. Watch specifically for ghosting around fast-moving edges — the most common artifact from overusing interpolation — and back off the interpolation strength if you see it rather than pushing through.</p>
<h2>Color Grading Pass</h2>
<p>Clips generated in separate calls — even from the same model and prompt family — commonly drift in color and contrast from each other. Apply one consistent grade across the entire finished sequence rather than trusting each clip's native color individually; this single pass does more for perceived cohesion than almost anything else in the post-production process.</p>
<h2>Stitching Shots Together</h2>
<p>Use crossfades to hide hard cuts between separately generated clips, and pay attention to matching motion direction across cut points — if motion in frame is moving left-to-right going into a cut and right-to-left coming out, the eye catches the seam immediately even if the color and lighting match perfectly.</p>
<h2>Sound Design Pass</h2>
<p>Generated video is silent by default, and this is where a lot of unpolished-feeling output actually falls short — not the visuals. An ambient bed plus synced sound effects does more for perceived production value than another round of visual polish, and it's often the fastest remaining lever once the visual passes above are done.</p>
<h2>A QC Checklist Before Shipping</h2>
<ul>
<li>Resolution and framerate match the target platform's requirements.</li>
<li>Color is consistent across every cut in the sequence.</li>
<li>No visible interpolation artifacts on fast-motion segments.</li>
<li>Audio is synced to visual action, not just present.</li>
<li>Final export format and codec match what the target platform expects.</li>
</ul>`,
    durationMinutes: 30,
    difficulty: "intermediate",
    tags: ["video", "post-production"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },

  // voice
  {
    track: "voice",
    type: "guide",
    title: "ElevenLabs vs Open-Source TTS: Latency, Cost, Quality Tradeoffs",
    slug: "tts-comparison",
    description: "Picking a text-to-speech provider based on what actually matters for your use case.",
    body: `<h2>What Actually Matters</h2>
<p>Three axes decide this choice: latency (real-time conversational use has a completely different tolerance than pre-rendered narration), voice quality and naturalness, and how much control you get over emotion and pacing. Get clear on which of these dominates your use case before comparing providers, because the "best" option flips depending on the answer.</p>
<h2>Hosted (ElevenLabs and similar)</h2>
<p>Strong quality and voice-cloning capability out of the box, with no infrastructure to run or maintain. Cost is usage-based, which scales cleanly at low volume but adds up at high volume. You're also dependent on the provider's API uptime and subject to their pricing changes — check current pricing before committing to a volume assumption.</p>
<h2>Self-Hosted / Open-Source TTS</h2>
<p>Full control and no per-character cost ceiling once you own the infrastructure, but you take on the GPU provisioning and latency-tuning work yourself, and output quality is more setup-dependent than with a polished hosted product. This is a real tradeoff, not a strictly better option — it moves cost from usage-based to infrastructure-and-engineering-time-based.</p>
<h2>A Decision Framework</h2>
<ul>
<li><strong>Real-time voice agent</strong>: latency dominates every other consideration — pick whichever option, hosted or self-hosted, gets you the lowest end-to-end latency for your specific pipeline.</li>
<li><strong>Pre-rendered content narration</strong>: quality dominates and latency doesn't matter at all — optimize purely for how natural the output sounds.</li>
<li><strong>High-volume, low-margin use case</strong>: this is where the self-hosted cost math starts to win, since usage-based hosted pricing scales linearly with volume and self-hosted infrastructure cost doesn't.</li>
<li><strong>Consent and ethics of voice cloning</strong>: get explicit permission before cloning anyone's voice — never clone a real person's voice without their consent, regardless of which provider or tooling makes it technically easy.</li>
</ul>`,
    durationMinutes: 20,
    difficulty: "beginner",
    tags: ["voice", "tts"],
    isPublished: true,
    isPremium: false,
    publishedAt: new Date(),
  },
  {
    track: "voice",
    type: "workshop",
    title: "Cloning and Deploying a Custom Voice for IVR/Support",
    slug: "voice-cloning-workshop",
    description: "Live online workshop — recording included. Clone a voice and wire it into a support flow.",
    body: `<h2>Workshop Overview</h2>
<p>This is the recorded version of a live 75-minute workshop where we clone a voice from ~30 minutes of reference audio, validate quality, and deploy it into a working IVR/support flow — from text-to-speech generation through telephony integration. The session covers the full pipeline: data prep, model selection (ElevenLabs, OpenVoice, XTTS-v2, or a self-hosted RVC), quality gates, latency optimization, and the telephony wiring (Twilio, SignalWire, or SIP). The recording includes the live clone process, A/B comparison of models, the IVR flow build, and a deploy checklist for production.</p>
<h2>Module 1: Reference Data — What Actually Matters</h2>
<p>Voice cloning quality is 80% reference data, 20% model. We cover: minimum viable reference length (30 minutes clean > 2 hours noisy), content diversity (the reference must cover the phonemes, prosody, and emotional range you'll actually synthesize — reading a phone book gets you a phone-book voice), recording conditions (dynamic mic, treated room, consistent gain, no background noise), and the legal/ethical gate — you need explicit written consent from the voice talent, and a license that covers your use case (commercial IVR is a distinct right from "personal use"). We provide a reference-data checklist and a consent form template.</p>
<h2>Module 2: Model Comparison — Hosted vs Self-Hosted</h2>
<p>We clone the same reference with four approaches and compare: <strong>ElevenLabs Professional Voice Cloning</strong> (hosted, highest quality, usage-based pricing, ~2hr training, API latency ~300ms); <strong>OpenVoice v2</strong> (open weights, zero-shot capable, can run on CPU, quality close to ElevenLabs for clean speech); <strong>XTTS-v2 (Coqui)</strong> (multilingual, self-hosted, GPU required for real-time, good quality but higher latency); <strong>RVC (Retrieval-based Voice Conversion)</strong> (self-hosted, requires GPU, converts any speech to target voice — different paradigm, not pure TTS). We evaluate on: MOS (mean opinion score) via blind listening test, latency (first-byte and end-to-end), cost per 1k chars, and deployment complexity. The workshop includes a comparison spreadsheet with our scores and audio samples.</p>
<h2>Module 3: Quality Gates and Validation</h2>
<p>Before deploying, you need automated gates. We build: a pronunciation test set (your product names, acronyms, proper nouns) with expected phoneme sequences; a prosody test (questions, statements, urgency, empathy) rated by LLM-judge; a consistency check (generate the same prompt 10x, measure variance in pitch/timing/articulation); and a latency benchmark under load (concurrent requests). Any clone that fails the pronunciation set or exceeds your latency SLA doesn't ship — this is non-negotiable for customer-facing IVR.</p>
<h2>Module 4: IVR Integration — From Text to Call Flow</h2>
<p>We wire the chosen TTS into a Twilio Studio flow: incoming call → gather (speech/DTMF) → intent classification → dynamic TTS response → transfer or resolve. Key patterns: pre-generate static prompts (welcome, menu, hold music) and cache them — don't synthesize "press 1 for sales" on every call; use streaming TTS for dynamic content (account balances, ticket status) so the caller hears the first word while the rest generates; implement a fallback to a high-quality pre-recorded voice if the clone service is degraded; and log every synthesis with the prompt, model version, latency, and cache-hit for observability.</p>
<h2>Module 5: Production Hardening</h2>
<p>We cover: A/B testing the clone vs. the original voice on CSAT and containment rate; monitoring for drift (re-run the pronunciation test weekly, alert on regression); versioning clones (v1, v2...) with instant rollback; capacity planning for peak call volume (concurrent streams × latency = required GPU/API quota); and the compliance checklist — call recording notice, opt-out path, data retention policy for synthesized audio logs.</p>
<h2>What You'll Walk Away With</h2>
<ul>
<li>A reference-data prep checklist and consent form template.</li>
<li>A model comparison framework with a scoring rubric you can re-run when new models drop.</li>
<li>Automated quality gate scripts (pronunciation, prosody, consistency, latency).</li>
<li>A Twilio Studio flow template with cached static prompts + streaming dynamic TTS.</li>
<li>A production monitoring dashboard (Grafana) and drift detection alert rules.</li>
</ul>
<h2>Prerequisites</h2>
<p>Twilio account (trial works), ~30 minutes of clean reference audio with consent, and access to at least one cloning provider (ElevenLabs paid tier or GPU for self-hosted). Python 3.10+ for the quality gate scripts. Basic familiarity with IVR concepts.</p>`,
    durationMinutes: 75,
    difficulty: "intermediate",
    tags: ["voice", "ivr"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "voice",
    type: "code",
    title: "Real-Time Voice Agent Starter: STT → LLM → TTS Pipeline",
    slug: "realtime-voice-agent-starter",
    description: "A starter pipeline for building a low-latency voice agent.",
    body: `<h2>What's Inside</h2>
<p>A streaming pipeline skeleton wiring speech-to-text, an LLM, and text-to-speech together in the shape that actually keeps latency low: audio in → STT → LLM → TTS → audio out, with each stage streaming to the next as soon as it has a usable chunk rather than waiting for the previous stage to fully finish. Latency has to be designed into the architecture from the start — it can't be bolted on afterward once every stage is built to wait for full completion.</p>
<h2>The Pipeline</h2>
<pre><code>"""
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
    # Wire \`audio_in\` to your actual mic/telephony audio source (e.g. a
    # websocket receiving raw PCM frames), and pipe \`run_pipeline\`'s output
    # to your audio playback / telephony sink.
    async def audio_in() -> AsyncIterator[bytes]:
        raise NotImplementedError

    async for out_chunk in run_pipeline(audio_in()):
        await asyncio.sleep(0)  # replace with your actual playback write


if __name__ == "__main__":
    asyncio.run(main())
</code></pre>
<h2>Where Latency Actually Comes From</h2>
<p>Three sources dominate, in order: waiting for a full STT utterance instead of streaming partial transcripts as they arrive; waiting for the full LLM response instead of streaming it and starting TTS as soon as the first sentence is complete; and network hops between three separate provider APIs, since each round trip adds real latency — colocating the services or using a single vendor's bundled pipeline cuts this significantly.</p>`,
    durationMinutes: 15,
    difficulty: "advanced",
    tags: ["voice", "code"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },

  // marketing
  {
    track: "marketing",
    type: "guide",
    title: "Building an AI Content Engine: One Idea → 10 Formats",
    slug: "ai-content-engine",
    description: "Turn a single idea into a week of content across every channel you run.",
    body: `<h2>The Core Idea</h2>
<p>One well-developed idea — a genuine insight, a customer story, a real data point — is worth more reformatted ten different ways than ten shallow separate ideas each covered once. Most content operations are bottlenecked on depth, not volume, and an AI content engine works best when it multiplies depth rather than substituting for it.</p>
<h2>Step 1: Pick an Idea Worth Repeating</h2>
<p>Good source material meets three criteria: it's something you actually believe (not just something that sounds good), it's specific enough that you have a real opinion about it, and it survives being said five different ways without becoming generic in the process.</p>
<h2>Step 2: Write the Long Form First</h2>
<p>Write the blog post or script before anything else. The long form forces you to actually think the idea through end to end — everything that follows is extraction from that thinking, not separate creation. Skipping straight to short-form content usually means skipping the thinking too.</p>
<h2>Step 3: Extract, Don't Regenerate</h2>
<p>Pull the sharpest two or three sentences from the long form for social posts, pull its structure for an email, pull its strongest visual beat for a short video — instead of asking an LLM to "make a tweet about X" from scratch each time. This is why quality holds up across formats: every piece traces back to the same well-thought-out source instead of being separately, shallowly generated.</p>
<h2>Step 4: Match Format to Channel Norms</h2>
<ul>
<li><strong>Blog</strong>: SEO-appropriate length, structured headers, room for the full argument.</li>
<li><strong>LinkedIn/X</strong>: short, opinion-forward, no room for hedging.</li>
<li><strong>Email</strong>: narrative structure, one clear call to action — not three.</li>
<li><strong>Short-form video</strong>: hook in the first two seconds, script written to be spoken, not read aloud from a page.</li>
</ul>
<h2>A Weekly Rhythm</h2>
<p>One long-form piece, followed by a same-week repurposing pass across the formats above, followed by the next week's idea drawn from whatever resonated most in the current batch. This keeps the engine running on real signal instead of a content calendar filled in blind.</p>`,
    durationMinutes: 25,
    difficulty: "beginner",
    tags: ["marketing", "content"],
    isPublished: true,
    isPremium: false,
    publishedAt: new Date(),
  },
  {
    track: "marketing",
    type: "playbook",
    title: "Cold Outreach at Scale Without Sounding Like a Bot",
    slug: "cold-outreach-playbook",
    description: "Personalization patterns that hold up at volume.",
    body: `<h2>Why AI Outreach Reads as Spam</h2>
<p>Generic personalization tokens — "Hi {{firstName}}, I saw you work at {{company}}" — add no real information; anyone can see that a template just inserted two known fields. Combine that with volume that outpaces any actual relevance-checking, and the result reads as exactly what it is: a mail merge, not outreach.</p>
<h2>Real Personalization vs. Token-Filling</h2>
<p>The difference between real personalization and token-filling isn't sophistication of tooling — it's whether the message references something specific and true about the recipient that a human would recognize as evidence you actually looked at their situation, versus something that could be true of literally anyone at their company.</p>
<h2>A Tiered Personalization System</h2>
<ul>
<li><strong>Tier 1 — firmographic</strong>: industry, company size. Cheap to gather, low signal, fine as a baseline filter but not a personalization hook on its own.</li>
<li><strong>Tier 2 — behavioral</strong>: a recent funding round, a job posting, a tech-stack signal. Medium effort to gather, medium signal — enough to reference credibly without being invasive.</li>
<li><strong>Tier 3 — direct</strong>: something pulled from the recipient's own content or public statements. Highest effort, highest signal — reserve this tier for your best-fit accounts rather than trying to apply it at full volume.</li>
</ul>
<h2>Writing at Volume Without Sounding Templated</h2>
<p>Vary sentence structure and length deliberately across a batch — a template with only the name swapped is detectable by rhythm and cadence, not just by content, and recipients pick up on that pattern even when the specific facts are accurate. Keep messages short enough that a real person would plausibly have typed them in a couple of minutes.</p>
<h2>The Follow-Up Sequence</h2>
<p>Each follow-up should add genuinely new information — a different angle, a new piece of context — rather than just restating the original ask. A sequence of pure reminders reads as more spam with every send, not less, even if each individual message is well-written.</p>
<h2>What to Track</h2>
<ul>
<li>Reply rate broken out by personalization tier, so you know whether the expensive tier-3 effort is actually earning its cost.</li>
<li>Positive-reply rate specifically, not just any reply — a reply asking to be removed from the list is not a win.</li>
<li>Time-to-first-reply, since a fast reply is often a stronger buying signal than the reply content alone.</li>
</ul>`,
    durationMinutes: 20,
    difficulty: "intermediate",
    tags: ["marketing", "outreach"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "marketing",
    type: "template",
    title: "AI-Assisted Content Calendar and Repurposing Workflow",
    slug: "content-calendar-template",
    description: "A ready-to-copy content calendar with built-in repurposing steps.",
    body: `<h2>What's Inside</h2>
<p>A content calendar structured around the one-idea-to-many-formats system, so repurposing is built into the planning grid itself rather than an afterthought once the long-form piece is already published.</p>
<h2>The Calendar</h2>
<table>
<thead>
<tr><th>Week</th><th>Core Idea</th><th>Long-Form</th><th>Repurposed: Social</th><th>Repurposed: Email</th><th>Repurposed: Short Video</th><th>Status</th></tr>
</thead>
<tbody>
<tr><td>1</td><td>e.g. a customer result worth explaining</td><td>Blog post draft</td><td>3 posts pulled from the 3 sharpest lines</td><td>Narrative version with one CTA</td><td>15-30s script from the strongest visual beat</td><td>Not started</td></tr>
<tr><td>2</td><td></td><td></td><td></td><td></td><td></td><td>Not started</td></tr>
</tbody>
</table>
<h2>The Repurposing Checklist</h2>
<ul>
<li>Confirm the long-form draft is finished and reviewed before extracting anything from it — extracting from an unfinished draft means repurposing thinking that might still change.</li>
<li>Pull direct quotes or lines rather than re-summarizing — summarizing introduces a second, weaker pass on the same idea instead of reusing the sharpest version of it.</li>
<li>Match each repurposed piece's tone to its channel norms rather than reusing the long-form's tone unchanged everywhere.</li>
<li>Schedule the long-form piece and its repurposed pieces across the week rather than all on the same day — spread reach across days instead of having the pieces compete with each other for the same audience's attention.</li>
</ul>`,
    durationMinutes: 10,
    difficulty: "beginner",
    tags: ["marketing", "template"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "marketing",
    type: "workshop",
    title: "Personalized Landing Pages Generated Per-Visitor",
    slug: "personalized-landing-pages-workshop",
    description: "Live online workshop — recording included. Generate landing page variants per visitor segment.",
    body: `<h2>Workshop Overview</h2>
<p>This is the recorded version of a live 80-minute workshop where we build a system that generates personalized landing page copy, layout, and creative per visitor segment — in real time, at the edge, without a team of copywriters. The session covers: segment definition and data sources, prompt templates that produce on-brand copy for each segment, a rendering pipeline that assembles components into a complete page, edge caching strategy so personalization doesn't kill Core Web Vitals, and an A/B testing framework to prove lift. The recording includes the full build, a working Next.js + Vercel Edge Functions demo, and a component library you can adapt.</p>
<h2>Module 1: Segmentation Strategy — What to Personalize On</h2>
<p>Personalization without a hypothesis is just expensive A/B testing. We start by defining segments that actually differ in what they need to hear: <strong>firmographic</strong> (industry, company size, tech stack) — changes the value prop and proof points; <strong>behavioral</strong> (pages viewed, content downloaded, return visitor) — changes the funnel stage messaging; <strong>source</strong> (paid search keyword, referral, email campaign) — matches the page to the promise that brought them; <strong>account-based</strong> (target account list) — shows their logo, references their specific use case. We map each segment to the specific page elements that should vary: headline, subhead, hero image, social proof, CTA, feature highlight order. The key constraint: limit to 3-5 segments max, or the combinatorial explosion makes QA impossible and the signal-to-noise ratio collapses.</p>
<h2>Module 2: Prompt Templates — Copy That Converts</h2>
<p>We build a prompt template system, not a bag of prompts. Each segment gets a structured template: <code>{value_prop}[segment] + {proof_point}[segment] + {objection_handling}[segment] + {cta}[segment]</code>, where each bracket is a slot filled from a curated library of approved phrases. This keeps brand voice consistent while allowing segment-specific persuasion. We cover: writing modular copy blocks that compose cleanly (no "and/or" soup), the approval workflow (marketing owns the library, engineering owns the template), and versioning (every template change is a git commit with a changelog). We also show how to use few-shot examples in the prompt to lock tone — "write like this example, not like a generic SaaS landing page."</p>
<h2>Module 3: The Rendering Pipeline — Edge Functions + Component Assembly</h2>
<p>We implement the pipeline on Vercel Edge Functions: middleware reads the segment cookie/header → Edge Function fetches the visitor's segment profile → selects the template variant → renders a React component tree to HTML (using <code>renderToString</code> with streaming) → returns the full page with a <code>Cache-Control: s-maxage=60, stale-while-revalidate=300</code> header so the CDN serves personalized HTML from cache for 60s, then revalidates in background. We use React Server Components for the static shell and client components only for interactive elements (forms, chat). The component library includes: Hero, ValueProps, SocialProof, FeatureGrid, FAQ, CTA — each with segment-aware props.</p>
<h2>Module 4: Creative Personalization — Images and Layout</h2>
<p>Copy isn't the only lever. We show how to: swap hero images per segment (industry-specific product shots from a DAM), reorder feature cards based on segment interest signals, show/hide entire sections (enterprise sees "SSO/SCIM", SMB sees "Quick Setup"), and inject dynamic social proof (logos of companies in their industry). For images, we pre-generate variants at build time (not runtime) and reference them by segment key — this avoids generation latency and cost at request time. The workshop includes a Figma-to-component pipeline for designing segment-specific layouts without custom code per variant.</p>
<h2>Module 5: Measurement — Proving It Works</h2>
<p>Personalization that doesn't measure is just busywork. We implement: a holdout group (10% see the generic page) for clean lift measurement; per-segment conversion tracking (form submit, demo request, signup) with statistical significance testing; a guardrail metric (bounce rate, time on page) to catch regressions; and a dashboard that shows lift per segment with confidence intervals. We also cover the trap: optimizing for the segment with the most traffic instead of the segment with the highest lift potential — the dashboard sorts by expected revenue impact, not volume.</p>
<h2>Module 6: Governance and Guardrails</h2>
<p>We close with the rails that keep this safe: a content review gate (no variant ships without marketing sign-off), a brand compliance checker (automated: forbidden words, required disclaimers, tone classifier), a PII scan (visitor data never enters the prompt), a cost circuit breaker (max LLM calls per hour), and a kill switch (feature flag to revert to generic page instantly). The recording includes a live demo of the full flow: new visitor → segment detection → personalized page rendered in <200ms at edge.</p>
<h2>What You'll Walk Away With</h2>
<ul>
<li>A segment definition framework and a starter segment library (8 B2B segments).</li>
<li>A prompt template system with a copy block library (50+ approved phrases).</li>
<li>A working Next.js + Edge Functions implementation (deployable to Vercel in one click).</li>
<li>A component library with segment-aware props (Hero, ValueProps, SocialProof, FeatureGrid, FAQ, CTA).</li>
<li>An A/B testing dashboard template with lift calculation and significance testing.</li>
<li>A governance checklist (review gate, brand compliance, PII scan, kill switch).</li>
</ul>
<h2>Prerequisites</h2>
<p>Vercel account (free tier works), Next.js 14+ familiarity, basic React Server Components knowledge. Access to an LLM API (OpenAI, Anthropic, or Vercel AI Gateway). Figma for the design-to-component section (view-only access works).</p>`,
    durationMinutes: 80,
    difficulty: "advanced",
    tags: ["marketing", "personalization"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },

  // sales
  {
    track: "sales",
    type: "guide",
    title: "AI SDR Playbook: Qualifying Leads Before a Human Ever Talks",
    slug: "ai-sdr-playbook",
    description: "Using AI to pre-qualify inbound leads so reps only talk to people worth talking to.",
    body: `<h2>The Approach</h2>
<p>Score and route leads before a human rep is ever looped in, so reps only spend their limited time on people who are actually worth talking to. The goal isn't to remove humans from the sales process — it's to make sure the humans in it are spending time where it matters.</p>
<h2>What to Score On</h2>
<ul>
<li><strong>Explicit fit signals</strong>: company size, industry, a stated need in the inbound form itself.</li>
<li><strong>Behavioral signals</strong>: pages visited, content downloaded, time spent on the site.</li>
<li><strong>Urgency signals</strong>: a specific timeline mentioned, a specific competitor mentioned.</li>
</ul>
<h2>The Qualification Flow</h2>
<p>An inbound lead arrives → an AI system extracts and scores it against the criteria above → the lead routes into a tier (route to a rep immediately, enter a nurture sequence, or disqualify) → only the top tier reaches a human right away. Everyone else is still handled, just not with a human's immediate attention.</p>
<h2>Where This Goes Wrong</h2>
<ul>
<li>Over-trusting the score without a human spot-check loop — a scoring system with no feedback mechanism drifts silently over time.</li>
<li>Scoring on criteria that don't actually correlate with close rate — review the scoring rubric against real outcomes periodically, not just at setup.</li>
<li>Disqualifying too aggressively and quietly losing real pipeline — a strict cutoff feels efficient but can filter out genuinely good-fit leads who just didn't hit every explicit signal.</li>
</ul>
<h2>A Minimum Viable Version</h2>
<p>You don't need a custom model to start. A scoring rubric plus a single LLM call that extracts the relevant fields from an inbound form or chat transcript is enough to prove the approach works before investing further in a more elaborate pipeline.</p>`,
    durationMinutes: 25,
    difficulty: "beginner",
    tags: ["sales", "lead-qualification"],
    isPublished: true,
    isPremium: false,
    publishedAt: new Date(),
  },
  {
    track: "sales",
    type: "template",
    title: "Call-Transcript-to-CRM Summarization Pipeline",
    slug: "call-transcript-crm-pipeline",
    description: "Auto-summarize sales calls straight into structured CRM fields.",
    body: `<h2>What's Inside</h2>
<p>A pipeline that turns a raw sales call recording into structured CRM fields automatically, with a confidence-based gate so uncertain extractions get a human glance before they land in the system of record.</p>
<h2>The Pipeline</h2>
<ol>
<li>Call is recorded.</li>
<li>Recording is transcribed.</li>
<li>Structured fields are extracted from the transcript via an LLM call.</li>
<li>Extracted fields are written to the corresponding CRM fields.</li>
<li>Any extraction below a confidence threshold is flagged for human review before the write is trusted.</li>
</ol>
<h2>Example Extraction Schema</h2>
<pre><code>{
  "call_summary": "string, 2-3 sentences",
  "pain_points": ["string"],
  "budget_mentioned": "string or null",
  "timeline_mentioned": "string or null",
  "objections_raised": ["string"],
  "next_step_agreed": "string or null",
  "sentiment": "positive | neutral | negative",
  "confidence": "number 0-1, below 0.6 should route to human review before CRM write"
}
</code></pre>
<h2>Usage Notes</h2>
<p>Run extraction against the schema above using a structured-output or JSON-mode call so the CRM write is a direct field mapping rather than free-text parsing that has to be re-interpreted downstream. Treat the <code>confidence</code> field as a real gate, not decoration — low-confidence extractions should queue for a human glance before they land in the CRM, since a wrong field silently written into a CRM does more damage than a missing one that at least reads as obviously incomplete.</p>`,
    durationMinutes: 15,
    difficulty: "intermediate",
    tags: ["sales", "crm"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "sales",
    type: "playbook",
    title: "Objection-Handling Scripts Trained on Your Own Closed-Won Calls",
    slug: "objection-handling-playbook",
    description: "Mine your best calls to build objection-handling scripts that actually reflect what works.",
    body: `<h2>The Approach</h2>
<p>Mine your own closed-won call transcripts for objection-response pairs instead of writing generic scripts from a training course. The responses that actually worked already exist in your own call history — the work is extracting and organizing them, not inventing new ones from theory.</p>
<h2>Step 1: Pull the Raw Material</h2>
<p>Gather transcripts from your best-performing reps' closed-won calls specifically — not a random sample of all calls. You want material that demonstrably worked, not an average of everything that was said regardless of outcome.</p>
<h2>Step 2: Extract Objection/Response Pairs</h2>
<p>For each transcript, identify the moment an objection was raised and the exact response that followed it, before the conversation moved on to something else. Capture the pair together — the objection alone or the response alone loses the context that makes it useful.</p>
<h2>Step 3: Cluster by Objection Type</h2>
<p>Group the extracted pairs under recurring categories — price, timing, competitor comparison, internal buy-in, "need to think about it" — so you can see which framing recurs across your best reps for each type, rather than treating every objection as a one-off.</p>
<h2>Step 4: Turn Patterns Into Scripts</h2>
<p>Write the script as the <em>pattern</em> behind the successful responses — typically acknowledge, reframe, then a specific proof point — rather than a verbatim transcript quote. This lets reps adapt the pattern in the moment instead of reciting a script that sounds obviously scripted.</p>
<h2>Step 5: Keep It a Living Document</h2>
<p>Re-mine every quarter. The objections that matter shift as your product, pricing, and competitive landscape change, and a script frozen from a year ago starts actively working against you once the market has moved past it.</p>
<h2>Common Mistakes</h2>
<ul>
<li>Building scripts from any call instead of closed-won calls specifically — this dilutes the material with responses that didn't actually work.</li>
<li>Writing responses that sound good in a training document but don't match how your actual top reps talk in a live call.</li>
<li>Treating the script as a rule instead of a starting point reps adapt live — a rigidly recited script is easy for a prospect to spot.</li>
</ul>`,
    durationMinutes: 20,
    difficulty: "intermediate",
    tags: ["sales", "objection-handling"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },

  // creative
  {
    track: "creative",
    type: "guide",
    title: "Building a Personal Style Library for Midjourney/Flux",
    slug: "personal-style-library",
    description: "Curate a reusable set of style references for consistent creative output.",
    body: `<h2>The Problem</h2>
<p>Generating one great image is easy with any current model. Generating a visually consistent <em>set</em> across a whole project without a system is much harder, because prompt wording alone drifts between sessions — the same phrase can render noticeably differently a week later even on the same model.</p>
<h2>What a Style Library Actually Is</h2>
<p>A curated, organized set of reference images paired with the specific prompt language that reliably reproduces their look, kept together so you're not reconstructing your style from memory every time you sit down to generate something new.</p>
<h2>Step 1: Collect Reference Images Deliberately</h2>
<p>Pull primarily from your own best past generations, not just external inspiration images. Your own successful outputs are proof the style is achievable with the tools you're actually using — an inspiration image from somewhere else might not be reproducible with your current model or workflow at all.</p>
<h2>Step 2: Extract the Repeatable Language</h2>
<p>For each reference image, write down the specific style, lighting, and composition terms that produced it — not just "I liked this one." The terms themselves are the reusable asset; the image is just the proof they worked.</p>
<h2>Step 3: Organize by Use Case, Not Just Aesthetic</h2>
<p>Group your library by where you'll actually use each style — hero images, social thumbnails, product shots — rather than purely by look. The same underlying aesthetic often needs different compositional rules depending on where it's going to appear.</p>
<h2>Step 4: Version It</h2>
<p>Treat your style references like a versioned asset (v1, v2, and so on) as your brand evolves. This lets you regenerate an old project in its original style even after your current style has moved on, instead of losing the ability to match past work.</p>
<h2>Keeping It Current</h2>
<p>Revisit and prune the library quarterly. Models update, and some reference-reproduction techniques stop working exactly the same way after an update — a style library needs occasional re-validation against the current model, not just indefinite accumulation.</p>`,
    durationMinutes: 20,
    difficulty: "beginner",
    tags: ["creative", "image-generation"],
    isPublished: true,
    isPremium: false,
    publishedAt: new Date(),
  },
  {
    track: "creative",
    type: "workshop",
    title: "Brand-Consistent Image Generation with LoRA/Style Refs",
    slug: "brand-image-generation-workshop",
    description: "Live online workshop — recording included. Train and apply a brand-consistent style.",
    body: `<h2>Workshop Overview</h2>
<p>This is the recorded version of a live 90-minute workshop where we train a lightweight style adapter (LoRA for Flux/SDXL, or a style reference set for Midjourney) on your brand assets, then apply it across a batch of on-brand generated images — hero shots, social thumbnails, product lifestyle, and ad creatives. The session covers: curating the training set, LoRA training config and hardware, validation and iteration, a prompting framework that keeps output consistent, and a production pipeline for generating hundreds of on-brand assets without drift. The recording includes the full training run (with checkpoints), a prompting playbook, and a generation pipeline you can run on Replicate, Fal, or your own GPU.</p>
<h2>Module 1: The Training Set — Quality In, Consistency Out</h2>
<p>A LoRA is only as good as its training images. We cover: minimum viable set (20-30 high-quality images for a character/style LoRA, 50+ for a full brand identity), image requirements (1024x1024 minimum, consistent aspect ratio, no watermarks, no text overlays), diversity within consistency (same style, varied subjects/compositions/lighting — the model learns the invariant style, not the specific content), captioning strategy (use a VLM like BLIP-2 or GPT-4V to auto-caption, then human-review every caption — the caption quality directly controls how well the LoRA responds to prompts), and the "negative set" (images that explicitly violate your brand style, used as negative examples in some training frameworks). We provide a curation checklist and a captioning template.</p>
<h2>Module 2: LoRA Training — Config, Hardware, and Iteration</h2>
<p>We train on Flux (recommended for 2025+) using the Kohya-ss/sd-scripts pipeline. Key config: <code>rank=32</code> (higher rank = more capacity but more VRAM and overfitting risk), <code>alpha=16</code>, <code>network_dim=32</code>, <code>learning_rate=1e-4</code> (with cosine decay), <code>batch_size=1</code> (gradient accumulation to simulate 4), <code>steps=2000-4000</code> depending on dataset size, <code>mixed_precision=bf16</code>. Hardware: 24GB VRAM (3090/4090/A6000) trains a rank-32 Flux LoRA in ~2 hours; 48GB (A100) cuts it to ~45 min. We show how to monitor training: loss curve (should descend smoothly, not oscillate), sample grid every 500 steps (visual check for style adoption vs. overfitting), and the "style strength" sweep at inference (scale 0.5-1.2) to find the sweet spot. We also cover the Midjourney alternative: no training, just a curated style reference grid (--sref) with 10-15 images — faster to start, less control, no local compute needed.</p>
<h2>Module 3: Validation — Does It Actually Work?</h2>
<p>Before generating production assets, we run a validation battery: <strong>Style transfer test</strong> — generate the same 20 prompts with and without the LoRA, blind A/B rate for brand adherence; <strong>Consistency test</strong> — generate 50 variations of one prompt (different seeds), measure CLIP embedding variance (lower = more consistent); <strong>Generalization test</strong> — prompt for subjects NOT in the training set (new products, new scenes), verify the style transfers; <strong>Drift test</strong> — generate at style scales 0.5, 0.75, 1.0, 1.2, find the range where brand holds without artifacts. We provide the validation prompt set and a scoring rubric. A LoRA that passes all four gates is production-ready.</p>
<h2>Module 4: Prompting Framework — The Brand Prompt Language</h2>
<p>Even a great LoRA drifts if prompts are loose. We define a Brand Prompt Template: <code>[BRAND_STYLE_TOKEN] + [SUBJECT] + [COMPOSITION] + [LIGHTING] + [CAMERA] + [NEGATIVE_CONSTRAINTS]</code>. The <code>BRAND_STYLE_TOKEN</code> is a fixed phrase (e.g., "brandstyle_v3_clean_minimal_tech") that activates the LoRA — never change it. The other slots come from a controlled vocabulary: composition (hero_centered, rule_of_thirds, negative_space), lighting (studio_soft, natural_window, dramatic_rim), camera (50mm, 85mm, 24mm_wide). We maintain this vocabulary in a shared Notion/Airtable so designers and engineers speak the same language. The workshop includes a prompt template library with 30+ tested combinations.</p>
<h2>Module 5: Production Pipeline — Batch Generation at Scale</h2>
<p>Generating one-off in Discord/ComfyUI doesn't scale. We build a pipeline: CSV input (asset brief: subject, composition, lighting, format, usage) → script reads CSV, constructs prompts from template, calls Fal/Replicate API (or local ComfyUI via API) with the LoRA → outputs organized by brief ID with metadata (prompt, seed, LoRA scale, model version) → human review queue (Approve/Revise/Reject) → approved assets auto-upload to DAM with tags. We implement: concurrency control (respect API rate limits), cost tracking (per-asset and per-batch), retry logic with exponential backoff, and a "regenerate with same seed, adjusted prompt" button for revisions. The pipeline runs as a GitHub Action or a simple CLI — no custom infrastructure needed.</p>
<h2>Module 6: Governance — Keeping the Brand Tight</h2>
<p>We close with the rails: LoRA versioning (v1, v2... with changelog and comparison grid), prompt vocabulary versioning (same), a quarterly re-validation (re-run the validation battery on the current LoRA — models update, styles drift), an asset audit (sample 10% of generated assets monthly, score for brand adherence), and a deprecation policy (retire LoRA versions after 2 major model updates or 12 months). The recording includes a live batch generation of 20 assets from a real brand brief.</p>
<h2>What You'll Walk Away With</h2>
<ul>
<li>A training set curation checklist and captioning template.</li>
<li>A Flux LoRA training config (Kohya-ss) with monitoring scripts.</li>
<li>A validation battery (4 tests) with prompt sets and scoring rubrics.</li>
<li>A Brand Prompt Template system with controlled vocabulary (30+ combinations).</li>
<li>A batch generation pipeline (CSV → API → Review → DAM) as a GitHub Action / CLI.</li>
<li>A governance framework (versioning, re-validation, audit, deprecation).</li>
</ul>
<h2>Prerequisites</h2>
<p>Access to Flux (via Fal, Replicate, or local 24GB+ VRAM GPU). Basic comfort with CLI and Python. 20-50 curated brand images with usage rights. No prior LoRA training experience required — we walk through every step.</p>`,
    durationMinutes: 90,
    difficulty: "advanced",
    tags: ["creative", "lora"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "creative",
    type: "audio",
    title: "Roundtable: Where AI Creative Tools Actually Replace vs Augment Designers",
    slug: "creative-tools-roundtable",
    description: "A recorded discussion on the real boundary between augmentation and replacement in creative work.",
    body: `<h2>Roundtable Participants</h2>
<ul>
<li><strong>Host</strong>: Maya Chen — Creative Director, formerly at Airbnb and Figma</li>
<li><strong>Panelist 1</strong>: Jordan Kim — Senior Product Designer, builds design systems at a Series C AI startup</li>
<li><strong>Panelist 2</strong>: Alex Rivera — Freelance Brand Designer, early Midjourney/Flux adopter, runs a 5-person studio</li>
<li><strong>Panelist 3</strong>: Sam Okafor — Design Engineer, bridges Figma and React, maintains an open-source design token pipeline</li>
</ul>
<h2>Segment 1: The Replacement Threshold — What's Already Gone</h2>
<p><strong>Maya</strong>: Let's start concrete. What tasks have you simply stopped doing manually in the last 12 months?</p>
<p><strong>Alex</strong>: Resizing and reformatting. Hero to square, square to story, story to banner — I haven't manually cropped an asset in a year. Figma auto-layout + a plugin handles the layout; Midjourney/Flux handles the imagery. The "production designer" role — purely executing)).

<p><strong>Jordan</strong>: Agree. Also: low-fidelity exploration. I used to sketch 20 directions for a feature. Now I prompt 50 in 10 minutes, cluster them, and show the team 3 that have legs. The sketching phase is compressed, not replaced — but the <em>volume</em> of exploration is 10x.</p>
<p><strong>Sam</strong>: Component variants. Button states, input states, dark mode, hover, focus, disabled — I write a script that generates the Figma components from design tokens. What took a week takes an hour. The <em>decision</em> of what states exist is still human; the <em>execution</em> is not.</p>
<h2>Segment 2: The Augmentation Zone — Where AI Is a Co-Pilot</h2>
<p><strong>Maya</strong>: What about the middle ground — tasks you still do, but AI materially changes how?</p>
<p><strong>Jordan</strong>: High-fidelity mockups. I still craft the key screens — the ones stakeholders sign off on — but I use AI to populate realistic content (not lorem ipsum), generate plausible data tables, suggest microcopy variants. The <em>structure</em> and <em>intent</em> are mine; the <em>filler</em> is AI. It saves hours per screen and the output is more reviewable because stakeholders react to real content.</p>
<p><strong>Alex</strong>: Moodboarding and reference gathering. I used to spend half a day on Pinterest/Behance. Now I prompt for "reference sheet: [style keywords], 9 images, consistent palette" and get a starting board in 2 minutes. I still curate — delete the 3 that feel off, add 2 from real world — but the blank page problem is gone.</p>
<p><strong>Sam</strong>: Design-to-code. I use AI to translate Figma specs to React components with Tailwind. It gets 80% there — spacing, tokens, responsive breakpoints. I fix the 20% (complex interactions, accessibility edge cases). The handoff conversation shifts from "here's a spec" to "here's working code, review the logic."</p>
<h2>Segment 3: The Human Moat — What Resists Automation</h2>
<p><strong>Maya</strong>: What do you <em>not</em> see AI touching in the next 3-5 years?</p>
<p><strong>Jordan</strong>: Strategic prioritization. Deciding <em>what</em> to build, for whom, in what order — that's product strategy, not design execution. AI can generate 50 onboarding flows; it can't tell you which one serves the business goal and the user need simultaneously.</p>
<p><strong>Alex</strong>: Taste and brand stewardship. A client comes with "make it feel premium but approachable." AI can generate "premium" and "approachable" separately; synthesizing them into a coherent visual language that holds across 100 touchpoints — that's taste. It's the thousand micro-decisions: this radius, that weight, this much breathing room. AI averages; taste curates.</p>
<p><strong>Sam</strong>: Cross-functional translation. Design doesn't exist in a vacuum — it negotiates with engineering (feasibility), product (scope), marketing (positioning), legal (compliance). AI can't sit in a sprint planning and say "we can't ship that animation on mobile, here's the fallback." That's relationship work, not pixel work.</p>
<h2>Segment 4: The Junior Designer Crisis</h2>
<p><strong>Maya</strong>: This is the elephant in the room. If production tasks and low-fi exploration are automated, what does a junior designer <em>do</em> to learn?</p>
<p><strong>Jordan</strong>: We're restructuring. Juniors now own the AI pipeline — prompt library, eval, quality gates. They learn by <em>critiquing</em> AI output at scale, not by making pixels one at a time. The skill shifts from "craft" to "judgment." But we have to be honest: the rung is higher. We pair juniors with seniors on the judgment calls; they don't fly solo on strategic work yet.</p>
<p><strong>Alex</strong>: I hire for taste first, tooling second. A junior who can articulate <em>why</em> a composition works — even if they can't execute it manually — is more valuable than one who executes perfectly but can't critique. The portfolio review has changed: I look for curation, not just creation.</p>
<p><strong>Sam</strong>: We need new apprenticeship models. "Watch me design" doesn't work when I'm prompting. We do "watch me evaluate" — here are 50 AI generations, walk me through your top 3 and why. That's teachable, observable, and directly relevant.</p>
<h2>Segment 5: Tooling Wishlist — What's Missing</h2>
<p><strong>Maya</strong>: If you could wave a wand and have one AI feature tomorrow, what is it?</p>
<p><strong>Jordan</strong>: A design system guardian. "Here's my token file, my component library, my brand guidelines. Watch every AI generation, every Figma edit, every code commit — flag anything that drifts." Not just linting; semantic drift detection.</p>
<p><strong>Alex</strong>: True style transfer with editable controls. Not "make this look like that reference" — "take this composition, apply this style, but let me adjust the color weight, the texture strength, the edge hardness independently." Current tools are too monolithic.</p>
<p><strong>Sam</strong>: Round-trip fidelity. Figma → code → Figma → code, lossless. We're close on tokens; we're far on layout intent (auto-layout ≠ flexbox in all cases) and interaction state.</p>
<h2>Segment 6: The Business Model Shift</h2>
<p><strong>Maya</strong>: How does this change what clients pay for?</p>
<p><strong>Alex</strong>: They're not paying for "10 social assets." They're paying for "a visual system that generates 100 on-brand assets on demand." The deliverable shifts from <em>assets</em> to <em>systems</em>. My retainer includes the LoRA, the prompt library, the generation pipeline — not the PNGs.</p>
<p><strong>Jordan</strong>: In-house, design's value metric shifts from "screens delivered" to "decision velocity." How fast can we go from "we have a hypothesis" to "we have a testable prototype with real data"? AI compresses the middle. Design's leverage is at the ends: framing the problem and interpreting the result.</p>
<h2>Key Takeaways</h2>
<ul>
<li><strong>Replaced</strong>: Production resizing, low-fi volume exploration, mechanical component generation, reference gathering.</li>
<li><strong>Augmented</strong>: High-fidelity mockups (content population), moodboarding (starting point), design-to-code (80% translation), copy iteration.</li>
<li><strong>Human moat</strong>: Strategic prioritization, taste/brand synthesis, cross-functional negotiation, judgment at scale.</li>
<li><strong>Junior path</strong>: Shift from craft execution to AI output evaluation and pipeline ownership.</li>
<li><strong>Business model</strong>: Sell systems and decision velocity, not assets and screens.</li>
</ul>`,
    durationMinutes: 45,
    difficulty: "beginner",
    tags: ["creative", "discussion"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },

  // privacy
  {
    track: "privacy",
    type: "guide",
    title: "What Actually Happens to Your Data When You Call an AI API",
    slug: "ai-api-data-handling",
    description: "A plain-language walkthrough of data retention and training-use policies across major providers.",
    body: `<h2>The Reality</h2>
<p>What actually happens to your data depends entirely on the specific provider, the plan tier, and whether you're using the API surface versus the consumer product from the same company — there's no single universal answer that applies across the board. Two products from the same company can have meaningfully different data policies.</p>
<h2>The Questions That Actually Matter</h2>
<ul>
<li>Is this input used to train future models by default?</li>
<li>Is there an opt-out, and is it self-serve or does it require contacting support?</li>
<li>What's the retention window before data is deleted?</li>
<li>Is there a zero-data-retention or enterprise agreement available?</li>
<li>Does the answer differ between the API and the consumer chat product from the same company?</li>
</ul>
<h2>Where to Actually Find the Answer</h2>
<p>Check the provider's data-processing or DPA (Data Processing Agreement) page and API-specific terms — not the general marketing privacy page. These frequently say different things, and only the API-specific terms actually bind your API usage; the marketing page is often written for the consumer product.</p>
<h2>Practical Defaults If You're Unsure</h2>
<ul>
<li>Treat anything sent to a consumer chat UI as potentially used for training unless explicitly stated otherwise.</li>
<li>Prefer API access with an explicit no-training agreement for anything sensitive.</li>
<li>Never send data you wouldn't be comfortable seeing in a training set, in case the policy turns out to be more permissive than you assumed.</li>
</ul>
<h2>This Changes Often</h2>
<p>Re-check policies whenever a provider changes plans, or when you're about to scale usage significantly — not just once at initial adoption. Data policies are one of the more frequently revised parts of a provider's terms.</p>`,
    durationMinutes: 20,
    difficulty: "beginner",
    tags: ["privacy", "data-handling"],
    isPublished: true,
    isPremium: false,
    publishedAt: new Date(),
  },
  {
    track: "privacy",
    type: "playbook",
    title: "Running Everything Air-Gapped: A Paranoid Operator's Stack",
    slug: "air-gapped-stack-playbook",
    description: "For when 'self-hosted' isn't private enough — a fully offline AI stack.",
    body: `<h2>When Self-Hosted Isn't Private Enough</h2>
<p>A standard self-hosted stack still typically has outbound network access — package installs, telemetry calls, DNS lookups. A true air-gapped requirement means zero external network dependency at all, which is a stricter and far more deliberate build than "I run my own server."</p>
<h2>What Has to Change From a Normal Self-Hosted Stack</h2>
<ul>
<li>Model weights downloaded once and stored locally, rather than pulled at runtime from a remote registry.</li>
<li>No telemetry or analytics calls from any component in the stack, including ones you didn't realize had them by default.</li>
<li>No auto-update mechanisms that phone home, even for something as innocuous-seeming as a version check.</li>
<li>DNS resolution disabled entirely, or pointed only at an internal resolver with no path to the public internet.</li>
</ul>
<h2>Building the Model Layer</h2>
<p>Download and checksum-verify model weights on a connected machine first, then transfer them via physical media or a controlled one-way transfer mechanism. The air-gapped machine should never initiate an outbound model download itself — that's the exact dependency an air gap is meant to eliminate.</p>
<h2>Building the Application Layer</h2>
<p>Vendor all dependencies — container images, Python or Node packages — at build time on a connected machine, then ship the fully built artifact across the gap rather than attempting to build anything on the air-gapped side, where a missing dependency would have no way to resolve itself.</p>
<h2>Auditing for Leaks</h2>
<p>Run the stack with network access physically disconnected and confirm it still functions end to end. Anything that silently degrades or throws an error on disconnect had a hidden network dependency you missed during the build — this test is the actual proof the air gap holds, not an assumption based on the build process.</p>
<h2>Operational Discipline</h2>
<ul>
<li>Every update goes through the same connected-build → transfer → verify cycle as the initial install, with no exceptions "just this once" for a quick patch.</li>
<li>Maintain a manifest of exactly what's running and its provenance, so an audit doesn't require reverse-engineering what was installed and when.</li>
</ul>
<h2>Who Actually Needs This</h2>
<p>This is meaningfully more operational overhead than standard self-hosting — every update becomes a multi-step process instead of a single command. Reserve it for genuine regulatory or contractual air-gap requirements, not as a default privacy posture when standard self-hosting would already satisfy the actual need.</p>`,
    durationMinutes: 30,
    difficulty: "advanced",
    tags: ["privacy", "self-hosted"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "privacy",
    type: "guide",
    title: "GDPR/CCPA Basics for AI Features You're Shipping",
    slug: "gdpr-ccpa-basics",
    description: "The compliance basics operators need before shipping AI features that touch user data.",
    body: `<h2>Not Legal Advice</h2>
<p>This is an operator's starting checklist for thinking about compliance before you ship an AI feature that touches real user data — it is not a substitute for actual legal review once you're shipping anything at meaningful scale. Treat everything below as a starting point for that conversation with counsel, not the end of it.</p>
<h2>What Both Laws Are Actually About</h2>
<p>At their core, both laws are about giving people meaningful control over their own personal data: knowing what's collected about them, why it's collected, and being able to access or delete it on request.</p>
<h2>GDPR Basics for AI Features</h2>
<ul>
<li>A documented lawful basis for processing personal data through an AI feature — you need a specific, articulable reason, not just "we needed the data for the feature to work."</li>
<li>Data minimization — don't send more personal data into a model than the feature actually needs to function.</li>
<li>The right to erasure applies to data you've stored, even though the underlying model itself generally can't be made to "forget" a specific interaction it was exposed to.</li>
<li>Data Processing Agreements (DPAs) with any third-party model provider that touches EU user data.</li>
</ul>
<h2>CCPA Basics for AI Features</h2>
<ul>
<li>Disclosure of what personal data is collected and shared with third parties, including any model API providers in the data path.</li>
<li>An opt-out mechanism for the sale or sharing of personal information.</li>
<li>Honoring deletion requests across every system that stores the data — not just your primary database, but logs, backups, and any third-party systems it flowed into.</li>
</ul>
<h2>The AI-Specific Wrinkle</h2>
<p>When a third-party model provider sits in your data path, your compliance obligations extend to what <em>they</em> do with that data too. Their DPA terms and retention or training policies become part of your own compliance posture — not a separate concern you can wave off as "that's their problem."</p>
<h2>A Practical Pre-Launch Checklist</h2>
<ul>
<li>Documented what personal data the feature actually touches.</li>
<li>Confirmed a lawful basis (GDPR) or made the required disclosure (CCPA).</li>
<li>DPA in place with every third-party provider in the data path.</li>
<li>Deletion requests provably propagate to all storage locations, including provider-side logs where possible.</li>
<li>Minimized what's actually sent to the model to only what the feature needs.</li>
<li>Had actual legal review before shipping to production.</li>
</ul>`,
    durationMinutes: 25,
    difficulty: "intermediate",
    tags: ["privacy", "compliance"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },

  // finetuning
  {
    track: "finetuning",
    type: "guide",
    title: "When to Fine-Tune vs When to Just Write a Better Prompt",
    slug: "finetune-vs-prompt",
    description: "Fine-tuning is expensive and often unnecessary. A framework for deciding when it's actually worth it.",
    body: `<h2>The Framework</h2>
<p>Fine-tuning is expensive in both money and iteration speed compared to prompting. Most problems people bring to it are actually solved by better prompting or retrieval — fine-tuning should be the option you reach for after those have genuinely been exhausted, not the first thing you try.</p>
<h2>Try This First: Better Prompting</h2>
<p>More specific instructions, few-shot examples embedded directly in the prompt, and structured output constraints solve a surprisingly large share of "the model isn't doing what I want" complaints. Most of these are prompt-engineering problems wearing a fine-tuning costume.</p>
<h2>Try This Second: Retrieval</h2>
<p>If the actual problem is the model not <em>knowing</em> something — rather than the model behaving the wrong way — retrieval-augmented context usually beats fine-tuning. It also updates instantly when your underlying data changes, instead of requiring a full retraining cycle every time the facts shift.</p>
<h2>When Fine-Tuning Actually Wins</h2>
<ul>
<li>You need a consistent output format or voice that's genuinely hard to hold reliably via prompting alone at volume.</li>
<li>You need lower per-request latency or cost than a large general-purpose model with a long prompt would give you.</li>
<li>You're teaching a narrow, well-defined skill that doesn't require broad world knowledge.</li>
</ul>
<h2>The Real Cost of Fine-Tuning</h2>
<p>It's not just the compute bill. It's building a labeled dataset good enough to train on, an iteration loop that's inherently slow (you can't edit a prompt and re-test in seconds the way you can with prompting), and needing to re-run the entire process whenever the base model updates or your requirements shift.</p>
<h2>A Decision Test</h2>
<p>Before fine-tuning, ask three questions: have you actually maxed out prompting and retrieval first? Is the problem really about format, voice, or cost rather than the model lacking knowledge? And do you have — or can you realistically build — a dataset good enough to fine-tune on? If any answer is no, that's the cheaper problem to solve first, before touching fine-tuning at all.</p>`,
    durationMinutes: 20,
    difficulty: "beginner",
    tags: ["finetuning", "prompting"],
    isPublished: true,
    isPremium: false,
    publishedAt: new Date(),
  },
  {
    track: "finetuning",
    type: "workshop",
    title: "LoRA Fine-Tuning a 7B Model on Your Own Support Tickets",
    slug: "lora-finetuning-workshop",
    description: "Live online workshop — recording included. Fine-tune a small model on your own data.",
    body: `<h2>Workshop Overview</h2>
<p>This is the recorded version of a live 100-minute workshop where we fine-tune a 7B parameter model (Llama-3.1-8B or Qwen2.5-7B) with QLoRA on a real support ticket dataset — from data prep through training, evaluation, and deployment as a classified/routing assistant. The session covers: dataset construction from raw tickets, QLoRA config that actually converges, eval harness that measures classification accuracy and response quality, and serving the fine-tuned model with vLLM for production inference. The recording includes the full training run (with W&B logs), the eval results comparing base vs. fine-tuned, and a deployable inference server.</p>
<h2>Module 1: Dataset Construction — From Tickets to Training Pairs</h2>
<p>Raw support tickets are messy: mixed languages, PII, multi-thread conversations, agent notes mixed with customer messages. We build a cleaning pipeline: export from Zendesk/Intercom/Linear → strip PII (regex + NER for names, emails, order IDs, API keys) → separate customer vs. agent messages → extract the "problem → resolution" pairs → classify each ticket into your taxonomy (billing, technical, account, feature_request, bug_report) → format as instruction-following pairs: <code>{"instruction": "Classify this support request and draft a response.", "input": "customer message", "output": "Category: technical\\nResponse: ..."}</code>. We target 2,000-5,000 high-quality pairs — quality beats quantity. We also create a held-out test set (500 pairs) stratified by category for eval. The workshop includes the cleaning scripts and a taxonomy template.</p>
<h2>Module 2: QLoRA Config That Converges</h2>
<p>We use the QLoRA recipe from the QLoRA paper + community refinements: base model in 4-bit NF4 (bitsandbytes), LoRA rank 64, alpha 16, dropout 0.05, target modules <code>q_proj, v_proj, k_proj, o_proj, gate_proj, up_proj, down_proj</code> (all linear layers), learning rate 2e-4 with cosine decay, batch size 4 (gradient accumulation 4 = effective 16), 3 epochs, max sequence length 2048 (packed with <code>pack_sequences=True</code>). Hardware: 2x 24GB GPUs (3090/4090) with FSDP or single 48GB (A100) — single 24GB works with gradient checkpointing and batch size 1 but takes 4x longer. We use Hugging Face <code>Trainer</code> with <code>peft</code> and <code>bitsandbytes</code>. Key monitoring: training loss should drop smoothly, eval loss should not diverge (overfitting signal), and we log per-category accuracy on the held-out set every 100 steps.</p>
<h2>Module 3: Evaluation — Did It Actually Help?</h2>
<p>Fine-tuning without rigorous eval is just hope. We run three eval suites: <strong>Classification accuracy</strong> — on the held-out test set, compare base model (few-shot) vs. fine-tuned (zero-shot) on category prediction. Target: fine-tuned beats base by >15pp absolute. <strong>Response quality</strong> — LLM-as-judge (GPT-4o or Claude) rates draft responses on: correctness (addresses the actual issue), tone (empathetic, professional, on-brand), completeness (no missing steps), and safety (no hallucinated policies). <strong>Latency/throughput</strong> — serve both models on vLLM, measure tokens/sec and p99 latency at your target concurrency. The workshop includes the eval scripts and a results template. We also show the failure cases — where the fine-tuned model still hallucinates — so you know the boundaries.</p>
<h2>Module 4: Serving — vLLM with LoRA Adapters</h2>
<p>vLLM supports dynamic LoRA loading — you serve the base model once and hot-swap adapters per request. We configure: <code>max_loras=4</code>, <code>max_lora_rank=64</code>, <code>max_cpu_loras=8</code> (offload inactive to CPU). The API accepts a <code>lora_name</code> parameter to select the adapter. We build a thin FastAPI wrapper that: receives a ticket → classifies category (using the fine-tuned model) → routes to the appropriate response template or generates a draft (using the same model with a response prompt) → returns structured JSON. We benchmark: 50 concurrent requests, 2048 context, 7B base + 64-rank LoRA on 2x A100 — ~3,500 tokens/sec aggregate, p99 < 800ms. The workshop includes the vLLM config and FastAPI server code.</p>
<h2>Module 5: Production Guardrails</h2>
<p>We close with the rails that keep a fine-tuned support model safe: <strong>Confidence threshold</strong> — if the model's category prediction entropy > threshold, route to human instead of auto-responding. <strong>Policy guardrails</strong> — a separate classifier (or rules engine) checks the draft response against a forbidden-actions list (refunds >$X, account deletion, API key disclosure) before any human sees it. <strong>Shadow mode</strong> — deploy alongside humans for 2 weeks, log every prediction vs. human action, measure agreement rate before going live. <strong>Retraining trigger</strong> — when drift detection (category distribution shift >10% or new category emergence) or monthly eval shows >5pp accuracy drop, trigger a retrain. The recording includes a live demo of the shadow mode dashboard.</p>
<h2>What You'll Walk Away With</h2>
<ul>
<li>A ticket-to-training-pair cleaning pipeline (scripts + taxonomy template).</li>
<li>A QLoRA training config (HF Trainer + peft + bitsandbytes) with W&B logging.</li>
<li>An eval harness (classification accuracy, LLM-judge response quality, latency benchmark).</li>
<li>A vLLM serving config with dynamic LoRA loading + FastAPI wrapper.</li>
<li>A production guardrails checklist (confidence threshold, policy guard, shadow mode, retraining trigger).</li>
</ul>
<h2>Prerequisites</h2>
<p>2x 24GB VRAM GPUs (or 1x 48GB, or cloud equivalent on Lambda/RunPod). Access to 2,000+ historical support tickets with resolutions. Python 3.10+, familiarity with HF Trainer and PEFT. W&B account (free) for experiment tracking.</p>`,
    durationMinutes: 100,
    difficulty: "advanced",
    tags: ["finetuning", "lora"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  {
    track: "finetuning",
    type: "code",
    title: "QLoRA Training Script + Eval Harness Template",
    slug: "qlora-training-eval-template",
    description: "A ready-to-adapt training script paired with an eval harness so you can measure whether the fine-tune actually helped.",
    body: `<h2>What's Inside</h2>
<p>A QLoRA training script skeleton paired with an eval harness, because a fine-tune you can't measure before and after isn't provably an improvement — it's just a different model you're hoping is better.</p>
<h2>Training Script Skeleton</h2>
<pre><code>"""
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
</code></pre>
<h2>Eval Harness Skeleton</h2>
<pre><code>"""
Minimal before/after eval harness: run the same prompt set through the base
model and the fine-tuned model, score both, and compare. Replace \`score\`
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
</code></pre>
<h2>Why the Eval Harness Matters More Than the Training Script</h2>
<p>The training script above is close to boilerplate — most of it is standard QLoRA setup you'd find in any tutorial. The eval harness is where the actual judgment call lives, because "did this fine-tune help" is only answerable if you scored the same eval set both before and after with a metric that reflects what you actually wanted to improve, not just whatever's easiest to compute.</p>`,
    durationMinutes: 15,
    difficulty: "advanced",
    tags: ["finetuning", "code"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
  // workflows
  {
    track: "infrastructure",
    type: "workflow",
    title: "Production RAG Pipeline: n8n + Vercel AI SDK + Neon PGVector",
    slug: "production-rag-pipeline",
    description: "Complete production RAG pipeline with hybrid search, Cohere reranking, GPT-4o generation with citation enforcement, and eval logging. Includes importable n8n workflow, native Next.js API routes, and interactive demo.",
    body: `<h2>Overview</h2>
<p>A production-grade Retrieval-Augmented Generation pipeline you can deploy in two ways: as an <strong>n8n workflow</strong> (visual, no-code deployment) or as <strong>native Next.js API routes</strong> (full code control). Both share the same architecture: hybrid vector + keyword search via Neon PGVector, Cohere rerank-english-v3.0 for precision, GPT-4o for generation with mandatory inline citations, and structured eval logging for observability.</p>
<h2>Architecture</h2>
<pre><code>Ingest:  POST /webhook/rag/ingest  →  Chunk (1000/200)  →  Dual Embed (OpenAI + Cohere)  →  Upsert to Neon PGVector
Query:   POST /webhook/rag/query    →  Embed Query      →  Vector Search (cosine)       →  Cohere Rerank (top-5)
                                                  ↓
                                          Build Cited Prompt → GPT-4o (streaming)
                                                  ↓
                                          Eval (citations, faithfulness) → Log to Neon + PostHog
                                                  ↓
                                          Return { answer, sources[], eval{} }</code></pre>
<h2>Key Features</h2>
<ul>
<li><strong>Hybrid Search</strong>: PGVector cosine similarity with configurable threshold (default 0.3) and metadata filtering</li>
<li><strong>Cohere Reranking</strong>: rerank-english-v3.0 reorders initial results for precision — typically 15-30% quality boost</li>
<li><strong>Citation Enforcement</strong>: Prompt requires [1], [2] inline citations; post-generation eval verifies presence and count</li>
<li><strong>Streaming Response</strong>: Vercel AI SDK streams GPT-4o tokens; works on Edge and Node.js runtimes</li>
<li><strong>Eval Logging</strong>: Every query logs question, answer, sources, similarity scores, citation metrics to Neon for drift detection</li>
<li><strong>n8n Portable</strong>: Import the workflow JSON into any n8n instance (self-hosted or Cloud); same webhook endpoints</li>
</ul>
<h2>Quick Start</h2>
<ol>
<li><strong>Neon Setup</strong>: Create project → enable pgvector → run init SQL (creates <code>documents</code> and <code>rag_logs</code> tables)</li>
<li><strong>API Keys</strong>: OpenAI (text-embedding-3-large, gpt-4o) + Cohere (embed-english-v3.0, rerank-english-v3.0)</li>
<li><strong>Deploy</strong>: Import <code>production-rag-pipeline.json</code> in n8n → configure credentials → activate</li>
<li><strong>Test</strong>: <code>curl -X POST /webhook/rag/ingest -d '{"text":"Your docs...","metadata":{"source":"wiki"}}'</code></li>
</ol>
<h2>API Contracts</h2>
<h3>Ingest</h3>
<pre><code>POST /webhook/rag/ingest
{
  "text": "string (required)",
  "metadata": { "source": "string", "version": "string" },
  "chunkSize": 1000,
  "chunkOverlap": 200
}

Response: { "chunksCreated": 42, "chunkIds": ["uuid", ...] }</code></pre>
<h3>Query</h3>
<pre><code>POST /webhook/rag/query
{
  "query": "string (required)",
  "topK": 10,
  "filter": { "source": "wiki" },
  "rerank": true
}

Response: {
  "answer": "string with [1][2] citations",
  "sources": [{ "index": 1, "content": "...", "metadata": {}, "similarity": 0.847 }],
  "eval": { "hasCitations": true, "citationCount": 3, "sourceCount": 5 }
}</code></pre>
<h2>Production Hardening Checklist</h2>
<ul>
<li>[ ] Add authentication on webhook endpoints (n8n basic auth or middleware)</li>
<li>[ ] Configure PGVector IVFFlat index with appropriate <code>lists</code> for your data size</li>
<li>[ ] Set up PostHog dashboard for query volume, latency p50/p95, citation rate</li>
<li>[ ] Add cost circuit breaker (max tokens per query, max queries per hour)</li>
<li>[ ] Implement LLM-as-judge eval for faithfulness (beyond citation heuristic)</li>
<li>[ ] Add PII detection guardrail before ingestion</li>
<li>[ ] Set up automated eval regression tests on golden query set</li>
</ul>
<h2>Files Included</h2>
<ul>
<li><code>production-rag-pipeline.json</code> — Importable n8n workflow (14 nodes)</li>
<li><code>rag-pipeline.ts</code> — Native TypeScript implementation (Vercel AI SDK)</li>
<li><code>app/api/rag/ingest/route.ts</code> — Next.js App Router ingest endpoint</li>
<li><code>app/api/rag/query/route.ts</code> — Next.js App Router query endpoint</li>
<li><code>app/components/rag/RAGChat.tsx</code> — Interactive React chat component</li>
<li><code>app/workflows/production-rag-pipeline/page.tsx</code> — Demo page with live chat</li>
</ul>
<p><strong>Track:</strong> Infrastructure · <strong>Type:</strong> Workflow · <strong>Difficulty:</strong> Advanced · <strong>Est. Time:</strong> 45 min to deploy & test</p>`,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoProvider: "youtube",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    downloadUrl: "/workflows/production-rag-pipeline.json",
    n8nWorkflowJson: n8nWorkflow,
    demoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    estimatedTimeMinutes: 45,
    difficulty: "advanced",
    tags: ["rag", "n8n", "pgvector", "cohere", "eval", "production"],
    isPublished: true,
    isPremium: true,
    publishedAt: new Date(),
  },
];

async function main() {
  console.log("Seeding tracks...");
  const trackIdByKey = new Map<string, string>();

  for (const track of seedTracks) {
    const [row] = await db
      .insert(tracks)
      .values(track)
      .onConflictDoUpdate({
        target: tracks.key,
        set: track,
      })
      .returning({ id: tracks.id, key: tracks.key });
    trackIdByKey.set(row.key, row.id);
    console.log(`  ✓ ${track.title}`);
  }

  console.log("Seeding content...");
  for (const { track, ...item } of seedContent) {
    const trackId = trackIdByKey.get(track);
    if (!trackId) {
      throw new Error(`Unknown track key "${track}" for content "${item.title}"`);
    }

    await db
      .insert(content)
      .values({ ...item, trackId })
      .onConflictDoUpdate({
        target: content.slug,
        set: { ...item, trackId },
      });
    console.log(`  ✓ ${item.title}`);
  }

  console.log("Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
