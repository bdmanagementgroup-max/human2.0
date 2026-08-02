# human2.0 — 12-Week Roadmap (Julian Goldie Model Adapted for AI Engineers)

> **Strategy:** Adapt Julian Goldie's SEO content flywheel → AI Engineering content flywheel
> **Target:** Developers building production AI systems (agents, RAG, evals, observability)
> **Model:** Free YouTube/Newsletter → Paid Community ($29-97/mo) → Cohort Courses ($497-997) → High-ticket Services
> **Infrastructure:** Existing Next.js 15 + Clerk + PayPal + Neon + Drizzle + Admin Dashboard ✅

---

## Phase 0: Foundation (Week 0 — *This Week*)

### Infrastructure Audit & Gaps

| System | Status | Action Needed |
|--------|--------|---------------|
| **Content CMS** | ✅ 23 items seeded, admin CRUD, prose-invert typography | Add content types: `workflow`, `notebook`, `video`, `template` |
| **Auth/Gating** | ✅ Clerk + middleware + PayPal webhooks | Verify subscription gating works end-to-end |
| **Payments** | ⚠️ PayPal creds missing | Add sandbox creds → test full flow |
| **Email/Newsletter** | ⚠️ `/api/subscribe` logs only | Integrate **Beehiiv** (recommended) or ConvertKit |
| **Community** | ❌ None | Create **Discord** (primary) + **Circle/Slack** (backup) |
| **Video/Content Production** | ❌ None | Set up Loom/ScreenFlow + editor workflow |
| **Analytics** | ⚠️ Basic only | Add PostHog (product) + Beehiiv (newsletter) + Discord analytics |

### Immediate Decisions Needed

- [ ] **Newsletter platform**: Beehiiv (best for growth, built-in referral, ad network) → *Recommended*
- [ ] **Community platform**: Discord (free, devs already there) + Circle (paid, better courses) → *Start Discord only*
- [ ] **Video hosting**: YouTube (public) + Vimeo/Stream (private community) → *YouTube + Mux for gated*
- [ ] **Course platform**: Maven (cohort) vs self-hosted (Next.js) → *Self-hosted using existing infra*
- [ ] **Pricing anchor**: $29/mo (Pro) / $97/mo (Elite) / $497 (Course) — match Julian's ladder

---

## Phase 1: Flywheel Foundation (Weeks 1-4)

### Week 1: "Flagship Workflow" + Lead Magnet

**Goal:** One exceptional, importable workflow that demonstrates production quality

| Deliverable | Format | Distribution |
|-------------|--------|--------------|
| **Production RAG Pipeline (n8n + Vercel AI SDK + Neon PGVector)** | GitHub repo + n8n workflow JSON + 20-min raw screen recording | YouTube + Newsletter lead magnet |
| **Lead Magnet: "RAG Architecture Decision Matrix"** | PDF (Notion export) + interactive Notion page | Gate behind email capture |
| **Newsletter Issue #1** | "Why your RAG fails in production — 3 fixes" | Beehiiv, cross-post to LinkedIn/Twitter |

**Technical Spec — RAG Workflow:**
```
n8n Nodes:
1. Webhook (ingest) → 2. Chunk (recursive, configurable) → 3. Embed (OpenAI/Cohere) → 
4. Upsert (Neon PGVector) → 5. Query (hybrid: vector + keyword) → 6. Rerank (Cohere/Jina) → 
7. Generate (Vercel AI SDK streaming) → 8. Eval (custom: faithfulness, relevance) → 9. Log (PostHog)
```

**Admin Dashboard Tasks:**
- [ ] Add content type `workflow` with fields: `n8nJson`, `githubUrl`, `demoVideoUrl`, `difficulty`, `estTime`
- [ ] Seed this workflow as first `workflow` type item (isPremium=true)
- [ ] Verify content page renders n8n embed / download button

### Week 2: Content Engine + Newsletter Rhythm

**Goal:** Establish 2x/week newsletter cadence, 1x/week YouTube

