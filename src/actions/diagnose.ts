import { Action } from "actionhero";
import { GoogleGenAI } from "@google/genai";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import UserModel from "../models/userModel";

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export class GeminiAI extends Action {
  constructor() {
    super();
    this.name = "geminiAI";
    this.description = "Generate a medical response using Gemini AI based on user data";
    this.inputs = {
      prompt: { required: true },
    };
  }

  async run({ connection, params, response }) {
    try {
      // 1. Verify token
      const authHeader = connection.rawConnection.req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        response.statusCode = 401;
        throw new Error('Unauthorized: Bearer token missing');
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token is valid. User data:", decoded);

      // Get user info from DB
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        response.statusCode = 404;
        throw new Error("User not found");
      }

      const { age, gender, allergies, existing_conditions } = user;

      // Enhancing the prompt
      const userPrompt = params.prompt;
      const enhancedPrompt = `
        A ${age}-year-old ${gender} says: "${userPrompt}".
        Known allergies: ${allergies.length ? allergies.join(", ") : "none"}.
        Existing medical conditions: ${existing_conditions.length ? existing_conditions.join(", ") : "none"}.

        Based on this, provide:
        - A short response in less than 50 words, medical advice, and a diagnosis if possible.
        - Possible dieseases one is sufuering from
        - Food or natural remedies if any
        - Steps to follow at home
        - Indicate if the user should **visit a clinic** — but only if symptoms are severe, persistent, or potentially serious.

        Format the response as JSON like this:
        {
          "shortAnswer": "...",
          "Possible diseases": ["..."],
          "steps": ["..."],
          "foodRemedies": ["..."],
          "visitClinic": true or false
        }
      `.trim();

      // Make gemini call
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: enhancedPrompt,
      });

      let rawContent = geminiResponse.text;

      // Remove ```json and ``` if present
      rawContent = rawContent.replace(/```json|```/g, '').trim();

      let parsedContent;
      try {
        parsedContent = JSON.parse(rawContent);
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError);
        response.statusCode = 500;
        response.error = "Failed to parse AI response as JSON.";
        return response;
      }

      response._toRender = false;
      connection.rawConnection.responseHttpCode = 200;
      connection.rawConnection.responseHeaders = {
        "Content-Type": "application/json",
      };
      connection.rawConnection.res.end(JSON.stringify(parsedContent));
      return;

    } catch (error) {
      console.error("Gemini AI Error:", error);
      response.statusCode = error.name === 'JsonWebTokenError' ? 401 : 500;
      response.error = error.message || "Something went wrong while calling Gemini AI.";
      return response;
    }
  }
}
