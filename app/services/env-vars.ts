export class EnvVars {
  /** Get the SerpApi API key from the environment. */
  static serpapi(): string {
    const key = process.env.SERPAPI_API_KEY;
    if (!key) {
      throw new Error('Missing SERPAPI_KEY environment variable');
    }
    return key;
  }
  /** Get the OpenAI API key from the environment. */
  static openAI(): string {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }
    return key;
  }

  static qdrant(): {
    host: string, key: string}{
    const key = process.env.QDRANT_API_KEY;
    const host = process.env.QDRANT_HOST;
    if (!key ) {
      throw new Error('Missing QDRANT_API_KEY environment variable');
    }
    if (!host ) {
      throw new Error('Missing QDRANT_HOST environment variable');
    }
    return {
      host,
      key
    };
  }
}
