// Reference: javascript_database integration
import {
  users,
  articles,
  categories,
  tags,
  articleTags,
  type User,
  type InsertUser,
  type Article,
  type InsertArticle,
  type Category,
  type InsertCategory,
  type Tag,
  type InsertTag,
  type ArticleWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, like, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;

  // Article operations
  getAllArticles(): Promise<ArticleWithRelations[]>;
  getArticleById(id: string): Promise<ArticleWithRelations | undefined>;
  getRecentArticles(limit?: number): Promise<ArticleWithRelations[]>;
  createArticle(article: InsertArticle, tagIds?: string[]): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>, tagIds?: string[]): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  incrementArticleViews(id: string): Promise<void>;

  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Tag operations
  getAllTags(): Promise<Tag[]>;
  getTagById(id: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
  getArticleTags(articleId: string): Promise<Tag[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Article operations
  async getAllArticles(): Promise<ArticleWithRelations[]> {
    const articlesData = await db.query.articles.findMany({
      with: {
        author: true,
        category: true,
        articleTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(articles.createdAt)],
    });

    return articlesData.map((article) => ({
      ...article,
      tags: article.articleTags.map((at) => at.tag),
    }));
  }

  async getArticleById(id: string): Promise<ArticleWithRelations | undefined> {
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, id),
      with: {
        author: true,
        category: true,
        articleTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!article) return undefined;

    return {
      ...article,
      tags: article.articleTags.map((at) => at.tag),
    };
  }

  async getRecentArticles(limit: number = 5): Promise<ArticleWithRelations[]> {
    const articlesData = await db.query.articles.findMany({
      with: {
        author: true,
        category: true,
        articleTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(articles.createdAt)],
      limit,
    });

    return articlesData.map((article) => ({
      ...article,
      tags: article.articleTags.map((at) => at.tag),
    }));
  }

  async createArticle(insertArticle: InsertArticle, tagIds?: string[]): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values({
        ...insertArticle,
        publishedAt: insertArticle.status === "published" ? new Date() : null,
      })
      .returning();

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await db.insert(articleTags).values(
        tagIds.map((tagId) => ({
          articleId: article.id,
          tagId,
        }))
      );
    }

    return article;
  }

  async updateArticle(id: string, updateData: Partial<InsertArticle>, tagIds?: string[]): Promise<Article> {
    const [article] = await db
      .update(articles)
      .set({
        ...updateData,
        updatedAt: new Date(),
        publishedAt: updateData.status === "published" ? new Date() : undefined,
      })
      .where(eq(articles.id, id))
      .returning();

    // Update tags if provided
    if (tagIds !== undefined) {
      // Remove all existing tags
      await db.delete(articleTags).where(eq(articleTags.articleId, id));
      
      // Add new tags
      if (tagIds.length > 0) {
        await db.insert(articleTags).values(
          tagIds.map((tagId) => ({
            articleId: id,
            tagId,
          }))
        );
      }
    }

    return article;
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  async incrementArticleViews(id: string): Promise<void> {
    await db
      .update(articles)
      .set({ views: sql`${articles.views} + 1` })
      .where(eq(articles.id, id));
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Tag operations
  async getAllTags(): Promise<Tag[]> {
    return db.select().from(tags).orderBy(tags.name);
  }

  async getTagById(id: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag || undefined;
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(insertTag).returning();
    return tag;
  }

  async deleteTag(id: string): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id));
  }

  async getArticleTags(articleId: string): Promise<Tag[]> {
    const result = await db
      .select({ tag: tags })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(articleTags.articleId, articleId));

    return result.map((r) => r.tag);
  }
}

export const storage = new DatabaseStorage();
