import { Action } from "actionhero";
import { GoogleGenAI } from "@google/genai";


export class GeminiAI extends Action {
  constructor() {
    super();
    this.name = "geminiAI";
    this.description = "Call Gemini API to generate AI content using @google/genai SDK";
    this.inputs = {
      prompt: { required: true },
    };
  }

  async run({ params, response }) {
    const prompt = params.prompt;

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      // Set the response for ActionHero
      response.content = geminiResponse.text;
      return response;

    } catch (error) {
      console.error("Gemini AI Error:", error);
      response.error = error.message || "Something went wrong while calling Gemini AI.";
      return response;
    }
  }
}