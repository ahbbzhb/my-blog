export async function generateSummary(content: string) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "summarize", content }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let msg = "Failed to generate summary";
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error) msg = errJson.error;
    } catch {}
    throw new Error(msg);
  }

  const result = await response.json();
  return result.data;
}

export async function generateTitle(content: string) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "title", content }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let msg = "Failed to generate title";
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error) msg = errJson.error;
    } catch {}
    throw new Error(msg);
  }

  const result = await response.json();
  return result.data;
}
