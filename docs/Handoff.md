# HANDOFF — Tesi: piattaforma blockchain di tracciabilità per capi di lusso rigenerati

> **Autore:** Giuseppe Leonardo Viola — Ingegneria Informatica (Sistemi Informativi), Politecnico di Bari (DEI)
> **Aggiornato al:** 22/09/2026 (versione 2)
> **Progetto:** cartella `regen-luxury` (Scrivania del Mac) — repository GitHub privato `regen-luxury`
> **Codice completo:** [`docs/codice-completo.md`](codice-completo.md) (rigenerabile con `node tools/esporta-codice.mjs`)

---

## 0. Come usare questo file

1. **Nuova chat con un assistente AI** → allega questo file (e, se serve il codice, `codice-completo.md`) e
   incolla il *prompt di ripresa* (§8.1). Poi usa il prompt del compito (§8.2–8.12).
2. **Per lavorare sull'app** → §5 (avvio) e §6 (test).
3. **Cose che solo tu puoi fare** (account, password, chip fisici, relatore) → §7.1.

---

## 1. Il progetto in breve

Piattaforma di **tracciabilità digitale basata su blockchain** per capi di **moda di lusso rigenerati**, pensata
per **piccoli operatori** (boutique vintage, outlet indipendenti, cooperative artigiane) e utilizzabile a
**costo nullo o trascurabile** (vincolo **RC-5**). Due classi di attori: operatori (area gestionale con login) e
consumatori (verifica pubblica senza login né app). Ponte fisico-digitale: **NFC NTAG 424 DNA** + **QR code**.
Modulo AI: classificazione del materiale da foto; impatto ambientale evitato stimato con coefficienti **LCA**.
Tesi in italiano, LaTeX con template PoliBa/DEI.

| Livello | Tecnologia |
|---|---|
| Backend | Node.js (ES modules), Express 4, Mongoose 8, JWT + bcrypt, zod, helmet, express-rate-limit |
| Database | MongoDB Atlas — progetto "tesis", Cluster0, Frankfurt, database `regen_luxury` |
| Blockchain | Polygon PoS (Amoy per i test), smart contract `RegenLuxuryPassport` (ERC-721 + AccessControl + ERC2771Context, OpenZeppelin 5), ethers.js 6; registro simulato per lo sviluppo |
| Frontend | React 18 + Vite 6 + React Router 6, mobile-first, lettore QR (`qr-scanner`), Web NFC su Android |
| NFC | NTAG 424 DNA, messaggi SUN (AES-128 + AES-CMAC, anti-replay con contatore) |
| AI | MobileNetV3-Large (transfer learning) su TextileNet-fibre, esportato in ONNX; servizio FastAPI + onnxruntime |
| Documento | LaTeX (VS Code + LaTeX Workshop, recipe `pdflatex ×2`), BibTeX |

---

## 2. Stato di avanzamento

### 2.1 Applicazione

