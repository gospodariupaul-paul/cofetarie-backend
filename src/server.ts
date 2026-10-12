import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

dotenv.config();

neonConfig.webSocketConstructor = ws;

const app: Application = express();
const PORT = process.env.PORT || 5000;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL || "" });
export const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Serverul Express cu Neon PostgreSQL rulează cu succes pe portul " + PORT);
});

// Endpoint: Citire mesaje chat din Neon
app.get("/api/chat", async (req: Request, res: Response) => {
  try {
    const mesaje = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "asc" }
    });
    res.status(200).json(mesaje);
  } catch (error) {
    console.error("Eroare la citirea chatului:", error);
    res.status(500).json({ error: "Eroare la extragerea mesajelor din Neon" });
  }
});

// Endpoint: Salvare mesaj nou în chat
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { emitent, text } = req.body;
    const mesajNou = await prisma.chatMessage.create({
      data: { emitent, text }
    });
    res.status(201).json({ succes: true, date: mesajNou });
  } catch (error) {
    console.error("Eroare la salvarea mesajului:", error);
    res.status(400).json({ error: "Eroare la salvarea în Neon" });
  }
});

// Endpoint: Produse
app.get("/api/produse", async (req: Request, res: Response) => {
  try {
    const produse = await prisma.product.findMany();
    res.status(200).json(produse);
  } catch (error) {
    res.status(500).json({ error: "Eroare produse" });
  }
});

app.post("/api/produse", async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, icon, tag } = req.body;
    const produsNou = await prisma.product.create({
      data: { name, description: description || "", price: parseFloat(price), category, icon: icon || "🧁", tag: tag || null }
    });
    res.status(201).json({ succes: true, date: produsNou });
  } catch (error) {
    res.status(400).json({ error: "Eroare salvare produs" });
  }
});

app.delete("/api/produse/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ succes: true });
  } catch (error) {
    res.status(500).json({ error: "Eroare stergere" });
  }
});

app.put("/api/produse/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description, price, category, icon, tag } = req.body;
    const prod = await prisma.product.update({
      where: { id },
      data: { name, description, price: parseFloat(price), category, icon, tag: tag || null }
    });
    res.status(200).json({ succes: true, date: prod });
  } catch (error) {
    res.status(400).json({ error: "Eroare modificare" });
  }
});

// Endpoint: Comenzi
app.post("/api/comenzi", async (req: Request, res: Response) => {
  try {
    const { clientName, phone, totalAmount } = req.body;
    const comandaNoua = await prisma.order.create({ data: { clientName, phone, totalAmount } });
    res.status(201).json({ succes: true, date: comandaNoua });
  } catch (error) {
    res.status(400).json({ error: "Eroare comanda" });
  }
});

app.get("/api/comenzi", async (req: Request, res: Response) => {
  try {
    const comenzi = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
    res.status(200).json(comenzi);
  } catch (error) {
    res.status(500).json({ error: "Eroare preluare comenzi" });
  }
});

// Endpoint: Autentificare
app.post("/api/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const existent = await prisma.user.findUnique({ where: { email } });
    if (existent) return res.status(400).json({ message: "Email existent" });
    const nou = await prisma.user.create({ data: { email, password, name: name || "Client" } });
    res.status(201).json({ succes: true, user: nou });
  } catch (error) {
    res.status(500).json({ message: "Eroare server" });
  }
});

app.post("/api/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const u = await prisma.user.findUnique({ where: { email } });
    if (!u || u.password !== password) return res.status(401).json({ message: "Incorect" });
    res.status(200).json({ succes: true, token: "token", user: { email: u.email, name: u.name } });
  } catch (error) {
    res.status(500).json({ message: "Eroare server" });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Server backend activ pe: http://localhost:${PORT}`);
});