| Content Piece | Format | SEO/Discovery Keywords |
|---------------|--------|------------------------|
| Video #2: "I Built Agent Observability in 30 Min (OpenTelemetry + Vercel)" | 15-min raw screen rec | "AI agent observability", "OpenTelemetry Vercel" |
| Newsletter #2 (Tue): "The eval gap: why vibes aren't metrics" | Tactical deep-dive | — |
| Newsletter #3 (Fri): "Case study: 1M tokens/day, $47/mo, 99.9% uptime" | Case study teardown | — |
| Lead Magnet #2: "Agent Architecture Pattern Cards" | 10 PDF cards + code snippets | Gate → newsletter |

**YouTube Optimization:**
- Thumbnail formula: **Result screenshot + Red arrow + "HOW" text** (test 3 variants)
- Description template: Timestamps → GitHub → Newsletter → Community → Affiliates
- Shorts: 1 per video (30-60s cliffhanger → "Full video linked")

### Week 3: Community Launch (Discord)

**Goal:** 50 founding members, active daily conversation

| Channel Structure (Julian-adapted) | Purpose |
|-----------------------------------|---------|
| `#📢-announcements` | Releases, calls, updates |
| `#🎁-free-resources` | Workflows, prompts, templates, checklists |
| `#💬-general` | Watercooler |
| `#🤖-agent-workflows` | n8n/LangGraph/Make imports, debugging |
| `#🔬-evals-observability` | Eval frameworks, traces, metrics |
| `#🏗-production-patterns` | Architecture discussions, code reviews |
| `#📊-case-studies` | Member wins, traffic/cost/reliability numbers |
| `#🎤-office-hours` | Weekly call announcements, recordings |
| `#🛠-tool-reviews` | Vetted vendors, discounts |
| `#💰-marketplace` | Hiring, freelance, co-founders, site flips |
| `#🆘-help-desk` | Staffed 9-5 Mon-Fri |

**Launch Sequence:**
1. **Day 1**: Invite newsletter subs (500+) → Discord link + "Founding Member" role ($29/mo locked forever)
2. **Day 2**: Drop **Workflow #2** (Agent Observability) in `#free-resources`
3. **Day 3**: **Live Office Hours #1** — "Architecture Review: Bring your RAG stack" (recorded)
4. **Day 5**: **Friday Wins Thread** — members post metrics, get feedback
5. **Day 7**: Recap newsletter → "This week in human2.0 Discord"

**Pricing at Launch:**
- **Founding Pro**: $29/mo (grandfathered, limited to 100)
- **Founding Elite**: $97/mo (includes course access, 1:1 monthly call)
- **After 100 members**: $47/mo / $147/mo

### Week 4: First Cohort Course Pre-Sell

**Goal:** Validate $497 course demand with 20+ pre-sales

| Course: **"Production AI Engineer: From Prototype to Production"** |
|------------------------------------------------------------------|
| **Format:** 4-week cohort (weekly 2-hr live + async), 20 students max |
| **Modules:** 1) Production RAG 2) Agent Observability 3) Eval-Driven Dev 4) Cost/Performance Optimization |
| **Includes:** All workflows, private GitHub, 4 live sessions, Discord cohort channel, certificate |
| **Pre-sell Price:** $397 (founding) → $497 (regular) |
| **Launch:** Week 4 newsletter + Discord announcement + 7-day cart open |

**Pre-sell Assets:**
- [ ] Landing page (existing `/dashboard` area or new `/course` route)
- [ ] Syllabus PDF + video trailer (3-min)
- [ ] FAQ: "Do I need AI experience?" "What stack?" "Refund policy?"
- [ ] Testimonials: Get 3 from founding members (free access for feedback)

---

## Phase 2: Scale & Systematize (Weeks 5-8)

### Week 5: Content Library Expansion

