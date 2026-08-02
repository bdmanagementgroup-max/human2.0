import { Metadata } from 'next';
import { Database } from 'lucide-react';
import { RAGChat } from '@/app/components/rag/RAGChat';

export const metadata: Metadata = {
  title: 'Production RAG Pipeline - human2.0',
  description: 'Interactive demo of the Production RAG Pipeline with n8n, Vercel AI SDK, Neon PGVector, and Cohere reranking',
};

export default function ProductionRAGPipelinePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
              Workflow Demo · Interactive
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Production RAG Pipeline
            </h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Hybrid search (vector + keyword) → Cohere reranking → GPT-4o generation with citation enforcement → Eval logging.
              Built with n8n, Vercel AI SDK, Neon PGVector, and OpenAI/Cohere embeddings.
            </p>
          </div>

          {/* Architecture Visual */}
          <div className="relative mb-16">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center p-4">
                  <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Ingest</h3>
                  <p className="text-zinc-400 text-sm">Webhook receives text → recursive chunking (1000/200) → dual embeddings (OpenAI + Cohere) → upsert to Neon PGVector</p>
                </div>
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-zinc-700 to-transparent md:w-0.5 md:h-8 md:mx-0 md:my-8 hidden md:block" />
                <div className="flex-1 text-center p-4 relative">
                  <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Query</h3>
                  <p className="text-zinc-400 text-sm">Embed query → vector search (cosine) → Cohere rerank top-5 → build cited prompt → GPT-4o streaming</p>
                </div>
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-zinc-700 to-transparent md:w-0.5 md:h-8 md:mx-0 md:my-8 hidden md:block" />
                <div className="flex-1 text-center p-4">
                  <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Eval & Log</h3>
                  <p className="text-zinc-400 text-sm">Citation check → faithfulness heuristic → log to Neon + PostHog → return structured response</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Live Demo</h2>
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </span>
                <span className="px-2 py-0.5 bg-zinc-800 rounded">Edge Ready</span>
                <span className="px-2 py-0.5 bg-zinc-800 rounded">Streaming</span>
              </div>
            </div>
            <div className="p-4 md:p-8 h-[600px]">
              <RAGChat />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Pipeline Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Database className="w-6 h-6" />}
              title="Hybrid Search"
              description="Combines vector similarity (cosine) with keyword matching via PGVector. Configurable similarity threshold and top-K."
              tags={['PGVector', 'IVFFlat Index', 'Metadata Filtering']}
            />
            <FeatureCard
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              title="Cohere Reranking"
              description="Rerank-english-v3.0 reorders initial vector results for precision. Top-N configurable (default 5). Dramatically improves answer quality."
              tags={['Rerank v3', 'Top-5 Default', 'Relevance Boost']}
            />
            <FeatureCard
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
              title="Citation Enforcement"
              description="Prompt requires inline citations [1], [2]. Post-generation eval checks citation presence and count. Failed citations flagged in UI."
              tags={['Inline Citations', 'Faithfulness Check', 'Source Attribution']}
            />
            <FeatureCard
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
              title="Eval Logging"
              description="Every query logs: question, answer, sources, similarity scores, citation metrics. Queryable in Neon for analytics and drift detection."
              tags={['Neon Logging', 'PostHog Ready', 'Drift Detection']}
            />
            <FeatureCard
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              title="Streaming Response"
              description="Vercel AI SDK streams tokens from GPT-4o. UI renders incrementally. Cancelable. Works on Edge and Node.js runtimes."
              tags={['AI SDK Stream', 'Edge Compatible', 'Cancellation']}
            />
            <FeatureCard
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
              title="n8n Portable"
              description="Same pipeline as importable n8n workflow. Webhook endpoints for ingest/query. Self-hosted or n8n Cloud. No vendor lock-in."
              tags={['n8n Workflow', 'Webhook API', 'Self-Hosted']}
            />
          </div>
        </div>
      </section>

      {/* Setup Instructions */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Quick Start</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <SetupCard
              title="1. Neon Database Setup"
              steps={[
                'Create Neon project at console.neon.tech',
                'Enable pgvector extension: `CREATE EXTENSION vector;`',
                'Run init SQL (included in workflow) to create documents + rag_logs tables',
                'Add DATABASE_URL to environment'
              ]}
            />
            <SetupCard
              title="2. API Keys Required"
              steps={[
                'OpenAI API key (text-embedding-3-large, gpt-4o)',
                'Cohere API key (embed-english-v3.0, rerank-english-v3.0)',
                'Add to n8n credentials or Vercel env vars'
              ]}
            />
            <SetupCard
              title="3. Deploy n8n Workflow"
              steps={[
                'Import production-rag-pipeline.json in n8n',
                'Configure OpenAI, Cohere, Postgres credentials',
                'Activate workflow → exposes /webhook/rag/ingest and /webhook/rag/query',
                'Test with curl or the demo UI above'
              ]}
            />
            <SetupCard
              title="4. Or Use Native API Routes"
              steps={[
                'Deploy to Vercel (Next.js 15 + App Router)',
                'Add DATABASE_URL, OPENAI_API_KEY, COHERE_API_KEY',
                'POST /api/rag/ingest { text, metadata }',
                'POST /api/rag/query { query, topK, rerank }'
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Get the Complete Workflow</h2>
          <p className="text-zinc-400 mb-8 text-lg">
            Download the n8n workflow JSON, full TypeScript implementation, and setup guide.
            Includes eval harness, monitoring dashboard, and production hardening checklist.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/workflows/production-rag-pipeline.json"
              download
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download n8n Workflow
            </a>
            <a
              href="https://github.com/human2-0/production-rag-pipeline"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 border border-zinc-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, tags }: { icon: React.ReactNode; title: string; description: string; tags: string[] }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
      <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 mb-4">
        {icon}
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function SetupCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-zinc-300 text-sm">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-medium flex items-center justify-center">
              {i + 1}
            </span>
            <span className="pt-1">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}