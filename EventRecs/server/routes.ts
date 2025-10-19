import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import createMemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import {
  insertUserSchema,
  loginSchema,
  insertArticleSchema,
  insertCategorySchema,
  insertTagSchema,
  type User,
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Middleware to check authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "knowledge-hub-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000, // 24 hours
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // ========== Authentication Routes ==========
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  });

  // ========== Dashboard Routes ==========
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const articles = await storage.getAllArticles();
      const employees = await storage.getAllUsers();
      const categories = await storage.getAllCategories();

      const publishedArticles = articles.filter((a) => a.status === "published").length;
      const draftArticles = articles.filter((a) => a.status === "draft").length;
      const totalViews = articles.reduce((sum, a) => sum + a.views, 0);

      res.json({
        totalArticles: articles.length,
        publishedArticles,
        draftArticles,
        totalEmployees: employees.length,
        totalViews,
        totalCategories: categories.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch stats" });
    }
  });

  // ========== Article Routes ==========
  app.get("/api/articles", requireAuth, async (req, res) => {
    try {
      const articles = await storage.getAllArticles();
      res.json(articles);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/recent", requireAuth, async (req, res) => {
    try {
      const articles = await storage.getRecentArticles(5);
      res.json(articles);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch recent articles" });
    }
  });

  app.get("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      const article = await storage.getArticleById(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      // Only increment view count if not editing (check for edit query param)
      if (!req.query.edit) {
        await storage.incrementArticleViews(req.params.id);
      }

      res.json(article);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch article" });
    }
  });

  app.post("/api/articles", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const { tagIds, ...articleData } = req.body;
      const data = insertArticleSchema.parse({
        ...articleData,
        authorId: user.id,
      });

      const article = await storage.createArticle(data, tagIds);
      res.json(article);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create article" });
    }
  });

  app.patch("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      const { tagIds, ...articleData } = req.body;
      const article = await storage.updateArticle(req.params.id, articleData, tagIds);
      res.json(article);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update article" });
    }
  });

  app.delete("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteArticle(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete article" });
    }
  });

  // ========== Employee Routes ==========
  app.get("/api/employees", requireAuth, async (req, res) => {
    try {
      const employees = await storage.getAllUsers();
      // Don't send passwords
      const sanitized = employees.map(({ password, ...user }) => user);
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", requireAuth, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create employee
      const employee = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      // Don't send password
      const { password, ...sanitized } = employee;
      res.json(sanitized);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create employee" });
    }
  });

  app.delete("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      // Don't allow deleting yourself
      if (req.params.id === req.session.userId) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete employee" });
    }
  });

  // ========== Category Routes ==========
  app.get("/api/categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create category" });
    }
  });

  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete category" });
    }
  });

  // ========== Tag Routes ==========
  app.get("/api/tags", requireAuth, async (req, res) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch tags" });
    }
  });

  app.post("/api/tags", requireAuth, async (req, res) => {
    try {
      const data = insertTagSchema.parse(req.body);
      const tag = await storage.createTag(data);
      res.json(tag);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create tag" });
    }
  });

  app.delete("/api/tags/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTag(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete tag" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