| New Workflow/Guide | Type | Premium? |
|--------------------|------|----------|
| "Multi-Tenant RAG for SaaS" (Row-level security + shared infra) | Workflow | ✅ |
| "Prompt Versioning & CI/CD with GitHub Actions" | Guide + Template | ✅ |
| "Guardrails in Production: PII, Injection, Hallucination Detection" | Guide + Code | ✅ |
| "Local LLM Development with Ollama + ngrok + Vercel" | Video + Repo | Free (lead gen) |

**Newsletter:** 2x/week cadence locked in
**YouTube:** 1x/week (batch record 4/month)
**Discord:** Daily engagement (founder posts 1-2x/day)

### Week 6: Automated Content Pipeline

**Build once, use forever:**

| Automation | Tool | Trigger |
|------------|------|---------|
| YouTube → Shorts clip | OpusClip / custom n8n | New upload |
| Video → Newsletter draft | n8n + GPT-4o (transcript → summary) | New upload |
| Discord wins → Case study draft | n8n (reactions > 5 → Notion) | Weekly |
| Newsletter → Blog post (SEO) | Next.js MDX auto-publish | Send |
| Metrics dashboard | PostHog + Neon → Admin dashboard | Real-time |

**Admin Dashboard Enhancements:**
- [ ] Content performance table (views, signups, revenue attribution)
- [ ] Member directory with subscription status, engagement score
- [ ] Course cohort management (enrollment, progress, certificates)

### Week 7: Partnership & Affiliate Engine

**Vetted Tool Partners (negotiate 20-30% rev share + member discounts):**

| Category | Target Partners | Member Perk |
|----------|----------------|-------------|
| Hosting/Infra | Vercel, Neon, Railway, Fly.io | $50-500 credits |
| AI/ML | OpenAI, Anthropic, Cohere, Together | API credits |
| Observability | PostHog, Langfuse, Helicone, Braintrust | Free tier + discount |
| Evals | Braintrust, PromptLayer, LangSmith | Extended trial |
| Vector DB | Pinecone, Weaviate, Qdrant, Neon PGVector | Free hosting tier |
| Automation | n8n Cloud, Make, Zapier | Pro trial |

**Deliverable:** `#🛠-tool-reviews` becomes high-value channel — "This week: Langfuse vs Helicone for agent tracing"

### Week 8: First Cohort Launch + Retention Systems

**Cohort 1 Kickoff:**
- 20 students, 4 weeks, 2hr live/week (recorded)
- Private GitHub org with starter repos
- Dedicated Discord channel + weekly office hours
- Final project: "Ship a production AI feature" → demo day

**Retention Systems:**
- [ ] **Weekly Wins Email** (automated: "Your metrics this week: X tokens, $Y, Z% uptime")
- [ ] **Monthly Member Spotlight** (interview → YouTube + Newsletter + Case Study)
- [ ] **Churn Alert** (PostHog: no login 14 days → automated Discord DM + email)
- [ ] **Upgrade Path** (Pro → Elite at renewal: "You've used 80% of Pro features...")

---

## Phase 3: Flywheel Optimization (Weeks 9-12)

### Week 9: Content Compounding (SEO + Evergreen)

**Transform top performers into evergreen assets:**

| Source | Transformation | Distribution |
|--------|----------------|--------------|
| "Production RAG" video | **Comprehensive Guide** (10k words, interactive) | `/guides/production-rag` + SEO |
| "Agent Observability" workflow | **Template Library** (5 variants: Next.js, Python, Go) | GitHub org + npm package |
| Cohort 1 Q&A | **FAQ Database** (searchable, tagged) | Community + Public SEO pages |
| Member case studies | **Case Study Library** (filterable by stack, scale) | `/case-studies` + Newsletter |

**SEO Targets (6-month):**
- "Production RAG architecture" — #1-3
- "AI agent observability OpenTelemetry" — #1-3
- "Eval driven development LLM" — #1-5
- "Multi-tenant RAG SaaS" — #1-5

### Week 10: Community-Led Growth

**Member-Generated Content Program:**

