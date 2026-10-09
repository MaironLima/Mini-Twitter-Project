import { db } from "../db";

export class PostService {
  static async getAll(page: number = 1, limit: number = 10, search?: string) {
    const queryPage = isNaN(page) ? 1 : page;
    const offset = (queryPage - 1) * limit;

    let queryStr = `
      SELECT p.*, u.name as "authorName", 
      (SELECT COUNT(*) FROM likes WHERE "postId" = p.id) as "likesCount"
      FROM posts p 
      JOIN users u ON p."authorId" = u.id 
    `;
    
    const params: any[] = [];
    if (search) {
      queryStr += ` WHERE p.title ILIKE $1 `;
      params.push(`%${search}%`);
      queryStr += ` ORDER BY p."createdAt" DESC LIMIT $2 OFFSET $3 `;
      params.push(limit, offset);
    } else {
      queryStr += ` ORDER BY p."createdAt" DESC LIMIT $1 OFFSET $2 `;
      params.push(limit, offset);
    }

    const postsResult = await db.query(queryStr, params);
    
    let countQuery = "SELECT COUNT(*) as total FROM posts p";
    if (search) {
      countQuery += " WHERE p.title ILIKE $1";
      const totalResult = await db.query(countQuery, [`%${search}%`]);
      return { posts: postsResult.rows, total: parseInt(totalResult.rows[0].total), page: queryPage, limit };
    }
    
    const totalResult = await db.query(countQuery);
    return { posts: postsResult.rows, total: parseInt(totalResult.rows[0].total), page: queryPage, limit };
  }

  static async create(title: string, content: string, authorId: string, image?: string) {
    const result = await db.query(
      "INSERT INTO posts (title, content, \"authorId\", image) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, authorId, image ?? null]
    );
    return result.rows[0];
  }

  static async getById(id: number) {
    const result = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
    return result.rows[0] as any;
  }

  static async update(id: number, title: string, content: string, image?: string) {
    await db.query(
      "UPDATE posts SET title = $1, content = $2, image = $3 WHERE id = $4",
      [title, content, image ?? null, id]
    );
    return { success: true };
  }

  static async delete(id: number) {
    await db.query("DELETE FROM posts WHERE id = $1", [id]);
    return { success: true };
  }

  static async toggleLike(postId: number, userId: number) {
    const existing = await db.query(
      "SELECT id FROM likes WHERE \"postId\" = $1 AND \"userId\" = $2",
      [postId, userId]
    );
    
    if (existing.rows.length > 0) {
      await db.query("DELETE FROM likes WHERE \"postId\" = $1 AND \"userId\" = $2", [postId, userId]);
      return { liked: false };
    } else {
      await db.query("INSERT INTO likes (\"postId\", \"userId\") VALUES ($1, $2)", [postId, userId]);
      return { liked: true };
    }
  }
}

