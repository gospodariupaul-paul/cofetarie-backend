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

// MODIFICAT: Mărirea limitei de primire date la 50MB pentru a permite imagini mari Base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

// Endpoint pentru adăugarea unui produs nou cu imagine în Neon
app.post("/api/produse", async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, icon, tag } = req.body;

    // Salvăm produsul în tabela Product din baza de date Neon
    const produsNou = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        category,
        icon: icon || "🧁", // Aici se va salva codul text (Base64) al imaginii încărcate
        tag: tag || null
      }
    });

    res.status(201).json({ succes: true, date: produsNou });
  } catch (error) {
    console.error("Eroare la adăugarea produsului în Neon:", error);
    res.status(400).json({ error: "Eroare la salvarea produsului în baza de date Neon." });
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

// Endpoint pentru Înregistrare Utilizator Nou în Neon
app.post("/api/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Verificăm dacă emailul este deja înregistrat
    const utilizatorExistent = await prisma.user.findUnique({ where: { email } });
    if (utilizatorExistent) {
      return res.status(400).json({ message: "Acest email este deja utilizat de alt cont." });
    }

    // Salvăm utilizatorul în mod direct în tabela User din Neon
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

    // Căutăm contul în baza de date
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
  console.log(`⚡ Server backend activ pe: http://localhost:${PORT}`);
});
