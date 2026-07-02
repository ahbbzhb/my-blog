import { NextResponse } from "next/server";
import { summarize } from "../../lib/ai/summarize";
import { generateTitle } from "../../lib/ai/title";
import { generateSEO } from "../../lib/ai/seo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, content } = body;

    if (!action || !content) {
      return NextResponse.json(
        { success: false, error: "Missing action or content" },
        { status: 400 }
      );
    }

    let data: string;

    switch (action) {
      case "summarize":
        data = await summarize(content);
        break;

      case "title":
        data = await generateTitle(content);
        break;

      case "seo":
        data = await generateSEO(content);
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[Route] AI API Error:", msg, err);

    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
