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
    res.status(400).json({ error: "Eroare la salvarea produsului în baza de date Neon." });
  }
});

// Endpoint pentru ștergerea unui produs din Neon (Corecție TypeScript)
app.delete("/api/produse/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ succes: true, message: "Produsul a fost șters cu succes." });
  } catch (error) {
    console.error("Eroare la ștergerea produsului:", error);
    res.status(500).json({ error: "Nu s-a putut șterge produsul din Neon." });
  }
});

// Endpoint pentru actualizarea unui produs (Corecție TypeScript)
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
    res.status(400).json({ error: "Nu s-au putut salva modificările în Neon." });
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

app.get("/api/comenzi", async (req: Request, res: Response) => {
  try {
    const comenzi = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
    res.status(200).json(comenzi);
  } catch (error) {
    res.status(500).json({ error: "Eroare preluare comenzi" });
  }
});

// Endpoint pentru Înregistrare Utilizator Nou în Neon
app.post("/api/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const utilizatorExistent = await prisma.user.findUnique({ where: { email } });
    if (utilizatorExistent) {
      return res.status(400).json({ message: "Acest email este déjà utilizat de alt cont." });
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
  console.log(`⚡ Server backend activ pe: http://localhost:${PORT}`);
});
