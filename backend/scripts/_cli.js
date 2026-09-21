// Utilità per gli script da terminale (colori, input nascosto, chiamate HTTP).
import readline from "node:readline";

export const colore = {
  verde: (t) => `\x1b[32m${t}\x1b[0m`,
  rosso: (t) => `\x1b[31m${t}\x1b[0m`,
  giallo: (t) => `\x1b[33m${t}\x1b[0m`,
  ciano: (t) => `\x1b[36m${t}\x1b[0m`,
};

export function chiedi(domanda, { nascosto = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (nascosto) {
      rl._writeToOutput = (testo) => rl.output.write(testo.includes(domanda) ? testo : "");
    }
    rl.question(domanda, (risposta) => {
      rl.close();
      if (nascosto) process.stdout.write("\n");
      resolve(risposta.trim());
    });
  });
}

export async function chiamata(base, metodo, percorso, { corpo, token } = {}) {
  const risposta = await fetch(`${base}${percorso}`, {
    method: metodo,
    headers: {
      ...(corpo ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const testo = await risposta.text();
  let dati;
  try {
    dati = JSON.parse(testo);
  } catch {
    dati = testo;
  }
  return { status: risposta.status, dati };
}

export const attendi = (ms) => new Promise((r) => setTimeout(r, ms));
