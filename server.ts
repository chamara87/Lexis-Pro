import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client
  let ai: GoogleGenAI | null = null;
  const initGemini = () => {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      ai = new GoogleGenAI({
        apiKey: apiKey || "",
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  };

  // API endpoint for text copy editor and analysis
  app.post("/api/analyze", async (req, res) => {
    const { text, customInstructions } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Input text is required" });
    }

    try {
      const client = initGemini();
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "Gemini API key is missing. Please save it in the Secrets panel in Settings." 
        });
      }

      const prompt = `You are an expert English copy editor, master linguist, and senior corporate communications specialist.

Analyze the user's input text below for structural flow, tone, and grammar. Correct any objective spelling or grammatical issues, and then construct three distinct rewritten versions targeting different realistic human communication scenarios.

CRITICAL 'AI-PROOFING' & HUMANIZATION RULES:
- Eliminate sterile, robotic, or stereotypical "AI writing" markers. Absolutely forbid words like "delve", "synergy", "moreover", "furthermore", "testament", "leverage", "utilize", "robust", "demystify", or generic starting clichés like "I hope this email finds you well" unless explicitly requested.
- Ensure all outputs sound like they were drafted by an articulate, warm, and real human being with native-level intuition.
- Maintain the original core intention and any critical facts. If custom instructions are provided, prioritize them.

The Three Variations to Generate:
1. **Professional Humanized Business**: Formal, authoritative, polite, and highly precise. Sounds like a sharp, elite C-suite executive or senior director. Avoid stiff, dry, archaic boilerplate; use modern, clean, high-impact business terminology.
2. **Average Humanized English**: Polite, standard, and universally understood. Sounds like a friendly, clear communication to everyday colleagues or clients. Clear and crisp without feeling stuffy or overly formal.
3. **All Natural Normal Humanized English**: Casual, conversational, and completely fluid. Sounds exactly like a close teammate or native-speaker friend chatting over Slack, Teams, or iMessage. Must use natural contractions (e.g., "don't", "we're", "it's"), idioms, relaxed sentence structure, and immediate, clean delivery.

Input text: "${text.replace(/"/g, '\\"')}"
${customInstructions ? `Additional style instructions/constraints: "${customInstructions.replace(/"/g, '\\"')}"` : ""}

Return a structured JSON output with details of grammar lessons and the three rewritten variations exactly matching the defined schema.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite professional human editor and master native strategist. Ensure none of the outputs sound generated or sterile. For grammar lessons, if the input is grammatically flawless, return [] for grammarLessons.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              grammarLessons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    originalPhrase: { type: Type.STRING, description: "The incorrect, clunky, or awkward phrase from the original draft" },
                    correctedPhrase: { type: Type.STRING, description: "The natural, polished correction of that individual phrase" },
                    explanation: { type: Type.STRING, description: "Clear, helpful, non-jargony explanation of why it was changed" }
                  },
                  required: ["originalPhrase", "correctedPhrase", "explanation"]
                },
              },
              correctedTextOnly: { type: Type.STRING, description: "A grammatically perfect version of the input, keeping the original's tone and structure but fixing spelling/grammar mistakes." },
              professionalBusiness: { type: Type.STRING, description: "Polished, elegant, high-impact corporate version tailored for emails to leaders or clients. Clear, polite, and authoritative." },
              averageEnglish: { type: Type.STRING, description: "Clear, standard, friendly, and plainspoken workplace email or peer-to-peer communication." },
              naturalCasual: { type: Type.STRING, description: "Relaxed, ultra-natural casual text using everyday contractions, idioms, and native rhythms suitable for direct messaging channels like Slack or iMessage." }
            },
            required: ["grammarLessons", "correctedTextOnly", "professionalBusiness", "averageEnglish", "naturalCasual"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text received from Gemini API");
      }

      const result = JSON.parse(responseText.trim());
      return res.json(result);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return res.status(500).json({ error: error.message || "An error occurred during communication processing." });
    }
  });

  // Serve static assets OR use Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
