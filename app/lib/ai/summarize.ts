import { openai } from "./client";
import { prompts } from "./prompts";

const MAX_INPUT_CHARS = 6000;

export async function summarize(content: string): Promise<string> {
  const input = content.length > MAX_INPUT_CHARS
    ? content.slice(0, MAX_INPUT_CHARS) + "..."
    : content;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 300,
      messages: [
        { role: "system", content: prompts.summarize },
        { role: "user", content: input },
      ],
    });
    return res.choices[0]?.message?.content ?? "";
  } catch (error) {
    console.error("AI Summarize failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate summary"
    );
  }
}