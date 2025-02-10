import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { WebSocketServer } from "ws";
import { ZodError } from "zod";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Broadcast updates to all connected clients
  const broadcast = (message: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  app.get("/api/users", async (_req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      broadcast({ type: "user_created", data: user });
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(Number(req.params.id), updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      broadcast({ type: "user_updated", data: user });
      res.json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    const success = await storage.deleteUser(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "User not found" });
    }
    broadcast({ type: "user_deleted", data: { id: Number(req.params.id) } });
    res.status(204).send();
  });

  return httpServer;
}
