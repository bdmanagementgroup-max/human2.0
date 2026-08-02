'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Copy, Check, AlertTriangle, FileText, Database } from 'lucide-react';

interface Source {
  index: number;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

interface Eval {
  hasCitations: boolean;
  citationCount: number;
  sourceCount: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  eval?: Eval;
  timestamp: Date;
}

export function RAGChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<{ loading: boolean; message: string }>({ loading: false, message: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: 10, rerank: true })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Query failed');
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        eval: data.eval,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIngest = async () => {
    const sampleText = `Next.js 15 introduces the App Router with React Server Components as the default.
Server Components run on the server and send HTML to the client, reducing JavaScript bundle size.
The App Router uses a file-system based routing where folders define routes and page.tsx files define UI.
Layouts persist across route changes and can be nested. Loading.tsx and error.tsx provide built-in UX patterns.
Server Actions enable server-side mutations directly from components without API routes.
Middleware runs before requests and can modify responses, redirect, or rewrite.
The App Router supports streaming with Suspense and dynamic rendering with noStore.
Static generation is opt-in with generateStaticParams and dynamic = 'force-static'.
Edge runtime is available for specific routes that need global distribution.
Authentication can be integrated via middleware or Server Actions with cookies.`;

    setIngestStatus({ loading: true, message: 'Ingesting sample documentation...' });

    try {
      const response = await fetch('/api/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          metadata: { source: 'nextjs-docs', version: '15' },
          chunkSize: 1000,
          chunkOverlap: 200
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ingest failed');
      }

      setIngestStatus({ loading: false, message: `✅ Ingested ${data.chunksCreated} chunks` });
      setTimeout(() => setIngestStatus({ loading: false, message: '' }), 3000);
    } catch (error) {
      setIngestStatus({ loading: false, message: `❌ ${error instanceof Error ? error.message : 'Failed'}` });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold">Production RAG Pipeline</h3>
          <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
            n8n + Vercel AI SDK + Neon
          </span>
        </div>
        <button
          onClick={handleIngest}
          disabled={ingestStatus.loading}
          className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          Ingest Sample Docs
        </button>
      </div>

      {/* Ingest Status */}
      {ingestStatus.message && (
        <div className={`px-4 py-2 text-sm ${ingestStatus.loading ? 'text-yellow-400' : ingestStatus.message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
          {ingestStatus.message}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Database className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-center max-w-xs">
              Ask questions about your ingested documents. The pipeline uses hybrid search (vector + keyword),
              Cohere reranking, and GPT-4o generation with citation enforcement.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs text-zinc-600">
              <span className="px-2 py-1 bg-zinc-800 rounded">"How does App Router routing work?"</span>
              <span className="px-2 py-1 bg-zinc-800 rounded">"What are Server Actions?"</span>
              <span className="px-2 py-1 bg-zinc-800 rounded">"Explain streaming with Suspense"</span>
            </div>
          </div>
        )}

        {messages.map(message => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
              }`}
            >
              {message.role === 'user' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              ) : (
                <Database className="w-4 h-4" />
              )}
            </div>
            <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[85%] ${message.role === 'user' ? 'text-left' : ''}`}>
                <div className={`prose prose-invert prose-sm max-w-none ${message.role === 'user' ? 'text-right' : ''}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.sources && message.sources.length > 0 && (
                  <details className="mt-2 group">
                    <summary className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-300 cursor-pointer">
                      <FileText className="w-3 h-3" />
                      Sources ({message.sources.length})
                      {message.eval && (
                        <>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${message.eval.hasCitations ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {message.eval.hasCitations ? '✓ Cited' : '✗ No citations'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px]">
                            {message.eval.citationCount} citations
                          </span>
                        </>
                      )}
                    </summary>
                    <div className="mt-2 space-y-2 pl-5 border-l border-zinc-800">
                      {message.sources.map((source, i) => (
                        <div key={i} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-mono text-cyan-400">[{source.index}]</span>
                            <span className="text-xs text-zinc-500">similarity: {source.similarity?.toFixed(3)}</span>
                          </div>
                          <p className="text-sm text-zinc-300 line-clamp-3">{source.content}</p>
                          {Object.keys(source.metadata).length > 0 && (
                            <details className="mt-1">
                              <summary className="text-xs text-zinc-500 hover:text-zinc-400 cursor-pointer">Metadata</summary>
                              <pre className="mt-1 text-[10px] text-zinc-400 overflow-x-auto">{JSON.stringify(source.metadata, null, 2)}</pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className="text-[10px] text-zinc-600">{message.timestamp.toLocaleTimeString()}</span>
                <button
                  onClick={() => copyToClipboard(message.content)}
                  className="p-1 hover:bg-zinc-800 rounded transition-colors"
                  aria-label="Copy message"
                >
                  <Copy className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
            </div>
            <div className="flex-1">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask a question about your documents..."
            rows={1}
            className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-zinc-500 rounded-xl p-3 resize-none min-h-[44px] max-h-32"
            disabled={isLoading}
            aria-label="Ask a question"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center w-10 h-10 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 rounded-xl transition-colors"
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500 text-center">
          Powered by Neon PGVector + Cohere Rerank + GPT-4o + Vercel AI SDK
        </p>
      </form>
    </div>
  );
}