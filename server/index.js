import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { existsSync } from 'node:fs';
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const localMessageFile = fileURLToPath(new URL('./data/messages.jsonl', import.meta.url));
const clientBuildPath = fileURLToPath(new URL('../dist/', import.meta.url));

app.use(cors());
app.use(express.json());

const projectData = [
  { title: 'Campus Connect', category: 'Product design', description: 'A focused student community platform that turns campus events, clubs, and conversations into one calm workspace.', tags: ['React', 'Node.js', 'MongoDB'], accent: 'coral', year: '2025' },
  { title: 'Ledgerly', category: 'Fintech dashboard', description: 'A clear financial operations dashboard designed to help small teams understand cash flow at a glance.', tags: ['React', 'Express', 'Charts'], accent: 'blue', year: '2024' },
  { title: 'CarePath', category: 'Healthcare experience', description: 'A patient-first appointment flow that makes the next step obvious, from discovery to follow-up.', tags: ['UX', 'JavaScript', 'API'], accent: 'mint', year: '2024' },
];

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.get('/api/projects', (_request, response) => response.json(projectData));
app.post('/api/messages', async (request, response) => {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
  const email = typeof request.body?.email === 'string' ? request.body.email.trim() : '';
  const message = typeof request.body?.message === 'string' ? request.body.message.trim() : '';
  if (!name || !email || !message) return response.status(400).json({ error: 'Please complete every field.' });
  if (name.length > 100 || email.length > 254 || message.length > 5000 || !/^\S+@\S+\.\S+$/.test(email)) {
    return response.status(400).json({ error: 'Please check your details and try again.' });
  }

  try {
    const record = { name, email, message, createdAt: new Date() };
    if (process.env.MONGODB_URI) {
      await Message.create(record);
    } else {
      await mkdir(dirname(localMessageFile), { recursive: true });
      await appendFile(localMessageFile, `${JSON.stringify(record)}\n`, 'utf8');
    }
    return response.status(201).json({ message: 'Thanks, I will get back to you soon.' });
  } catch (error) {
    console.error('Unable to store contact message:', error.message);
    return response.status(500).json({ error: 'Unable to send your message right now.' });
  }
});

if (existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (request, response, next) => {
    if (request.path.startsWith('/api/')) return next();
    return response.sendFile(resolve(clientBuildPath, 'index.html'));
  });
}

app.listen(port, async () => {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
    }
  }
  console.log(`API running at http://localhost:${port}`);
});