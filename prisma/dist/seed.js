"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Începe popularea bazei de date (Seeding)...");
    // Ștergem produsele vechi pentru a nu duplica datele la rulări repetate
    await prisma.product.deleteMany();
    // 1. Adăugăm Produsele Populare de Cofetărie
    const produseCofetarie = [
        {
            name: "Tort Kinder",
            description: "Cremă fină de lapte, straturi pufoase de cacao și ciocolată premium premium.",
            price: 160,
            category: "torturi",
            icon: "🎂",
            tag: "Recomandat",
        },
        {
            name: "Tort Oreo",
            description: "Biscuiți Oreo crocanți sfărmați într-o cremă catifelată de brânză fină.",
            price: 150,
            category: "torturi",
            icon: "🍫",
            tag: "Popular",
        },
        {
            name: "Amandină",
            description: "Rețetă clasică însiropată, cu cremă fină de cacao și glazură fondantă.",
            price: 18,
            category: "prajituri",
            icon: "🍰",
            tag: "Tradițional",
        },
        {
            name: "Ecler",
            description: "Coajă crocantă umplută cu cremă premium de vanilie și fistic fin.",
            price: 16,
            category: "prajituri",
            icon: "🥐",
            tag: "Proaspăt",
        },
    ];
    // 2. Adăugăm Produsele din secțiunea Top Tech Hot Deals
    const produseTech = [
        {
            name: "Imprimantă 3D Alimentară Pro",
            description: "Echipament Smart capabil să printeze forme spectaculoase din ciocolată.",
            price: 2999,
            oldPrice: 4200, // opțional dacă ai adăugat câmpul, altfel Prisma îl ignoră
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
            name: "Termometru Laser Ultra-Precis",
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
    // Inserăm produsele în Neon PostgreSQL
    for (const p of [...produseCofetarie, ...produseTech]) {
        await prisma.product.create({ data: p });
    }
    console.log("✅ Baza de date Neon a fost populată cu succes cu toate produsele!");
}
main()
    .catch((e) => {
    console.error("❌ Eroare în timpul rulării seed-ului:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
