// EnvVars.qdrant()


/**
 * 
 * database with content + embeddings
 * 
 * search it, integrate into our search app? 
 * 
 * 
 * query 
 * -> search against set of embeddings 
 * -> list of embeddings with score 
 * -> return top k 
 * -> generate a ai answer using documents we find
 * 
 * 
 */

import { QdrantClient } from "@qdrant/js-client-rest";
import { EnvVars } from "./env-vars";
import { EmbeddingModel, createOpenAIClient } from '@dexaai/dexter';

const host = EnvVars.qdrant().host
const key = EnvVars.qdrant().key
const COLLECTION = 'mirage'
const client = new QdrantClient({ 
    apiKey: key,
    host
});

const openaiClient = createOpenAIClient({ apiKey: EnvVars.openAI() });


const embeddingModel = new EmbeddingModel({
    client: openaiClient,
    params: {
        model: 'text-embedding-3-small'
    }
})

export type QdrantResult = {
    text: string
}

export const searchQdrant = async (q: string): Promise<QdrantResult[]> => {
    const inputEmbedding = await embeddingModel.run({
        input: [q],
    })

    const results = await client.search(COLLECTION, {
       vector: inputEmbedding.embeddings[0], 
       limit: 10, 
       with_payload: true
    })

    return results.map((r) => r.payload) as QdrantResult[]
}




