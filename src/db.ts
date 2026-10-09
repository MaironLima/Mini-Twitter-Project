import { Pool } from "pg";

const db = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres",
});

export async function initDb() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      "authorId" INTEGER NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("authorId") REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      "postId" INTEGER NOT NULL,
      "userId" INTEGER NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("postId", "userId"),
      FOREIGN KEY ("postId") REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS tokens_blacklist (
      id SERIAL PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export { db };
