/*
 * CONTROLLO DI INTEGRITÀ (database <-> blockchain)
 * ------------------------------------------------
 * Ricalcola le impronte dei dati presenti nel database e le confronta con
 * quelle lette dal registro on-chain. Se qualcuno modifica o cancella un dato
 * nel database, l'impronta ricalcolata non coincide e il capo risulta
 * "manomesso": la blockchain non impedisce la modifica del database, ma la
 * rende RILEVABILE.
 */
import { blockchain } from "./blockchain/index.js";
import { improntaCapo, improntaEvento, improntaPassaggio } from "./hashService.js";

export const ESITI = {
  verificato: "Tutti i dati coincidono con quelli ancorati sulla blockchain",
  in_attesa: "Alcune scritture sulla blockchain sono in attesa di conferma",
  incompleto: "Alcuni dati non sono ancora stati ancorati sulla blockchain",
  manomesso: "I dati non coincidono con quelli ancorati: possibile manomissione",
  non_registrato: "Il capo non risulta registrato sulla blockchain",
};

export async function verificaIntegrita(item) {
  const chain = await blockchain();
  const registro = await chain.leggiRegistro(item.tagId);
  const registrazioneInAttesa = item.registrazione?.stato === "in_attesa";

  if (!registro.registrato) {
    const stato = registrazioneInAttesa ? "in_attesa" : "non_registrato";
    return { stato, messaggio: ESITI[stato], rete: chain.nome, datiCapo: stato, voci: null };
  }

  // 1) Dati identificativi del capo
  const hashLocale = improntaCapo(item);
  let datiCapo = "verificati";
  if (registro.dataHash !== hashLocale) datiCapo = registrazioneInAttesa ? "in_attesa" : "diversi";

  // 2) Storico: ogni voce del database deve comparire on-chain (e viceversa)
  const disponibili = new Map();
  for (const h of registro.storico) disponibili.set(h, (disponibili.get(h) ?? 0) + 1);

  const voci = { verificate: 0, inAttesa: 0, nonAncorate: 0, alterate: [], soloOnChain: 0 };
  const controlla = (tipo, voce, hash) => {
    const n = disponibili.get(hash) ?? 0;
    if (n > 0) {
      disponibili.set(hash, n - 1);
      voci.verificate += 1;
    } else if (!voce.ancoraggio || voce.ancoraggio.stato === "fallito") {
      voci.nonAncorate += 1;
    } else if (voce.ancoraggio.stato === "in_attesa") {
      voci.inAttesa += 1;
    } else {
      voci.alterate.push({ tipo, id: String(voce._id) }); // confermata ma impronta diversa
    }
  };
  item.storicoRigenerazione.forEach((e) => controlla("evento", e, improntaEvento(e)));
  item.passaggiProprieta.forEach((p) => controlla("passaggio", p, improntaPassaggio(p)));
  voci.soloOnChain = [...disponibili.values()].reduce((a, b) => a + b, 0); // voci cancellate dal DB

  let stato = "verificato";
  if (datiCapo === "diversi" || voci.alterate.length > 0 || voci.soloOnChain > 0) stato = "manomesso";
  else if (datiCapo === "in_attesa" || voci.inAttesa > 0) stato = "in_attesa";
  else if (voci.nonAncorate > 0) stato = "incompleto";

  return { stato, messaggio: ESITI[stato], rete: chain.nome, tokenId: registro.tokenId, datiCapo, voci };
}
