import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  // Log Gemini prompts endpoint
  app.post("/api/log-prompt", (req, res) => {
    const { prompt, systemInstruction } = req.body;
    try {
      const logDir = path.join(__dirname, "dev");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logPath = path.join(logDir, "prompts.md");
      const timestamp = new Date().toISOString();
      const entry = `\n## [${timestamp}]\n### System Instruction\n\`\`\`\n${systemInstruction || "None"}\n\`\`\`\n### Prompt\n\`\`\`\n${prompt}\n\`\`\`\n---\n`;
      fs.appendFileSync(logPath, entry, "utf-8");
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Proxy Gemini API to avoid client-side API key leaks
  app.post("/api/gemini", async (req, res) => {
    const { prompt, systemInstruction, model, apiKey } = req.body;
    const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
    if (!finalApiKey) {
      return res.status(400).json({ error: "Gemini API key is required. Configure it in the app Settings page." });
    }

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: finalApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: model || "gemini-3.8-flash",
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      // Synchronously log the prompt to dev/prompts.md
      const logDir = path.join(__dirname, "dev");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logPath = path.join(logDir, "prompts.md");
      const timestamp = new Date().toISOString();
      const entry = `\n## [${timestamp}]\n### Model: ${model || "gemini-3.8-flash"}\n### System Instruction\n\`\`\`\n${systemInstruction || "None"}\n\`\`\`\n### Prompt\n\`\`\`\n${prompt}\n\`\`\`\n### Response\n\`\`\`\n${response.text || "No response text"}\n\`\`\`\n---\n`;
      fs.appendFileSync(logPath, entry, "utf-8");

      res.json({ text: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Serve static pre-rendered ZIP or folder requests if any, otherwise standard Vite
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer();
