import dotenv from "dotenv";
import { Process } from 'actionhero';


dotenv.config();

const app = new Process();

async function start() {
  try {
    await app.start();
    console.log('Server started successfully');
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

start();
