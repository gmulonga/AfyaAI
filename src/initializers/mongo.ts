import { Initializer, api } from "actionhero";
import mongoose from "mongoose";

export class MongooseInitializer extends Initializer {
  constructor() {
    super();
    this.name = "mongoose";
  }

  async initialize() {
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://gadsonmulonga:vd15lsRu9k0KQ95l@cluster0.fmpeqvo.mongodb.net/afyaAI?retryWrites=true&w=majority&appName=Cluster0";

    try {
      await mongoose.connect(mongoURI);
      console.log("Connected to MongoDB", "info");
      // api.log("Connected to MongoDB", "info");
    } catch (error) {
      api.log("Failed to connect to MongoDB: " + error.message, "error");
    }
  }

  async stop() {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB", "info");
    // api.log("Disconnected from MongoDB", "info");
  }
}
