import { Pool } from 'pg';
import { config } from '../config.js';

export const pgPool = new Pool({
  connectionString: config.databaseUrl,
});

export async function checkPostgres() {
  const client = await pgPool.connect();
  try {
    const result = await client.query('SELECT 1 as ok');
    return result.rows[0]?.ok === 1;
  } finally {
    client.release();
  }
}

export async function ensurePostgresSchema() {
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

type CreateProjectInput = {
  title: string;
  status?: string;
};

type UpdateProjectInput = {
  title?: string;
  status?: string;
};

export async function listProjects() {
  const result = await pgPool.query('SELECT id, title, status, created_at FROM projects ORDER BY created_at DESC');
  return result.rows;
}

export async function createProject(input: CreateProjectInput) {
  const status = input.status?.trim() ? input.status.trim() : 'active';
  const result = await pgPool.query(
    `
      INSERT INTO projects (title, status)
      VALUES ($1, $2)
      RETURNING id, title, status, created_at
    `,
    [input.title.trim(), status]
  );
  return result.rows[0];
}

export async function updateProject(id: number, input: UpdateProjectInput) {
  const fields: string[] = [];
  const values: Array<string> = [];
  if (typeof input.title === 'string') {
    fields.push(`title = $${fields.length + 1}`);
    values.push(input.title.trim());
  }
  if (typeof input.status === 'string') {
    fields.push(`status = $${fields.length + 1}`);
    values.push(input.status.trim());
  }
  if (fields.length === 0) {
    return null;
  }
  values.push(String(id));
  const result = await pgPool.query(
    `
      UPDATE projects
      SET ${fields.join(', ')}
      WHERE id = $${values.length}
      RETURNING id, title, status, created_at
    `,
    values
  );
  return result.rows[0] ?? null;
}

export async function deleteProject(id: number) {
  const result = await pgPool.query('DELETE FROM projects WHERE id = $1', [id]);
  return result.rowCount === 1;
}
