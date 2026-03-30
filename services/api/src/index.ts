import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { config } from './config.js';
import { connectMongo, checkMongo } from './db/mongo.js';
import {
  checkPostgres,
  createProject,
  deleteProject,
  ensurePostgresSchema,
  listProjects,
  pgPool,
  updateProject,
} from './db/postgres.js';
import { checkRedis, redis } from './db/redis.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

const createProjectSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(120),
  status: z.string().trim().min(1).max(40).optional(),
});

const updateProjectSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    status: z.string().trim().min(1).max(40).optional(),
  })
  .refine((value) => value.title !== undefined || value.status !== undefined, {
    message: 'at least one field is required',
  });

const projectIdSchema = z.coerce.number().int().positive();

const nexaQaSchema = z
  .object({
    question: z.string().trim().min(1).max(4000).optional(),
    messages: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant', 'system']),
          text: z.string().trim().min(1).max(4000),
        })
      )
      .optional(),
  })
  .refine((payload) => payload.question || (payload.messages && payload.messages.length > 0), {
    message: 'question or messages required',
  });

function extractOutputText(payload: any): string {
  const outputs = payload?.output;
  if (!Array.isArray(outputs)) return '';
  const chunks: string[] = [];
  for (const output of outputs) {
    const content = output?.content;
    if (!Array.isArray(content)) continue;
    for (const item of content) {
      if (item?.type === 'output_text' && typeof item.text === 'string') {
        chunks.push(item.text);
      }
    }
  }
  return chunks.join('\n').trim();
}

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'sparknexajx-api',
    environment: config.nodeEnv,
    time: new Date().toISOString(),
  });
});

app.get('/health/deps', async (_req, res) => {
  try {
    const [postgres, mongo, redisOk] = await Promise.all([checkPostgres(), checkMongo(), checkRedis()]);
    const statusCode = postgres && mongo && redisOk ? 200 : 503;
    res.status(statusCode).json({
      ok: statusCode === 200,
      deps: {
        postgres,
        mongo,
        redis: redisOk,
      },
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown dependency check error',
    });
  }
});

app.get('/api/projects', async (_req, res) => {
  try {
    const projects = await listProjects();
    res.status(200).json({ ok: true, data: projects });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to fetch projects',
    });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const payload = createProjectSchema.parse(req.body);
    const project = await createProject(payload);
    res.status(201).json({ ok: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        ok: false,
        error: error.issues.map((issue) => issue.message).join(', '),
      });
      return;
    }
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to create project',
    });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const id = projectIdSchema.parse(req.params.id);
    const payload = updateProjectSchema.parse(req.body);
    const project = await updateProject(id, payload);
    if (!project) {
      res.status(404).json({ ok: false, error: 'project not found' });
      return;
    }
    res.status(200).json({ ok: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        ok: false,
        error: error.issues.map((issue) => issue.message).join(', '),
      });
      return;
    }
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to update project',
    });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const id = projectIdSchema.parse(req.params.id);
    const deleted = await deleteProject(id);
    if (!deleted) {
      res.status(404).json({ ok: false, error: 'project not found' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        ok: false,
        error: error.issues.map((issue) => issue.message).join(', '),
      });
      return;
    }
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to delete project',
    });
  }
});

app.post('/api/nexa/qa', async (req, res) => {
  try {
    const payload = nexaQaSchema.parse(req.body);
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      res.status(500).json({ ok: false, error: 'Missing OPENAI_API_KEY on the server.' });
      return;
    }

    const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
    const messages =
      payload.messages && payload.messages.length > 0
        ? payload.messages
        : [{ role: 'user' as const, text: payload.question ?? '' }];

    const input = messages.map((msg) => ({
      role: msg.role,
      content: [{ type: 'input_text', text: msg.text }],
    }));

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        instructions:
          'You are Nexa Brain, an educational assistant. Provide clear, concise explanations, ask clarifying questions when needed, and avoid hallucinations.',
        input,
        temperature: 0.4,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || 'OpenAI request failed.';
      res.status(response.status).json({ ok: false, error: message });
      return;
    }

    const answer = extractOutputText(data);
    res.status(200).json({ ok: true, answer, id: data?.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        ok: false,
        error: error.issues.map((issue) => issue.message).join(', '),
      });
      return;
    }
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Nexa Brain request failed',
    });
  }
});

async function bootstrap() {
  await connectMongo();
  await ensurePostgresSchema();
  const server = app.listen(config.apiPort, () => {
    console.log(`[api] running on http://localhost:${config.apiPort}`);
  });
  const shutdown = async () => {
    console.log('[api] shutting down...');
    server.close();
    await Promise.allSettled([pgPool.end(), redis.quit(), mongoose.disconnect()]);
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('[api] failed to start:', error);
  process.exit(1);
});
