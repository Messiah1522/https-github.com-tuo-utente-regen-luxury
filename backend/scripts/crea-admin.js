/*
 * Crea il primo account amministratore (o un account con un altro ruolo).
 * Uso:
 *   npm run crea-admin
 *   npm run crea-admin -- --email mario@boutique.it --nome "Mario Rossi" --ruolo commerciante
 * La password viene generata casualmente e mostrata UNA sola volta: conservala.
 */
import "dotenv/config";
import readline from "node:readline/promises";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import { RUOLI } from "../models/costanti.js";

const argomento = (nome) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const email = (argomento("email") ?? (await rl.question("Email: "))).trim().toLowerCase();
const nome = (argomento("nome") ?? (await rl.question("Nome e cognome: "))).trim();
const ruolo = argomento("ruolo") ?? "admin";
rl.close();

if (!email.includes("@") || !nome) {
  console.error("Email o nome non validi.");
  process.exit(1);
}
if (!RUOLI.includes(ruolo)) {
  console.error(`Ruolo non valido. Ruoli ammessi: ${RUOLI.join(", ")}`);
  process.exit(1);
}

await connectDB();
if (await User.exists({ email })) {
  console.error(`Esiste già un utente con email ${email}.`);
  await mongoose.disconnect();
  process.exit(1);
}
const password = argomento("password") ?? crypto.randomBytes(12).toString("base64url");
await User.create({ nome, email, ruolo, passwordHash: await bcrypt.hash(password, 12) });
await mongoose.disconnect();

console.log(`\nAccount creato: ${email} (ruolo: ${ruolo})`);
console.log(`Password: ${password}`);
console.log("Conservala ora: non verrà mostrata di nuovo. Potrai cambiarla dalla web app.\n");
