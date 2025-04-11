import { Process } from 'actionhero';

const app = new Process();


const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGO_URI;

main().catch((err) => console.log(err))

async function main() {
  await mongoose.connect("mongodb+srv://gadsonmulonga:vd15lsRu9k0KQ95l@cluster0.fmpeqvo.mongodb.net/afyaAI?retryWrites=true&w=majority&appName=Cluster0")
}


async function start() {
  try {
    await app.start();
    console.log('🚀 Server started successfully');
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

start();
