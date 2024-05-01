import { getJson } from 'serpapi';
import { EnvVars } from './env-vars';

/**
 * Use this to get the Google search results for a query.
 * Docs: https://github.com/serpapi/serpapi-javascript
 */

// @TODO: Add a type for the search result.
export type SearchResult = {
  related_questions: {
    question: string
    snippet: string
    title: string
    link: string
  }[],
  related_searches: {
    query: string,
    link: string
  }[],
  organic_results: {
    title: string,
    link: string,
    thumbnail: string
    favicon: string
    snippet: string
  }[]
}

/** Search Google for the given query using the SerpApi service. */
export async function searchGoogle(query: string): Promise<SearchResult> {
  const json = await getJson({ engine: "google", api_key: EnvVars.serpapi(), q: query });
  return json as SearchResult
}
