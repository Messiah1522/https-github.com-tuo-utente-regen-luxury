/*
 * REGISTRO BLOCKCHAIN SIMULATO (mock)
 * -----------------------------------
 * Imita il comportamento dello smart contract RegenLuxuryPassport senza rete,
 * wallet né commissioni: le "transazioni" vengono scritte in un file JSON che
 * fa da registro append-only. Come sulla blockchain reale:
 *  - un tag può essere registrato una sola volta (anti-clonazione);
 *  - lo storico accetta solo aggiunte (nessuna cancellazione);
 *  - il file sopravvive ai riavvii e NON dipende dal database.
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { improntaTag } from "../hashService.js";

const RETE = "mock-polygon";
const file = () => path.resolve(process.env.MOCK_LEDGER_FILE ?? "./data/mock-ledger.json");
const latenza = () => Number(process.env.MOCK_CHAIN_LATENCY_MS ?? 300);
const attendi = (ms) => new Promise((r) => setTimeout(r, ms));

let coda = Promise.resolve(); // le scritture sono serializzate, come i blocchi

async function leggi() {
  try {
    return JSON.parse(await fs.readFile(file(), "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return { blocco: 1_000_000, prossimoToken: 1, capi: {} };
    throw err;
  }
}

async function scrivi(stato) {
  const destinazione = file();
  await fs.mkdir(path.dirname(destinazione), { recursive: true });
  const temporaneo = `${destinazione}.${process.pid}.tmp`;
  await fs.writeFile(temporaneo, JSON.stringify(stato, null, 2));
  await fs.rename(temporaneo, destinazione);
}

function transazione(operazione) {
  const esegui = async () => {
    await attendi(latenza()); // simula il tempo di validazione del blocco
    const stato = await leggi();
    operazione(stato); // può lanciare errori (revert)
    stato.blocco += 1;
    const txHash = "0x" + crypto.createHash("sha256").update(crypto.randomUUID()).digest("hex");
    await scrivi(stato);
    return { txHash, blocco: stato.blocco, rete: RETE };
  };
  const risultato = coda.then(esegui, esegui);
  coda = risultato.catch(() => {});
  return risultato;
}

function capo(stato, tagId) {
  const voce = stato.capi[improntaTag(tagId)];
  if (!voce) throw Object.assign(new Error(`Tag ${tagId} non registrato sul registro`), { codice: "TAG_NON_REGISTRATO" });
  return voce;
}

export default {
  nome: RETE,

  registraCapo: ({ tagId, dataHash }) =>
    transazione((stato) => {
      const chiave = improntaTag(tagId);
      if (stato.capi[chiave]) {
        throw Object.assign(new Error(`Tag ${tagId} già registrato sul registro`), { codice: "TAG_GIA_REGISTRATO" });
      }
      stato.capi[chiave] = { tokenId: stato.prossimoToken++, dataHash, storico: [] };
    }),

  aggiornaDatiCapo: ({ tagId, dataHash }) =>
    transazione((stato) => {
      capo(stato, tagId).dataHash = dataHash;
    }),

  registraEvento: ({ tagId, hash }) =>
    transazione((stato) => {
      capo(stato, tagId).storico.push(hash);
    }),

  registraPassaggio: ({ tagId, hash }) =>
    transazione((stato) => {
      capo(stato, tagId).storico.push(hash);
    }),

  // Lettura gratuita (nessuna transazione)
  async leggiRegistro(tagId) {
    const voce = (await leggi()).capi[improntaTag(tagId)];
    if (!voce) return { registrato: false, tokenId: null, dataHash: null, storico: [] };
    return { registrato: true, tokenId: voce.tokenId, dataHash: voce.dataHash, storico: [...voce.storico] };
  },
};
