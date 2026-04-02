import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();
const port = 3000;

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to simulate Vercel response object
const mockRes = (res) => ({
  status: (code) => {
    res.status(code);
    return mockRes(res);
  },
  json: (data) => res.json(data),
  setHeader: (name, value) => res.setHeader(name, value),
  send: (data) => res.send(data),
});

// Middleware to map /api/* to api/*.js functions
app.all('/api/:functionName', async (req, res) => {
  const { functionName } = req.params;
  const filePath = path.join(__dirname, 'api', `${functionName}.js`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `Function ${functionName} not found` });
  }

  try {
    // Dynamic import of the serverless function
    // We use a query param to cache-bust in dev if needed
    const module = await import(`./api/${functionName}.js?update=${Date.now()}`);
    const handler = module.default;

    if (typeof handler !== 'function') {
      return res.status(500).json({ error: `Export default is not a function in ${functionName}.js` });
    }

    console.log(`[API] Executing ${functionName}...`);
    await handler(req, mockRes(res));
  } catch (error) {
    console.error(`[API Error] ${functionName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`\x1b[32m%s\x1b[0m`, `⚡️ API local server running on http://localhost:${port}`);
  console.log(`[API] Routes available:`);
  fs.readdirSync(path.join(__dirname, 'api')).forEach(file => {
    if (file.endsWith('.js')) {
      console.log(`  ➜  /api/${file.replace('.js', '')}`);
    }
  });
});
