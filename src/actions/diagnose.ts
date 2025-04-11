// import { Action } from "actionhero";
// import { GoogleGenAI } from "@google/genai";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// export class GeminiAI extends Action {
//   constructor() {
//     super();
//     this.name = "geminiAI";
//     this.description = "Call Gemini API to generate AI content using @google/genai SDK";
//     this.inputs = {
//       prompt: { required: true },
//     };
//   }

//   async run({ connection, params, response }) {
//     const prompt = params.prompt;

//     try {
//       const authHeader = connection.rawConnection.req.headers['authorization'];
//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         response.statusCode = 401;
//         throw new Error('Unauthorized: Bearer token missing');
//       }

//       const token = authHeader.split(' ')[1];
//       const decoded = jwt.verify(token, JWT_SECRET);
//       console.log("Token is valid. User data:", decoded);

//       const ai = new GoogleGenAI({
//         apiKey: process.env.GEMINI_API_KEY,
//       });

//       const geminiResponse = await ai.models.generateContent({
//         model: "gemini-2.0-flash",
//         contents: prompt,
//       });

//       response.content = geminiResponse.text;
//       return response;

//     } catch (error) {
//       console.error("Gemini AI Error:", error);
//       response.statusCode = error.name === 'JsonWebTokenError' ? 401 : 500;
//       response.error = error.message || "Something went wrong while calling Gemini AI.";
//       return response;
//     }
//   }
// }


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
        - A short response in less than 50 words
        - Food or natural remedies if any
        - Steps to follow at home
        - Whether the user should visit a clinic

        Format the response as JSON like this:
        {
          "shortAnswer": "...",
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
