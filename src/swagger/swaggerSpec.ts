import swaggerJSDoc from "swagger-jsdoc";
import { version } from "../../package.json";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AfyaAI",
      version,
      description: "API for medical diagnosis using Gemini AI",
    },
    servers: [
      {
        url: "http://localhost:{port}",
        variables: {
          port: {
            default: "8000",
            description: "API server port",
          },
        },
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            age: { type: "number" },
            gender: { type: "string" },
            allergies: {
              type: "array",
              items: { type: "string" },
            },
            existing_conditions: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/actions/*.ts"],
});
