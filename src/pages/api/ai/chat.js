import { createRateLimiter } from "@/lib/rateLimit";

const rateLimiter = createRateLimiter({ windowMs: 60000, max: 20 });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await rateLimiter(req, res);
    await handleRequest(req, res);
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }
  }
}

async function handleRequest(req, res) {
  try {
    const { message, context, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey || openaiApiKey.trim() === "") {
      return res.status(500).json({
        error: "OpenAI API key not configured",
        reply: "I'm sorry, the AI assistant is not configured. Please set up your OpenAI API key.",
      });
    }

    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

    // Build system prompt
    const systemPrompt = `You are a helpful AI assistant for a portfolio builder application. Your role is to:
1. Help users create and improve their professional portfolios
2. Provide guidance on what content to include
3. Suggest improvements to their portfolio sections
4. Answer questions about portfolio best practices
5. Help generate content when requested

Current portfolio context:
- Name: ${context?.name || "Not provided"}
- Profession: ${context?.profession || "Not provided"}
- Skills: ${context?.skills?.length || 0} skills listed
- Experience: ${context?.experience || 0} entries
- Education: ${context?.education || 0} entries
- Projects: ${context?.projects || 0} projects
- Has Bio: ${context?.hasBio ? "Yes" : "No"}
- Has Headline: ${context?.hasHeadline ? "Yes" : "No"}

When users ask to generate content, you can suggest they use the AI generation buttons. Be friendly, professional, and concise.`;

    // Build conversation messages
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error("No reply generated from OpenAI");
    }

    // Check if the reply suggests an action
    let suggestion = null;
    const replyLower = reply.toLowerCase();
    if (replyLower.includes("generate") && replyLower.includes("bio")) {
      suggestion = "generate_bio";
    } else if (replyLower.includes("generate") && replyLower.includes("headline")) {
      suggestion = "generate_headline";
    } else if (replyLower.includes("generate") && replyLower.includes("skill")) {
      suggestion = "generate_skills";
    } else if (replyLower.includes("generate") && replyLower.includes("responsibilit")) {
      suggestion = "generate_responsibilities";
    }

    return res.status(200).json({
      reply,
      suggestion,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({
      error: "Failed to generate response",
      reply: "I'm sorry, I encountered an error. Please try again later.",
      details: error.message,
    });
  }
}

