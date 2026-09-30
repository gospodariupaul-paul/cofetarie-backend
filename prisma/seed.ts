import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// SOLUȚIA CARDINALĂ: Forțăm utilizarea modulului de WebSocket nativ în mediul Node.js local
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL || ""
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Începe popularea bazei de date Neon securizat prin WebSockets...");

  // Ștergem produsele vechi folosind Prisma Client
  await prisma.product.deleteMany();

  const produseCofetarie = [
    {
      name: "Tort Kinder",
      description: "Cremă fină de lapte, straturi pufoase de cacao și ciocolată premium.",
      price: 160,
      category: "torturi",
      icon: "🎂",
      tag: "Recomandat",
      discount: 0,
      rating: 5.0,
    },
    {
      name: "Tort Oreo",
      description: "Biscuiți Oreo crocanți sfărmați într-o cremă catifelată de brânză fină.",
      price: 150,
      category: "torturi",
      icon: "🍫",
      tag: "Popular",
      discount: 0,
      rating: 5.0,
    },
    {
      name: "Amandină",
      description: "Rețetă clasică însiropată, cu cremă fină de cacao și glazură fondantă.",
      price: 18,
      category: "prajituri",
      icon: "🍰",
      tag: "Tradițional",
      discount: 0,
      rating: 5.0,
    },
    {
      name: "Ecler",
      description: "Coajă crocantă umplută cu cremă premium de vanilie și fistic fin.",
      price: 16,
      category: "prajituri",
      icon: "🥐",
      tag: "Proaspăt",
      discount: 0,
      rating: 5.0,
    },
  ];
  const produseTech = [
    {
      name: "Imprimantă 3D Alimentară Pro",
      description: "Echipament Smart capabil să printeze forme spectaculoase din ciocolată.",
      price: 2999,
      category: "tech-deals",
      discount: 28,
      rating: 4.9,
      icon: "🤖",
      tag: "Cel mai vândut",
    },
    {
      name: "Aerograf Digital cu Bluetooth",
      description: "Ustensilă Hi-Tech pentru pictarea torturilor cu precizie maximă.",
      price: 590,
      category: "tech-deals",
      discount: 30,
      rating: 4.7,
      icon: "🎨",
      tag: "Hot Deal",
    },
    {
      name: "Termometru Laser Ultra-Preciz",
      description: "Senzor de gătit ideal pentru temperarea perfectă a ciocolatei.",
      price: 199,
      category: "tech-deals",
      discount: 37,
      rating: 4.8,
      icon: "🎯",
      tag: "Temperare",
    },
    {
      name: "Mixer Planetar Smart Inteligent",
      description: "Robot de bucătărie cu ecran tactil și rețete de cofetărie integrate.",
      price: 1850,
      category: "tech-deals",
      discount: 22,
      rating: 5.0,
      icon: "⚡",
      tag: "Stoc Limitat",
    },
  ];

  // Inserăm toate produsele securizat prin noul client Prisma 8
  for (const p of [...produseCofetarie, ...produseTech]) {
    await prisma.product.create({ data: p });
  }

  console.log("✅ Baza de date Neon a fost populată cu succes prin Prisma Client!");
}

main()
  .catch((e) => {
    console.error("❌ Eroare în timpul rulării seed-ului:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
