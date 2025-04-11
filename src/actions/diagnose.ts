import { Action } from "actionhero";
import { GoogleGenAI } from "@google/genai";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export class GeminiAI extends Action {
  constructor() {
    super();
    this.name = "geminiAI";
    this.description = "Call Gemini API to generate AI content using @google/genai SDK";
    this.inputs = {
      prompt: { required: true },
    };
  }

  async run({ connection, params, response }) {
    const prompt = params.prompt;

    try {
      const authHeader = connection.rawConnection.req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        response.statusCode = 401;
        throw new Error('Unauthorized: Bearer token missing');
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token is valid. User data:", decoded);

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      response.content = geminiResponse.text;
      return response;

    } catch (error) {
      console.error("Gemini AI Error:", error);
      response.statusCode = error.name === 'JsonWebTokenError' ? 401 : 500;
      response.error = error.message || "Something went wrong while calling Gemini AI.";
      return response;
    }
  }
}
