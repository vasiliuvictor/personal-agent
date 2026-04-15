import { GoogleGenerativeAI } from '@google/generative-ai';
import { BraveSearchResult } from '../types';

const genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY']!);

export async function generateInsight(query: string, results: BraveSearchResult[]): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  const formattedResults = results
    .map((r, i) => `[${i + 1}] Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.description}`)
    .join('\n\n');

  const prompt = `You are a research assistant. Based ONLY on the following search results, answer the user's query: "${query}".

Rules:
- Every factual claim must be followed by a citation in the format [Source Name](url)
- Be concise but comprehensive
- Use markdown formatting for readability
- If the search results do not contain enough information, say so clearly

Search Results:
${formattedResults}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
