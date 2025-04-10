import express from 'express';
import { createServer } from 'http';

const app = express();

const server = createServer(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    }
);
