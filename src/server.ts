import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

dotenv.config();

// Configurare obligatorie WebSocket pentru Neon în mediul Node local
neonConfig.webSocketConstructor = ws;

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Inițializăm adaptorul Neon și Clientul Prisma
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL || "" });
export const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Serverul Express cu Neon PostgreSQL rulează cu succes pe portul " + PORT);
});
// Endpoint pentru citirea produselor salvate în Neon
app.get("/api/produse", async (req: Request, res: Response) => {
  try {
    const produse = await prisma.product.findMany();
    res.status(200).json(produse);
  } catch (error) {
    console.error("Eroare la citirea produselor:", error);
    res.status(500).json({ error: "Eroare la extragerea produselor din Neon" });
  }
});

// Endpoint pentru crearea unei comenzi noi în Neon
app.post("/api/comenzi", async (req: Request, res: Response) => {
  try {
    const { clientName, phone, totalAmount } = req.body;
    const comandaNoua = await prisma.order.create({
      data: { clientName, phone, totalAmount }
    });
    res.status(201).json({ succes: true, date: comandaNoua });
  } catch (error) {
    res.status(400).json({ error: "Eroare la salvarea comenzii în Neon" });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Server backend activ pe: http://localhost:${PORT}`);
});