| Componente | Stato | Dettaglio |
|---|---|---|
| Backend (Cap. 4.1) | ✅ | Base = codice originale del 1° settembre (campi italiani, porta 5000) + login e ruoli, validazione, limite di richieste, nuovi endpoint, integrità on-chain, QR, NFC. **38 test automatici superati**, Passaggi 1–8 superati |
| Test Passaggi 7–8 | ✅ in sviluppo · ⏭️ da rifare su Atlas | `npm run passaggi` (Node, funziona su Mac) e `test-powershell/passaggi.ps1` (Windows) |
| Smart contract (Cap. 4.2) | ✅ su chain locale · ⏭️ Amoy | Compilato, deployato su Hardhat, backend in modalità `polygon` 8/8; manomissione rilevata anche on-chain |
| Gas e costi (Cap. 6) | ✅ | 403.338 gas per il ciclo di vita tipico di un capo → da 0,1 a 6 centesimi (`docs/costi/gas-e-costi.md`) |
| Frontend (punti 17–20) | ✅ | Verifica pubblica, pagina NFC, scansione QR, area gestionale completa; provato nel browser su schermo da telefono |
| NFC NTAG 424 DNA (punto 16) | ✅ software · ⏭️ chip fisico | Verifica SUN corretta sul vettore ufficiale NXP AN12196 |
| Modulo AI (Cap. 4.3) | 🟡 | Dataset scelto (TextileNet), notebook Colab e servizio pronti e testati; **addestramento da eseguire su Colab** |
| LCA (punto 23) | 🟡 | Jeans verificato (Levi's 2015); t-shirt da ricontrollare; altre categorie "non disponibile" |
| Validazione (Cap. 5) | 🟡 | Tabella FURPS+ con esiti di sviluppo (`docs/validazione/tabella-furps.md`); manca la colonna "Mac con Atlas" |
| Deploy pubblico (punto 27) | ⏭️ | `render.yaml` + guida pronti; serve il tuo account Render |

### 2.2 Tesi

| Parte | Stato |
|---|---|
| Titolo | 🟡 proposta dalla chat del 1/9: *Tracciabilità digitale per la moda di lusso rigenerata — Progettazione di una piattaforma blockchain a costo zero per l'anticontraffazione e l'economia circolare* (da confermare) |
| Abstract + keywords | 🟡 bozza di ~155 parole; keyword: tracciabilità digitale, blockchain, moda di lusso rigenerata, economia circolare, Passaporto Digitale del Prodotto |
| Introduzione, Cap. 1 | ⚪ stato da verificare |
| Cap. 2 | 🟡 scritto, ampliato (~3.100 parole) e in LaTeX; bibliografia in `bibliography.bib` con `unsrt`; controllare le `\cite{}` mancanti |
| Cap. 3 | ✅ completo, in LaTeX; diagramma architetturale in §3.4 |
| Cap. 4 | 🟡 codice pronto per 4.1 e 4.2; testo da scrivere (§8.4–8.6) |
| Cap. 5 | 🟡 dati pronti, testo da scrivere (§8.7) |
| Cap. 6 | ⏭️ da scrivere, con la sostenibilità economica (dati in `docs/costi/`) |

---

## 3. Decisioni prese (e perché)

| Decisione | Motivazione |
|---|---|
| **Una sola versione del backend**: il codice originale della chat del 1/9 come base, con i miglioramenti | I dati su Atlas (capo Gucci `NFC-001`) usano i suoi nomi di campo; i 6 test già documentati usano i suoi endpoint |
| Login con **JWT** e ruoli `admin`, `brand_manager`, `commerciante`, `artigiano` | Oggi solo gli operatori autorizzati scrivono; i clienti restano senza account (requisito U) |
| **Validazione** con zod, campi sconosciuti rifiutati, `tagId` non modificabile | Requisito R: nessun dato malformato; il tag è il legame con il chip fisico |
| **Limite di richieste**: 120 verifiche/min e 10 tentativi di login/15 min per IP | Protezione da abusi e da tentativi di indovinare le password |
| **Solo impronte on-chain** (keccak256 di JSON canonico), nomi mai sulla blockchain | GDPR; l'id casuale della voce fa da "sale" |
| **Controllo di integrità**: impronte ricalcolate dal database vs impronte on-chain | Rende rilevabile qualsiasi modifica o cancellazione nel database ("manomesso") |
| Scritture **asincrone e in coda per capo** | Requisito P + ordine garantito (registrazione prima degli eventi) |
| **Registro simulato su file** (non nel database) | Deve restare indipendente dal database, come la blockchain vera |
| Contratto v2 con `dataHashOf`, `updateDataHash`, `recordByTag` | Serve per confrontare i dati attuali e leggere tutto con una chiamata gratuita |
| **Custodia della piattaforma** (paga il gas, nessun wallet per gli utenti) | RC-5 + usabilità; EIP-2771 come evoluzione — da confermare col relatore (`docs/decisioni/`) |
| **Impatto LCA** = produzione del capo nuovo × 0,6 (Farrant et al., 2010); nessun numero senza fonte | Sostituisce i vecchi coefficienti fissi (15 kg, 2.700 L × interventi) non difendibili |
| **TextileNet** invece di DeepFashion per l'addestramento | Licenza CC BY, download diretto, etichette per fibra; DeepFashion richiede un accordo firmato |
| **ONNX + onnxruntime** per il servizio AI | Sul Mac non serve PyTorch; addestramento su Colab gratuito |
| **Un solo servizio web** (API + web app) su Render + **Amoy** in produzione | Stesso dominio HTTPS per tag e QR; il registro simulato si perderebbe sul disco temporaneo |
| UML: solo le modifiche richieste dal relatore | Evita cicli di revisione |

---

## 4. Struttura del repository

```
regen-luxury/
├── backend/           server.js, app.js, config/, models/, controllers/, routes/, middleware/,
│                      validators/, services/ (blockchain, anchor, integrity, impact, sun, qr, hash),
│                      data/coefficienti-lca.json, scripts/ (passaggi, misura-tempi, crea-admin, migra),
│                      test/ (38 test node:test), test-powershell/passaggi.ps1
├── frontend/          src/pages (Home, Verify, Sun, Scan, Login, Dashboard, NewItem, ItemDetail,
│                      Label, Users, Account), src/components, src/services/api.js, src/styles
├── contracts/         RegenLuxuryPassport.sol, compile.cjs, deploy.mjs, crea-wallet.mjs, misura-gas.mjs
├── ai-module/         src/ (classi, prepara_dataset, addestra, servizio), notebooks/, lca/, test/
├── docs/              Handoff.md, codice-completo.md, validazione/, costi/, decisioni/, nfc/,
│                      deploy.md, demo.md, latex/, uml/
├── tools/             esporta-codice.mjs (Mac/Linux/Windows), esporta-codice.ps1
└── render.yaml        deploy gratuito su Render
```

Endpoint: vedi la tabella nel `README.md` della radice.

---

## 5. Come avviare tutto sul Mac

```bash
# Backend (terminale 1)
cd ~/Desktop/regen-luxury/backend
npm install
cp .env.example .env        # MONGO_URI = stringa Atlas; JWT_SECRET = stringa casuale (comando nel file)
npm run crea-admin          # crea il tuo account amministratore
npm run migra               # registra il capo Gucci NFC-001 e gli altri dati della versione precedente
npm run dev                 # "MongoDB Atlas: connesso" + "Server in ascolto sulla porta 5000"

# Web app (terminale 2)
cd ~/Desktop/regen-luxury/frontend
npm install
npm run dev                 # apri http://localhost:5173

# Smart contract reale in locale (facoltativo, terminale 3)
cd ~/Desktop/regen-luxury/contracts
npm install && npm run compile
npm run chain               # lascia aperto; poi in un altro terminale:
npm run deploy              # copia CONTRACT_ADDRESS nel backend/.env con BLOCKCHAIN_MODE=polygon
```

**Nota importante.** Con la v2 l’endpoint `GET /api/items` richiede il login e restituisce
`{ dati, pagina, perPagina, totale, pagine }` invece di un array: i vecchi comandi PowerShell della chat del
1/9 senza token non funzionano più. Usa `npm run passaggi` o `test-powershell/passaggi.ps1`.

---

## 6. Test e risultati (22/09/2026, ambiente di sviluppo)

| Prova | Comando | Risultato |
|---|---|---|
| Test automatici backend | `npm test` | **38/38** (login e ruoli, validazione, endpoint, integrità, manomissioni, limite di richieste, NFC) |
| Passaggi 1–8 (blockchain simulata) | `npm run passaggi` | 8/8 — dati della v1 migrati con `npm run migra` → "verificato" |
| Passaggi 1–8 (smart contract su chain locale) | stesso, con `BLOCKCHAIN_MODE=polygon` | 8/8; manomissione di un evento → "manomesso" |
| Passaggi in PowerShell | `test-powershell/passaggi.ps1` | 8/8 |
| Tempi di risposta | `npm run misura-tempi` | media 5,7 ms, massimo 79 ms (database locale) — **da rifare con Atlas** |
| Gas | `npm run misura-gas` | registrazione 106.974–124.074, evento 56.086–73.186, passaggio 55.503, aggiornamento 33.720 |
| NFC | test `sun.test.js` | vettore NXP AN12196 (UID 04DE5F1EACC040, contatore 61) + RFC 4493 |
| Web app | Chromium 390×844 | 11 schermate in `docs/validazione/schermate/` |
| Servizio AI | `python test/test_servizio.py` | modello ONNX fittizio, errori 400/413/415/503 corretti |

---

## 7. Cosa resta da fare

### 7.1 Solo tu (account, password, hardware, relatore)

- [ ] **Node.js** sul Mac: `node -v` (se manca, versione LTS da nodejs.org)
- [ ] **Atlas → Network Access → Add current IP address**
- [ ] `backend/.env` con la **stringa di connessione Atlas** (contiene la password: non incollarla in chat)
- [ ] **GitHub**: autorizzare VS Code per la pubblicazione del repository privato
- [ ] `npm run crea-admin`, `npm run migra`, poi `npm run passaggi` e `npm run misura-tempi` → compila la colonna "Mac con Atlas" di `docs/validazione/tabella-furps.md`
- [ ] **Relatore**: le 3 domande in `docs/decisioni/4.2-custodia-e-commissioni.md`
- [ ] **Amoy**: `npm run crea-wallet` → POL di prova dal faucet (login e captcha) → `npm run deploy`
- [ ] **Colab**: eseguire `ai-module/notebooks/addestramento_colab.ipynb` e copiare il modello in `ai-module/models/`
- [ ] **Chip fisico**: acquistare NTAG 424 DNA, configurare SDM (`docs/nfc/configurazione-tag.md`), associarlo a un capo
- [ ] **Render**: account e Blueprint (`docs/deploy.md`); poi ristampare i QR con il dominio pubblico

### 7.2 Sviluppo (anche con un assistente AI)

- [ ] Verificare i valori della t-shirt (Forfora et al., 2026) e aggiungere categorie LCA con fonte
- [ ] Ancoraggio "a lotti" con radice di Merkle (sviluppo futuro, Cap. 6)
- [ ] Passaggio a EIP-2771 (firme degli operatori) se il relatore lo chiede
- [ ] Scrivere i capitoli 4, 5, 6 (§8)

---

## 8. Prompt pronti all'uso

> Allegare sempre questo HandOff. Per il codice, allegare `docs/codice-completo.md` o i file interessati.

### 8.1 Ripresa del contesto

```text
Sei il mio assistente per la tesi triennale in Ingegneria Informatica (Sistemi Informativi) al Politecnico di Bari. Ti allego il file HANDOFF con lo stato del progetto regen-luxury: leggilo tutto prima di rispondere.
Come voglio lavorare:
- italiano, conciso, operativo, senza preamboli;
- passaggi incrementali: dopo ogni passaggio aspetta la mia conferma o l'output del terminale;
- ho basi da principiante in AI e blockchain: tutto deve essere difendibile oralmente da me; segnala le affermazioni rischiose e proponi fonti, senza allarmismi;
- correzioni mirate, non riscritture complete; sui diagrammi UML solo le modifiche richieste dal relatore;
- ambiente: Mac (e PC Windows), VS Code, Node.js, MongoDB Atlas, LaTeX con recipe pdflatex x2.
Per iniziare: riassumi in 5 righe lo stato del progetto e proponi il prossimo passo più importante. Poi aspetta.
```

### 8.2 Primo avvio sul Mac con Atlas

```text
Devo avviare la v2 del backend sul Mac con il mio database Atlas. Ho già: [Node installato sì/no], [IP aggiunto in Atlas sì/no].
Guidami un comando alla volta: npm install, creazione del .env (senza che io ti incolli la password), npm run crea-admin, npm run migra, npm run dev, npm run passaggi, npm run misura-tempi.
Dopo ogni comando aspetta l'output. Alla fine aiutami a compilare la colonna "Esito sul Mac con Atlas" della tabella FURPS+.
```

### 8.3 `.bib` e citazioni del Capitolo 2

```text
Ti allego capitolo2.tex e bibliography.bib (stile unsrt). Obiettivo: una tabella "frase -> chiave -> dove inserire \cite{}" per ogni affermazione fattuale, sezione per sezione, e l'elenco delle affermazioni ancora senza fonte (in particolare: ~99,95% con The Merge, NTAG 424 DNA, coefficienti LCA).
Non inventare riferimenti: se una fonte non è certa, scrivi [DA VERIFICARE]. Correggi anche "direttiva" -> "Regolamento (UE) 2024/1781 (ESPR)" dove si parla del Passaporto Digitale del Prodotto.
```

### 8.4 Testo del §4.1 (backend)

```text
Scriviamo il §4.1 "Sviluppo del Back end e gestione della logica di business" dal codice in codice-completo.md (cartella backend).
Struttura: architettura a livelli (rotte, middleware, controller, servizi, modelli) · modello dati MongoDB con sottodocumenti embedded · API REST (tabella) · login e ruoli · validazione e limite di richieste · anti-duplicazione del tag · scrittura asincrona sulla blockchain e interfaccia sostituibile · gestione degli errori.
Registro accessibile come nel Cap. 3; collega ogni scelta al requisito FURPS+; al massimo 2-3 frammenti di codice brevi (lstlisting). Una sottosezione alla volta.
```

### 8.5 Testo del §4.2 (blockchain)

```text
Scriviamo il §4.2 dal contratto RegenLuxuryPassport.sol e dai servizi backend/services/blockchain e integrityService.js.
1) Spiegami il contratto riga per riga come se dovessi difenderlo in commissione.
2) Testo: impronte keccak256 e JSON canonico, cosa va on-chain e cosa no (GDPR), registro simulato vs Polygon, controllo di integrità (manomissione rilevabile), custodia della piattaforma e costi (decisione in docs/decisioni).
3) Figura: sequenza "registrazione capo -> ancoraggio asincrono -> verifica pubblica".
```

### 8.6 Testo del §4.3 (modulo AI)

```text
Scriviamo il §4.3 da ai-module (README, src/addestra.py, src/servizio.py, lca/coefficienti.md) e, se disponibili, da models/metriche.json e matrice_confusione.png.
Spiega a livello principiante: transfer learning, perché MobileNetV3, perché TextileNet (licenza e accesso rispetto a DeepFashion), divisione 70/15/15, metriche, esportazione ONNX, perché il suggerimento va sempre confermato. Poi il metodo di stima dell'impatto (produzione x 0,6) con le fonti.
```

### 8.7 Capitolo 5 — Validazione

```text
Scriviamo il Capitolo 5 da docs/validazione/tabella-furps.md, dalle schermate in docs/validazione/schermate e dai risultati sul Mac con Atlas: [incolla output di npm test, npm run passaggi, npm run misura-tempi].
5.1: tabella requisito -> test -> esito; 5.2: tracciabilità e anticontraffazione (duplicazione del tag, anti-replay NFC con vettore NXP, rilevazione delle manomissioni). Dichiara onestamente i limiti (chip fisico, modulo AI, custodia).
```

### 8.8 Capitolo 6 — Conclusioni e sostenibilità economica

```text
Scriviamo il Capitolo 6. Il §3.3.3 rimanda qui per la sostenibilità del modello zero-cost. Dati: docs/costi/gas-e-costi.md (gas misurato, scenari di costo).
1) Aggiorna gli scenari con prezzo del gas e di POL di oggi, con data e fonte.
2) Confronta: costo assorbito dalla piattaforma, quota associativa di una cooperativa, ancoraggio a lotti con radice di Merkle.
3) 6.1 sintesi e impatto; 6.2 sviluppi futuri (EIP-2771, chip con chiavi diversificate, atti delegati ESPR per il tessile, modulo AI su più dati).
```

### 8.9 Titolo

```text
Proposta attuale: "Tracciabilità digitale per la moda di lusso rigenerata — Progettazione di una piattaforma blockchain a costo zero per l'anticontraffazione e l'economia circolare". Valutala rispetto a ciò che il prototipo dimostra davvero e proponi al massimo 3 alternative con pro e contro.
```

### 8.10 Trasposizione in LaTeX

```text
Trasponi in LaTeX (template PoliBa/DEI) il testo che ti incollo: \section coerenti con l'indice, itemize al posto di "●", CO\textsubscript{2}, \% nelle percentuali, figure in images/ con \label e \caption, citazioni \cite{}. Deve compilare con pdflatex -> bibtex -> pdflatex x2. Non cambiare il contenuto; segnala a parte le frasi da rivedere. (Dopo: node docs/latex/pulisci-tex.mjs file.tex)
```

### 8.11 Revisione UML

```text
Il relatore chiede queste modifiche al [diagramma]: [richieste]. Ti allego il sorgente. Applica SOLO queste modifiche, senza riorganizzare o rinominare. Restituisci il sorgente completo e l'elenco puntuale delle modifiche.
```

### 8.12 Simulazione della discussione

```text
Simula la commissione. Una domanda alla volta sui punti più esposti: The Merge ~99,95%, NTAG 424 DNA e anti-replay, fonti LCA e fattore 0,6, chi paga il gas, cosa è davvero immutabile (impronte on-chain vs database), perché Polygon, perché MongoDB, GDPR, TextileNet vs DeepFashion, limiti del prototipo. Dopo ogni risposta: voto 1-5, cosa mancava, versione migliore in 4 frasi.
```

---

## 9. Punti a rischio per la discussione

1. **"~99,95% di riduzione dei consumi con The Merge"**: riguarda Ethereum; fonti ethereum.org e CCRI (2022). Polygon è PoS ma non ha lo stesso numero.
2. **NTAG 424 DNA**: il software è verificato con il vettore NXP, il chip fisico non ancora. Chiavi di fabbrica (zero) solo per la demo.
3. **LCA**: jeans da Levi's (2015) solo fasi di produzione; t-shirt da verificare; fattore 0,6 da Farrant et al. (2010). Sono stime.
4. **"Direttiva" → Regolamento (UE) 2024/1781 (ESPR)** per il Passaporto Digitale del Prodotto (§3.2.6).
5. **Immutabilità**: il §3.2.3 dice "impossibile da modificare"; formulazione difendibile: *la modifica del database diventa rilevabile* (ora dimostrato dai test).
6. **Custodia della piattaforma**: la blockchain prova l'integrità, non l'identità dell'operatore.
7. **Dataset**: il Cap. 2 cita DeepFashion, l'addestramento usa TextileNet → motivare.
8. **Deploy gratuito**: il server si sospende dopo 15 minuti; "svegliarlo" prima della demo.
9. **Atlas aperto a 0.0.0.0/0** se si usa Render gratuito: limite da dichiarare.

---

## 10. Lezioni apprese e trappole note

- Nessuna affermazione fattuale senza fonte; nessun numero LCA senza unità funzionale.
- UML: solo le richieste del relatore.
- LaTeX su Windows: recipe `pdflatex ×2` (non latexmk); con bibliografia `pdflatex → bibtex → pdflatex ×2`; dopo il copia-incolla: `node docs/latex/pulisci-tex.mjs file.tex`.
- PowerShell: `Invoke-RestMethod` + `ConvertTo-Json`, non `curl.exe`; ora serve anche il token (`passaggi.ps1`).
- Il registro simulato vive in `backend/data/mock-ledger.json`: se lo cancelli, i capi risultano "non registrati" finché non esegui `npm run migra`.
- Un tag eliminato dal database resta registrato on-chain e non può essere riusato (comportamento voluto).
- OpenZeppelin 5 richiede la compilazione con EVM **cancun**.
- Credenziali (Atlas, JWT, chiave del wallet) solo nei file `.env`, esclusi da Git e dall'esportazione del codice.

---

## Appendice — strumenti LaTeX e UML

- `docs/latex/latex-workshop-settings.jsonc` — recipe `pdflatex ×2` per VS Code
- `docs/latex/pulisci-tex.mjs` — pulizia dei caratteri Unicode del copia-incolla
- `docs/latex/bibliografia-starter.bib` — 18 voci di riferimento (da unire a `bibliography.bib`)
- `docs/uml/casi_d_uso.puml` — trascrizione del diagramma dei casi d'uso (vale la versione approvata dal relatore)
