import { NextRequest, NextResponse } from 'next/server';
import { queryPipeline } from '@/src/lib/rag/pipeline';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, topK, filter, rerank } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: query (string)' },
        { status: 400 }
      );
    }

    const result = await queryPipeline({
      query,
      topK,
      filter,
      rerank
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('RAG Query Error:', error);
    return NextResponse.json(
      { error: 'Failed to query RAG pipeline', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}