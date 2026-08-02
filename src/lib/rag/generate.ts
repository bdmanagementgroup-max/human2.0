import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function generateAnswer(
  query: string,
  context: Array<{ content: string; metadata: Record<string, any> }>
): Promise<string> {
  const contextText = context.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n');

  const prompt = `You are a precise answer engine. Use ONLY the provided context to answer the question.
If the context doesn't contain enough information, say "I don't have enough information to answer this."
Cite sources inline using [1], [2], etc.

Context:
${contextText}

Question: ${query}

Answer:`;

  const result = streamText({
    model: openai('gpt-4o'),
    prompt,
    temperature: 0.1,
    maxOutputTokens: 1000,
  });

  let fullText = '';
  for await (const chunk of result.textStream) {
    fullText += chunk;
  }
  return fullText;
}
