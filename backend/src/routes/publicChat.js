import { Router } from "express";
import { z } from "zod";
import { AppError, route } from "../helpers/utils.js";

const router = Router();
const recentRequests = new Map();

function localReply(message) {
  const question = message.toLowerCase();
  if (/^(hi|hello|hey|salam|assalam|aoa)\b/.test(question)) {
    return "Hi! I can help with Campus Coin. What would you like to know?";
  }
  if (/budget|income|expense|transaction|report|campus coin/.test(question)) {
    return "Campus Coin lets students record income first, add expenses within their available income, set date-based budgets, view reports, and get saving tips. Sign in and use the left menu to open the feature you need.";
  }
  if (/chicken.*pasta|pasta.*chicken/.test(question)) {
    return "For 2 people: boil 180–200 g pasta. Sauté 250 g bite-size chicken with salt, pepper and 1 tbsp oil until cooked. Add 2 minced garlic cloves, 1 chopped tomato or 1/2 cup tomato sauce, and a splash of pasta water. Stir in the pasta, add chilli flakes and herbs, then finish with cheese or 2 tbsp cream if you like.";
  }
  if (/biryani/.test(question)) {
    return "For a simple biryani, marinate chicken with yogurt, ginger-garlic, chilli, turmeric and biryani masala. Cook it with fried onion and tomato, separately boil basmati rice until about 70% done, then layer rice over the chicken with mint and coriander. Cover tightly and steam on low heat for 20–25 minutes.";
  }
  if (/recipe|cook|karahi|pasta|food/.test(question)) {
    return "Tell me the dish, servings, dietary needs and ingredients you have. I can then suggest a short ingredient list and step-by-step method. The full AI service is temporarily unavailable, so very specific substitutions may be limited.";
  }
  if (/cricket/.test(question)) {
    return "Cricket is played between two teams of 11. One team bats to score runs while the other bowls and fields to take wickets and limit runs. Formats mainly differ by length: T20 has 20 overs per side, ODI has 50, and Tests can last up to five days. I cannot verify live scores while the AI/search service is unavailable.";
  }
  if (/football|soccer/.test(question)) {
    return "Football has two teams of 11 trying to score in the opponent's goal. A standard match has two 45-minute halves; outfield players cannot deliberately handle the ball. The team with more goals wins. I cannot verify live fixtures or scores while the AI/search service is unavailable.";
  }
  if (/sport|match|score/.test(question)) {
    return "I can explain sports rules, positions and basic strategy. Live scores and current fixtures need an active AI/search provider, which is temporarily unavailable.";
  }
  if (/study|exam|assignment|homework|learn/.test(question)) {
    return "A useful study approach is: define one small outcome, work for 25–40 focused minutes, test yourself without notes, then review mistakes. If you share the subject and exact question, I can give more targeted help when the full AI service is available.";
  }
  if (/what is|who is|explain|meaning|define/.test(question)) {
    return "I can explain that, but the general AI provider is temporarily unavailable. Please try again after API credits are restored so I can give you an accurate, complete answer instead of guessing.";
  }
  return "The general AI service is temporarily unavailable because its API credits need renewal. Campus Coin help and a few built-in topics still work, but open-ended answers will return normally after credits are restored.";
}

router.post(
  "/public/chat",
  route(async (req, res) => {
    const { message, history } = z
      .object({
        message: z.string().trim().min(2).max(1000),
        history: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().trim().min(1).max(1000),
            }),
          )
          .max(10)
          .optional()
          .default([]),
      })
      .parse(req.body);
    const key = req.ip || "visitor";
    const now = Date.now();
    const recent = (recentRequests.get(key) || []).filter(
      (time) => now - time < 60_000,
    );
    if (recent.length >= 12) {
      throw new AppError(429, "Please wait a moment before asking again.");
    }
    recent.push(now);
    recentRequests.set(key, recent);

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: localReply(message),
        mode: "local",
        providerAvailable: false,
      });
    }

    let response;
    try {
      const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": process.env.GEMINI_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: "You are the friendly public Campus Coin website assistant. Answer questions about the website and general topics such as recipes, study, and sports. Be concise and useful. Do not claim access to private user financial data or live information unless it was provided. For medical, legal, or financial decisions, give cautious general information and recommend a qualified professional.",
                },
              ],
            },
            contents: [
              ...history.map((item) => ({
                role: item.role === "assistant" ? "model" : "user",
                parts: [{ text: item.content }],
              })),
              { role: "user", parts: [{ text: message }] },
            ],
            generationConfig: {
              maxOutputTokens: 450,
            },
          }),
          signal: AbortSignal.timeout(20_000),
        },
      );
    } catch {
      return res.json({
        reply: localReply(message),
        mode: "local",
        providerAvailable: false,
      });
    }
    if (!response.ok) {
      const failure = await response.json().catch(() => ({}));
      console.error(
        `Public chat provider error (${response.status}):`,
        failure?.error?.message || "Unknown Gemini API error",
      );
      return res.json({
        reply: localReply(message),
        mode: "local",
        providerAvailable: false,
      });
    }
    const data = await response.json();
    const reply = (data.candidates || [])
      .flatMap((candidate) => candidate.content?.parts || [])
      .map((part) => part.text || "")
      .join("\n")
      .trim();
    res.json({
      reply: reply || localReply(message),
      mode: reply ? "ai" : "local",
      providerAvailable: Boolean(reply),
    });
  }),
);

export default router;
