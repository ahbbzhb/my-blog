import { openai } from "./client";
import { prompts } from "./prompts";

const MAX_INPUT_CHARS = 6000;

export async function generateTitle(content: string): Promise<string> {
  const input = content.length > MAX_INPUT_CHARS
    ? content.slice(0, MAX_INPUT_CHARS) + "..."
    : content;

  try {
    const res = await openai.chat.completions.create({
      model: "glm-4.7-flash",
      temperature: 0.8,
      max_tokens: 200,
      messages: [
        { role: "system", content: prompts.title },
        { role: "user", content: input },
      ],
      // @ts-expect-error thinking 是智谱 API 扩展参数
      thinking: { type: "disabled" },
    });
    const msg = res.choices[0]?.message;
    return (msg as any)?.reasoning_content || msg?.content || "";
  } catch (error) {
    console.error("AI Title generation failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate title"
    );
  }
}
