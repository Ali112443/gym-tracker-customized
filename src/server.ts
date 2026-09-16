import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function loadLocalEnv() {
  try {
    for (const line of readFileSync(join(process.cwd(), '.env'), 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
    }
  } catch {
    // Production deployments should provide environment variables directly.
  }
}

loadLocalEnv();

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json({ limit: '20kb' }));

app.post('/api/fitness-assistant', async (req, res) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  const context = typeof req.body?.context === 'string' ? req.body.context.trim() : '';
  if (!question || question.length > 1000) {
    res.status(400).json({ error: 'Please send a question up to 1000 characters.' });
    return;
  }
  if (!process.env['GEMINI_API_KEY']) {
    res.status(503).json({ error: 'AI assistant is not configured yet. Add GEMINI_API_KEY on the server to enable it.' });
    return;
  }
  try {
    const model = process.env['GEMINI_MODEL'] || 'gemini-flash-latest';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env['GEMINI_API_KEY'] },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You are Gym Tracker AI, a friendly fitness and nutrition assistant. Use the provided user context when available. Give practical, concise answers. Do not diagnose conditions or give unsafe medical advice. For meal plans, include approximate calories and macros. For workout plans, include a warm-up reminder and recovery guidance.' }] },
        contents: [{ parts: [{ text: `User context: ${context || 'No calculator data yet.'}\n\nUser question: ${question}` }] }],
        generationConfig: { maxOutputTokens: 700 },
      }),
    });
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
    const answer = data.candidates?.[0]?.content?.parts?.map(part => part.text ?? '').join('').trim();
    if (!response.ok || !answer) {
      res.status(response.status || 500).json({ error: data.error?.message || 'The AI assistant could not answer right now.' });
      return;
    }
    res.json({ answer });
  } catch {
    res.status(502).json({ error: 'Could not reach the AI service. Please try again.' });
  }
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
