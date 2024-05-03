import { ChatModel, createOpenAIClient, Msg } from '@dexaai/dexter';
import { EnvVars } from './env-vars';
import type { SearchResult } from './serpapi';
import type { QdrantResult } from './vectordb';

/**
 * Use this to make requests to the OpenAI API.
 * Docs: https://github.com/dexaai/dexter
 */

/** Client for making requests to the OpenAI API. */
const openaiClient = createOpenAIClient({ apiKey: EnvVars.openAI() });

/** Use ChatModel to make requests to the chat completion endpoint. */
const chatModel = new ChatModel({
  client: openaiClient,
  debug: true,
  params: {
    model: 'gpt-3.5-turbo-1106',
  },
});



/** Summarize Google search results using the OpenAI API. */
export async function summarizeSearchResults({
  query, googleSearchResults, qdrantSearchResults
}: {
  query: string;
  googleSearchResults: SearchResult;
  qdrantSearchResults: QdrantResult[]
}): Promise<string> {

  const systemPrompt = Msg.system(`
You're a intelligent assistant who is helping a user find information. 
Your task is to write helpful summaries of the user's google AND qdrant search queries.
To do this, the user will provide you with their google search query and a list of google search results (from the query).
For each response, please summarize the search results, and include citations. 
When including citations, please respond with the list index of the google search results in the format [location:sourceNumber]. 
You can cite multiple sources per line of your response.
Please add citations within your messages immediately following the content that needs a citation.
Do not include the source url/links in your answers, only include the index of the source like [google:x] or [qdrant:x].
Don't include a citations section. I will include it separately.

Good luck!
`)

  const userMsg = Msg.user(`
Here is my query:
${query}

Here are the top google search results:
${googleSearchResults.organic_results.slice(0,5).map((or, i) => {
  return `Google ${i + 1}. ${i}\n${JSON.stringify(or)}`
})}

Here are the top qdrant search results:
${qdrantSearchResults.map((or, i) => {
  return `Qdrant ${i + 1}. ${i}\n${or.text}}`
})}

`)


  const res = await chatModel.run(
    {
      messages: [systemPrompt, userMsg],
    }
  )

  return res.choices[0].message.content || "";
}