| Program | Incentive | Output |
|---------|-----------|--------|
| **Workflow of the Month** | $500 + lifetime Elite + feature in newsletter | 1 polished workflow/month |
| **Case Study Submission** | $200 + 3 months free | 2-4 case studies/month |
| **Office Hours Host** (senior members) | Revenue share (10% of Pro) | Scales live sessions |
| **Tool Reviewer** | Free tool access + affiliate | Weekly tool reviews |

**Goal:** 30% of content from community by Week 12

### Week 11: Course Iteration + High-Ticket Funnel

**Cohort 2 Improvements:**
- Price: $497 (validated)
- Add: **1:1 code review** (2x per student)
- Add: **Job board access** (partner companies hiring AI engineers)
- Add: **Alumni network** (private channel, quarterly reunions)

**High-Ticket Offer ($5k-25k):**
- **"Production AI Audit"** — 2-week engagement: architecture review, eval setup, cost optimization, team training
- **Target:** Series A-B companies shipping AI features
- **Delivery:** You (founder) + 1 senior contractor
- **Funnel:** Course alumni → Case study → Audit inquiry → Close

### Week 12: Metrics Review + Next Quarter Planning

**North Star Metrics Dashboard (Admin):**

| Metric | Target (Week 12) | Target (Month 6) |
|--------|------------------|------------------|
| **Newsletter Subscribers** | 2,500 | 15,000 |
| **Open Rate** | >45% | >50% |
| **YouTube Subscribers** | 1,000 | 10,000 |
| **Discord Members** | 300 | 2,000 |
| **Paid Members (Pro)** | 80 | 500 |
| **Paid Members (Elite)** | 15 | 100 |
| **Course Revenue** | $8,000 (Cohort 1) | $50k/cohort |
| **MRR** | $3,500 | $25,000 |
| **Churn (monthly)** | <8% | <5% |
| **LTV** | $150 | $500 |

**Quarter 2 Preview:**
- Cohort 3 + 4 (monthly rhythm)
- Second course: "Advanced Agent Orchestration" (LangGraph, CrewAI, AutoGen)
- Enterprise tier: Team licenses, SSO, private deployment
- Hire: Content editor, Community manager, Course TA

---

## Content Type Expansion (Database Schema)

Add to `src/db/schema.ts`:

```typescript
// Extend content table
contentType: text("content_type").notNull().default("guide"), // guide | playbook | template | code | workshop | audio | video | workflow | notebook | case-study
contentFormat: text("content_format").notNull().default("markdown"), // markdown | html | n8n-json | notebook | video
githubUrl: text("github_url"),
n8nWorkflowJson: jsonb("n8n_workflow_json"),
demoVideoUrl: text("demo_video_url"),
estimatedTimeMinutes: integer("estimated_time_minutes"),
difficulty: text("difficulty").notNull().default("intermediate"), // beginner | intermediate | advanced
tags: text("tags").array(), // ["rag", "observability", "evals", "agents"]
isInteractive: boolean("is_interactive").default(false),
```

**Admin Form Updates:**
- ContentForm: Add type selector, GitHub URL, n8n JSON upload, video URL, time estimate, difficulty, tags
- ContentTable: Filter by type, difficulty, tags
- API: Return new fields for frontend rendering

---

## Technical Implementation Checklist

### Week 1-2 (Foundation)
- [ ] Add PayPal sandbox credentials → test full checkout → webhook → subscription creation
- [ ] Integrate Beehiiv API → `/api/subscribe` creates contact + adds to sequence
- [ ] Create Discord server + bot (Dyno/MEE6 for roles) + webhook for announcements
- [ ] Set up Mux/Stream for gated video hosting (or Vimeo Pro)
- [ ] Configure PostHog → track: signup, subscription, content_view, workflow_download, course_enroll

### Week 3-4 (Launch)
- [ ] Build "Founding Member" role automation: PayPal webhook → Clerk metadata → Discord role
- [ ] Create course landing page + Stripe/PayPal checkout for $397 pre-sell
- [ ] Record + edit 4 YouTube videos (batch)
- [ ] Design Notion templates for lead magnets (export to PDF)

