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

// Mărirea limitei de primire date la 50MB pentru a permite imagini mari Base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Serverul Express cu Neon PostgreSQL rulează cu succes pe portul " + PORT);
});

// Citire mesaje chat din Neon pe camere de utilizatori unici
app.get("/api/chat", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (userId) {
      const mesajeClient = await prisma.chatMessage.findMany({
        where: { userId: userId as string },
        orderBy: { createdAt: "asc" }
      });
      return res.status(200).json(mesajeClient);
    }

    const toateMesajele = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "asc" }
    });
    res.status(200).json(toateMesajele);
  } catch (error) {
    console.error("EEroare la citirea chatului din Neon:", error);
    res.status(500).json({ error: "Eroare la extragerea mesajelor din Neon" });
  }
});

// Salvare mesaj nou alocat unui client cu userId inclus obligatoriu
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { userId, userName, emitent, text } = req.body;

    const mesajNou = await prisma.chatMessage.create({
      data: {
        userId: userId || "anonim",
        userName: userName || "Client online",
        emitent,
        text
      }
    });
    res.status(201).json({ succes: true, date: mesajNou });
  } catch (error) {
    console.error("Eroare la salvarea mesajului în Neon:", error);
    res.status(400).json({ error: "Eroare la salvarea în Neon" });
  }
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
// Endpoint pentru adăugarea unui produs nou cu imagine în Neon
app.post("/api/produse", async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, icon, tag } = req.body;

    const produsNou = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        category,
        icon: icon || "🧁",
        tag: tag || null
      }
    });

    res.status(201).json({ succes: true, date: produsNou });
  } catch (error) {
    console.error("Eroare la adăugarea produsului în Neon:", error);
    res.status(400).json({ error: "Eroare la salvarea produsului." });
  }
});

// Endpoint pentru ștergerea unui produs din Neon
app.delete("/api/produse/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ succes: true, message: "Produs șters." });
  } catch (error) {
    console.error("Eroare la ștergerea produsului:", error);
    res.status(500).json({ error: "Nu s-a putut șterge produsul." });
  }
});

// Endpoint pentru actualizarea unui produs
app.put("/api/produse/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description, price, category, icon, tag } = req.body;

    const produsActualizat = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        icon,
        tag: tag || null
      }
    });

    res.status(200).json({ succes: true, date: produsActualizat });
  } catch (error) {
    console.error("Eroare la actualizarea produsului:", error);
    res.status(400).json({ error: "Nu s-au putut salva modificările." });
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
    res.status(400).json({ error: "Eroare la salvarea comenzii." });
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

// Endpoint pentru Înregistrare Utilizator
app.post("/api/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const utilizatorExistent = await prisma.user.findUnique({ where: { email } });
    if (utilizatorExistent) {
      return res.status(400).json({ message: "Acest email este deja utilizat." });
    }

    const utilizatorNou = await prisma.user.create({
      data: { email, password, name: name || "Client" }
    });

    res.status(201).json({ succes: true, user: utilizatorNou });
  } catch (error) {
    console.error("Eroare la register:", error);
    res.status(500).json({ message: "Eroare de server la crearea contului." });
  }
});

// Endpoint pentru Conectare / Login
app.post("/api/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const utilizator = await prisma.user.findUnique({ where: { email } });
    if (!utilizator || utilizator.password !== password) {
      return res.status(401).json({ message: "Email sau parolă incorectă." });
    }

    res.status(200).json({ 
      succes: true, 
      token: "simulated-token-real-auth", 
      user: { email: utilizator.email, name: utilizator.name } 
    });
  } catch (error) {
    console.error("Eroare la login:", error);
    res.status(500).json({ message: "Eroare de server la autentificare." });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Server backend activ pe portul: ${PORT}`);
});
