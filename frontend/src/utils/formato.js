export const TIPI_EVENTO = {
  riparazione: "Riparazione",
  upcycling: "Upcycling",
  sostituzione_parti: "Sostituzione di parti",
};

export const RUOLI = {
  admin: "Amministratore",
  brand_manager: "Brand manager",
  commerciante: "Commerciante",
  artigiano: "Artigiano",
};

export const CATEGORIE = ["giacca", "cappotto", "abito", "camicia", "t-shirt", "maglione", "pantaloni", "jeans", "gonna", "borsa", "scarpe", "accessorio", "altro"];
export const MATERIALI = ["cotone", "lana", "seta", "lino", "cashmere", "pelle", "denim", "poliestere", "nylon", "viscosa", "misto", "altro"];

export const data = (d) =>
  d ? new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }) : "—";

export const dataOra = (d) =>
  d ? new Date(d).toLocaleString("it-IT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export const hashBreve = (h) => (h ? `${h.slice(0, 10)}…${h.slice(-6)}` : "—");

export const numero = (n, cifre = 1) => Number(n).toLocaleString("it-IT", { maximumFractionDigits: cifre });

export const maiuscola = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

// Estrae la destinazione da un QR o da un tag NFC letto
export function interpretaCodice(testo) {
  const valore = String(testo ?? "").trim();
  try {
    const url = new URL(valore);
    const v = url.pathname.match(/\/v\/([A-Za-z0-9_-]{3,64})\/?$/);
    if (v) return { tipo: "tag", tagId: decodeURIComponent(v[1]) };
    const e = url.searchParams.get("e");
    const c = url.searchParams.get("c");
    if (e && c) return { tipo: "sun", e, c };
  } catch {
    /* non è un URL */
  }
  if (/^[A-Za-z0-9_-]{3,64}$/.test(valore)) return { tipo: "tag", tagId: valore };
  return null;
}
