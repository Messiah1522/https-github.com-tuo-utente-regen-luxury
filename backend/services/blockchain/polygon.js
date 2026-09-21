/*
 * SERVIZIO BLOCKCHAIN REALE — smart contract RegenLuxuryPassport via ethers.js
 * Stessa interfaccia del registro simulato. Reti supportate: Polygon Amoy
 * (testnet) o una chain locale Hardhat (npm run chain nella cartella contracts).
 * La piattaforma firma e paga le transazioni: commercianti e acquirenti non
 * hanno bisogno di wallet né di criptovaluta (vincolo RC-5).
 */
import { ethers } from "ethers";
import { readFileSync } from "node:fs";
import { improntaTag } from "../hashService.js";

const { abi } = JSON.parse(readFileSync(new URL("./RegenLuxuryPassport.abi.json", import.meta.url)));

const RETE = process.env.CHAIN_NAME ?? "polygon-amoy";
const rpc = process.env.POLYGON_RPC_URL ?? "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(rpc);

async function creaFirmatario() {
  if (process.env.PLATFORM_PRIVATE_KEY) {
    return new ethers.NonceManager(new ethers.Wallet(process.env.PLATFORM_PRIVATE_KEY, provider));
  }
  // Chain locale Hardhat: gli account di test sono già sbloccati sul nodo
  if (/127\.0\.0\.1|localhost/.test(rpc)) return new ethers.NonceManager(await provider.getSigner(0));
  throw new Error("PLATFORM_PRIVATE_KEY mancante nel file .env");
}

let contrattoPromise;
function contratto() {
  if (!contrattoPromise) {
    if (!process.env.CONTRACT_ADDRESS) throw new Error("CONTRACT_ADDRESS mancante nel file .env");
    contrattoPromise = creaFirmatario().then((firmatario) => new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, firmatario));
  }
  return contrattoPromise;
}

async function invia(chiamata) {
  const tx = await chiamata;
  const ricevuta = await tx.wait();
  return { txHash: ricevuta.hash, blocco: ricevuta.blockNumber, rete: RETE, gasUsato: Number(ricevuta.gasUsed) };
}

async function tokenDi(c, tagId) {
  const tokenId = await c.tokenByTag(improntaTag(tagId));
  if (tokenId === 0n) {
    throw Object.assign(new Error(`Tag ${tagId} non registrato on-chain`), { codice: "TAG_NON_REGISTRATO" });
  }
  return tokenId;
}

export default {
  nome: RETE,

  async registraCapo({ tagId, dataHash }) {
    const c = await contratto();
    return invia(c.registerItem(await c.runner.getAddress(), improntaTag(tagId), dataHash));
  },

  async aggiornaDatiCapo({ tagId, dataHash }) {
    const c = await contratto();
    return invia(c.updateDataHash(await tokenDi(c, tagId), dataHash));
  },

  async registraEvento({ tagId, hash }) {
    const c = await contratto();
    return invia(c.recordRegeneration(await tokenDi(c, tagId), hash));
  },

  async registraPassaggio({ tagId, hash }) {
    const c = await contratto();
    return invia(c.recordTransfer(await tokenDi(c, tagId), hash));
  },

  async leggiRegistro(tagId) {
    const c = await contratto();
    const [registrato, tokenId, dataHash, storico] = await c.recordByTag(improntaTag(tagId));
    return {
      registrato,
      tokenId: registrato ? Number(tokenId) : null,
      dataHash: registrato ? dataHash : null,
      storico: registrato ? [...storico] : [],
    };
  },
};
