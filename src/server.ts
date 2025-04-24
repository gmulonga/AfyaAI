import dotenv from "dotenv";
import { Process } from "actionhero";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swaggerSpec";

dotenv.config();

const app = new Process();

async function start() {
  try {
    await app.start();
    console.log("ActionHero server started successfully");

    const swaggerApp = express();

    swaggerApp.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    swaggerApp.get("/api-docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    const SWAGGER_PORT = process.env.SWAGGER_PORT || 3001;
    swaggerApp.listen(SWAGGER_PORT, () => {
      console.log(`Swagger docs available at http://localhost:${SWAGGER_PORT}/api-docs`);
      console.log(`Swagger JSON available at http://localhost:${SWAGGER_PORT}/api-docs.json`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

start();