import { db } from "../db";

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, password]
    );
    return result.rows[0] as { id: number; name: string; email: string };
  }

  static async login(email: string, password: string) {
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );
    return result.rows[0] as any;
  }

  static async blacklistToken(token: string, expiresAt: number) {
    const date = new Date(expiresAt * 1000).toISOString();
    await db.query(
      "INSERT INTO tokens_blacklist (token, expiresAt) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [token, date]
    );
  }

  static async isTokenBlacklisted(token: string) {
    const result = await db.query(
      "SELECT id FROM tokens_blacklist WHERE token = $1",
      [token]
    );
    return result.rows.length > 0;
  }
}

