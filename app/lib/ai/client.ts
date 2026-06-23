import OpenAI from "openai";

function createClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing OPENAI_API_KEY environment variable. Add it to your .env file."
    );
  }
  return new OpenAI({ apiKey });
}

export const openai = createClient();