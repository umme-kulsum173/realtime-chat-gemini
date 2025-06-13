import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAT = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

const model = genAT.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const generateResult = async (prompt) => {
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rawText = await result.response.text();

    // Remove markdown if any
    const cleaned = rawText
      .replace(/^```json/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (parsed?.text) return parsed.text; // ✅ only return text string
    } catch {
      // Not JSON - return as-is
    }

    return cleaned; // ✅ plain string
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