### Week 5-8 (Scale)
- [ ] Build n8n automation workflows (YouTube → Shorts, Video → Newsletter, etc.)
- [ ] Add content performance analytics to admin dashboard
- [ ] Negotiate 3-5 tool partnerships with affiliate terms
- [ ] Launch Cohort 1 → collect feedback → iterate

### Week 9-12 (Optimize)
- [ ] Publish 3 SEO-optimized long-form guides (10k+ words each)
- [ ] Launch member-generated content program
- [ ] Build high-ticket audit service page + intake form
- [ ] Hire first contractor (content editor) + community manager (part-time)

---

## Budget & Resource Plan

| Item | Month 1 | Month 2 | Month 3 | Notes |
|------|---------|---------|---------|-------|
| **Tools (Beehiiv, Mux, PostHog, n8n Cloud)** | $150 | $200 | $300 | Scales with usage |
| **Video Editor (contract)** | $500 | $800 | $1,200 | 4 videos/mo → 8 videos/mo |
| **Community Manager (part-time)** | $0 | $800 | $1,500 | 10 hrs/wk → 20 hrs/wk |
| **Affiliate Payouts** | $0 | $200 | $800 | Net positive |
| **Course Platform (self-hosted)** | $0 | $0 | $0 | Existing infra |
| **Ads (retargeting)** | $0 | $500 | $1,000 | After product-market fit |
| **Total Monthly** | ~$650 | ~$2,500 | ~$4,800 | Break-even ~Month 2 |

**Revenue Projection (Conservative):**
- Month 1: $1,500 (15 Founding Pro + 3 Elite + 5 Course pre-sells)
- Month 2: $4,000 (40 Pro + 10 Elite + Cohort 1)
- Month 3: $8,500 (80 Pro + 15 Elite + Cohort 2 + 1 Audit)
- Month 6: $25,000+ (500 Pro + 100 Elite + Monthly cohorts)

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| PayPal webhook failures | Medium | High | Test thoroughly in sandbox; add manual reconciliation UI in admin |
| Low course completion | Medium | Medium | Accountability pods, weekly deliverables, certificate requires demo |
| Content burnout | High | High | Batch record, hire editor, community-generated content by Month 3 |
| Discord spam/low quality | Medium | Medium | Strict onboarding, slow mode, active moderation, member vetting |
| Churn after founding price | Medium | High | Grandfather forever, add continuous value (new workflows weekly) |
| Technical debt (custom course) | Low | Medium | Keep simple: Next.js + Clerk gating + Discord; migrate to Maven only if >5 cohorts |

---

## Success Criteria (Week 12 Review)

**Must Hit:**
- [ ] 500+ newsletter subscribers (45%+ open rate)
- [ ] 500+ YouTube subscribers
- [ ] 100+ Discord members (30%+ weekly active)
- [ ] 50+ paying members ($2,500+ MRR)
- [ ] 1 cohort completed (80%+ completion rate, 4.5+/5 NPS)
- [ ] 3 evergreen guides ranking top 10 for target keywords
- [ ] 3 tool partnerships active with member discounts

**Stretch:**
- [ ] $5,000 MRR
- [ ] 1 high-ticket audit closed ($5k+)
- [ ] 10%+ content from community
- [ ] Featured in 2+ external newsletters/podcasts

---

## Next Immediate Actions (Today)

1. **Add PayPal sandbox credentials** to `.env.local` → test checkout flow
2. **Create Beehiiv account** → get API key → wire `/api/subscribe`
3. **Create Discord server** → configure channels + roles + welcome flow
4. **Record flagship RAG workflow video** (raw, 20 min) → upload to YouTube (unlisted)
5. **Build lead magnet PDF** in Notion → export → add to EmailCapture
6. **Add `workflow` content type** to schema + admin → seed flagship workflow
7. **Announce founding member launch** to existing waitlist (if any) + Twitter/LinkedIn

---

*This roadmap is a living document. Update weekly based on metrics. The flywheel compounds — every piece of content feeds the next.*