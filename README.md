# Regen Luxury — tracciabilità blockchain per capi di lusso rigenerati

Prototipo della tesi di laurea di Giuseppe Leonardo Viola (Ingegneria Informatica, Politecnico di Bari).
Stato del progetto, decisioni e prompt: [`docs/Handoff.md`](docs/Handoff.md).

| Cartella | Contenuto | Stato |
|---|---|---|
| `backend/` | API REST Node.js + Express + MongoDB: login e ruoli, capi, interventi, passaggi di proprietà, verifica pubblica con controllo di integrità sulla blockchain, QR, NFC NTAG 424 DNA | ✅ 38 test + Passaggi 1–8 |
| `frontend/` | Web app React mobile-first: verifica pubblica (`/v/:tagId`, `/s` per NFC, `/scan`), area gestionale | ✅ |
| `contracts/` | Smart contract `RegenLuxuryPassport` (ERC-721, OpenZeppelin), chain locale, deploy, misura del gas | ✅ testato su chain locale |
| `ai-module/` | Classificazione del materiale da foto (notebook Colab + servizio ONNX) | 🟡 da addestrare su Colab |
| `docs/` | HandOff, validazione FURPS+, costi, deploy, demo, NFC, decisioni, LaTeX, UML | ✅ |

## Requisiti

- **Node.js 20 o 22 LTS** e npm (`node -v`) — https://nodejs.org
- **Git** (`git --version`)
- Account **MongoDB Atlas** con un cluster gratuito (M0), un *database user* e il tuo IP in *Network Access*
- Solo per il modulo AI: **Python 3.11+**

## Avvio in locale (Mac)

I comandi si lanciano dalla cartella principale `regen-luxury` (dove si aprono i terminali di VS Code):
inoltrano da soli a `backend/` e `frontend/`.

```bash
# 0) Una volta sola
npm run installa             # dipendenze di backend e web app
npm run imposta-db           # chiede la password del database user di Atlas (nascosta), la salva nel .env,
                             # genera JWT_SECRET se manca e prova subito la connessione
npm run crea-admin           # crea il tuo account (la password la scegli tu, nascosta); se l'email esiste la reimposta

# 1) Backend  (terminale 1, resta aperto)
npm run dev                  # "MongoDB Atlas: connesso" + API su http://localhost:5001 (la 5000 su macOS è di AirPlay)

# 2) Web app  (terminale 2)
npm run web                  # http://localhost:5173  (le chiamate /api vanno al backend)

# 3) Test  (terminale 3, con il backend avviato)
npm run passaggi             # Passaggi 1-8: email e password del TUO account, non quella del database
npm run misura-tempi         # requisito P (< 2 s)
npm test                     # 38 test automatici (database in memoria)
```

Le password sono due e diverse: quella del *database user* di Atlas (sta solo nel `.env`, si imposta con
`npm run imposta-db`) e quella del tuo account della piattaforma (login nella web app e `npm run passaggi`,
si imposta con `npm run crea-admin`). Solo per dati creati con la versione precedente del backend: `npm run migra`.

Blockchain: di default `BLOCKCHAIN_MODE=mock` (registro simulato, gratuito). Per lo smart contract reale:
`cd contracts && npm install && npm run chain` (terminale dedicato) → `npm run deploy` → nel `backend/.env`
imposta `BLOCKCHAIN_MODE=polygon`, `POLYGON_RPC_URL=http://127.0.0.1:8545` e `CONTRACT_ADDRESS`.

## API principali

| Metodo | Percorso | Chi | Descrizione |
|---|---|---|---|
| POST | `/api/auth/login` | tutti | login dell'area gestionale |
| GET | `/api/items?q=&stato=&pagina=&perPagina=` | loggati | elenco con ricerca e pagine |
| POST | `/api/items` | brand manager, commerciante | nuovo capo (409 se il tag esiste già) |
| GET | `/api/items/tag/:tagId` · `/api/items/:id` | loggati | ricerca per tag · dettaglio |
| PATCH | `/api/items/:id` | brand manager, commerciante | modifica dati (tagId non modificabile) |
| POST | `/api/items/:id/archivia` | brand manager | archiviazione |
| POST | `/api/items/:id/eventi` | artigiano, commerciante | intervento di rigenerazione |
| POST | `/api/items/:id/proprieta` | commerciante, brand manager | passaggio di proprietà |
| GET | `/api/items/:id/qr` | loggati | QR code (SVG o `?formato=png`) |
| POST | `/api/items/:id/nfc` | brand manager, commerciante | associa un chip NTAG 424 DNA |
| DELETE | `/api/items/:id` | admin | eliminazione (solo per la demo) |
| GET | `/api/verify/:tagId` | **pubblico** | certificato + integrità + impatto |
| GET | `/api/verify/sun?e=&c=` | **pubblico** | verifica del chip NFC con anti-replay |

## Estensioni VS Code consigliate

ESLint, Prettier, MongoDB for VS Code, Solidity (Juan Blanco), PlantUML (jebbs), Python, Jupyter,
PowerShell, LaTeX Workshop.

## Sicurezza

I file `.env` (stringa Atlas, segreto JWT, chiave privata del wallet) **non vanno mai** condivisi né messi su Git.
