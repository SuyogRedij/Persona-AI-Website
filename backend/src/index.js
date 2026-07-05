import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';

if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set. Create a .env file from .env.example');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/chat', chatRouter);

// Export for Vercel (serverless). Only bind a port when running locally.
export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Persona AI backend running on http://localhost:${PORT}`);
  });
}
