import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt with clear hint rules
const systemPrompt = `
You are a student helper AI that gives hints before solutions.

Follow these rules strictly:
- HintLevel 1 → Give a very small hint. (No formulas)
- HintLevel 2 → Give a stronger hint with formulas.
- HintLevel 3 → Give the solution steps, but NO final answer.
- HintLevel 4 → Give the full solution with final answer and explanation.

Never give full solutions unless HintLevel = 4.
Be simple, clear, and student-friendly.
`;

app.post("/ask", async (req, res) => {
  try {
    let { question, hintLevel } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    // Default hint level = 1
    if (!hintLevel) hintLevel = 1;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Question: ${question}\nHintLevel: ${hintLevel}`
        }
      ],
      max_tokens: 400
    });

    const responseText = completion.choices[0].message.content;

    res.json({
      ok: true,
      hintLevel,
      response: responseText
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
