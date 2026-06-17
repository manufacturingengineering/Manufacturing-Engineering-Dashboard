import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable custom CORS support for static site distribution (e.g. GitHub Pages)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("Warning: GEMINI_API_KEY environment variable is not defined.");
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// POST /api/gemini/quiz -> Generate a structured quiz from an input paragraph
app.post("/api/gemini/quiz", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      success: false,
      error: "Gemini client is not initialized. Please ensure GEMINI_API_KEY is configured."
    });
  }

  const { paragraph, category, questionCount } = req.body;
  if (!paragraph || typeof paragraph !== "string" || paragraph.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "A valid non-empty 'paragraph' string is required to generate a quiz."
    });
  }

  const count = typeof questionCount === "number" && questionCount > 0 ? questionCount : 10;

  try {
    const prompt = `Generate a high-quality quiz based on this text:\n\n"${paragraph}"\n\n${
      category ? `The category is specified as "${category}". Please align the quiz around this topic.` : ""
    }
    Generate exactly ${count} multiple-choice questions. Each question must have exactly 4 choices, with exactly one single correct option that is verbatim or factually matching one of the options inside the choices array. Write a detailed, friendly explanation for the answer. Each question must be worth exactly 1 mark (total ${count} marks).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert educator. You generate highly accurate quizzes with unambiguous multiple-choice questions from user text. Always focus on key concepts. Provide a beautiful title based on the paragraph and select a proper matching category (e.g., Science, Nature, Technology, History, Literature, General, Space, Geography). Ensure answers are accurate.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A catchy educational title for the quiz" },
            category: { type: Type.STRING, description: "A relevant matching topic category like 'Science', 'History', 'Technology', 'General', or similar" },
            questions: {
              type: Type.ARRAY,
              description: `Array of exactly ${count} multiple choice questions`,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "The quiz question itself" },
                  choices: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "An array of 4 distinct choices"
                  },
                  correctAnswer: { type: Type.STRING, description: "The correct choice. Must match exactly one of the items inside choice array." },
                  explanation: { type: Type.STRING, description: "Detailed explanation of why the choice is correct" },
                  points: { type: Type.INTEGER, description: "Points awarded for this question (must be exactly 1)" }
                },
                required: ["text", "choices", "correctAnswer", "explanation", "points"]
              }
            }
          },
          required: ["title", "category", "questions"]
        }
      }
    });

    const jsonText = response.text?.trim() || "";
    if (!jsonText) {
      throw new Error("No response content received from Gemini model.");
    }

    const quizData = JSON.parse(jsonText);
    
    // Inject unique client-side IDs for the questions and generate an ID for the quiz
    const quizId = "quiz-" + Date.now();
    const questionsWithIds = quizData.questions.map((q: any, idx: number) => ({
      ...q,
      points: 1, // Enforce exactly 1 mark per question
      id: `q-${idx}-${Date.now()}`
    }));

    const finalQuiz = {
      id: quizId,
      title: quizData.title || "Topic Mastery Quiz",
      paragraph: paragraph,
      category: quizData.category || category || "General",
      questions: questionsWithIds,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      quiz: finalQuiz
    });

  } catch (error: any) {
    console.error("Quiz Generation Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An unexpected error occurred during quiz generation."
    });
  }
});

// POST /api/gemini/chat -> Voice command and conversational chat parser
app.post("/api/gemini/chat", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      success: false,
      error: "Gemini client is not initialized. Please ensure GEMINI_API_KEY is configured."
    });
  }

  const { messages, currentParagraph } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      success: false,
      error: "A valid 'messages' array is required in the body."
    });
  }

  try {
    // Format past messages as instruction contexts
    const formattedHistory = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    // System instruction explaining voice Commands and chat behavior
    const systemInstruction = 
      "You are 'Siri', an intelligent and highly interactive Voice-Activated Quiz Robot. " +
      "You help users learn by chatting with them, listening to their voice/text commands, and auto-generating quizzes from texts. " +
      "Keep responses succinct, friendly, conversational, and energetic. " +
      "If the user asks you to start, make, or generate a quiz inside their conversation, invite them to paste/enter a paragraph on the sidebar, or they can ask you to explain a concept first. " +
      (currentParagraph ? `There is a current active study paragraph loaded: "${currentParagraph}". If they ask questions about it, reply based on this contexts.` : "") +
      "Respond in Markdown. When speaking (via text-to-speech accessibility), the system reads your response, so ensure lists are short and pronunciations are natural.";

    const lastMessage = formattedHistory[formattedHistory.length - 1]?.parts[0]?.text || "Hello";

    // Call chat model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    const replyText = response.text || "I'm listening, what can I do for you?";

    res.json({
      success: true,
      reply: replyText
    });

  } catch (error: any) {
    console.error("Chat Robot Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An unexpected error occurred in your conversation."
    });
  }
});

// -------------------------------------------------------------
// Vite Server Integration & Production Static Serving
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode with Vite Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    // Production Mode serving compiled static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static assets from dist folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Voice Command Quiz Robot server listening on http://localhost:${PORT}`);
  });
}

startServer();
