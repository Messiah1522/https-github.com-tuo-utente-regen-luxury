# Pubblicazione gratuita con HTTPS (punto 27)

Serve un indirizzo **HTTPS pubblico** perché il telefono, leggendo il tag o il QR, apra la pagina di verifica
(e perché la fotocamera del browser funzioni fuori da `localhost`).

**Soluzione proposta:** un solo servizio su **Render** (piano gratuito, regione Frankfurt): il backend espone le
API e serve la web app React compilata. Il file `render.yaml` nella radice del repository configura tutto.
Controlla sul sito di Render le condizioni attuali del piano gratuito prima della demo.

## Prerequisiti

1. Repository su GitHub (punto 3) con `package-lock.json` inclusi.
2. MongoDB Atlas: in **Network Access** il piano gratuito di Render non ha un IP fisso, quindi serve
   `0.0.0.0/0` (accesso da qualsiasi IP, protetto da utente e password del database). È un compromesso
   accettabile per un prototipo: dichiaralo come limite.
3. Blockchain: sul piano gratuito il disco è temporaneo, quindi il registro **simulato** si perderebbe a ogni
   riavvio. Per la versione pubblica usa **Polygon Amoy**: `npm run crea-wallet`, POL di prova dal faucet,
   `npm run deploy` (cartella `contracts/`).

## Passi su Render

1. Accedi a https://render.com con GitHub → **New → Blueprint** → scegli il repository `regen-luxury`.
2. Render legge `render.yaml` e chiede i valori segreti:
   - `MONGO_URI` → stringa di connessione Atlas (database `regen_luxury`)
   - `PUBLIC_BASE_URL` → l'indirizzo che Render assegna, es. `https://regen-luxury.onrender.com`
   - `CONTRACT_ADDRESS` e `PLATFORM_PRIVATE_KEY` → dal deploy su Amoy (la chiave solo qui, mai nel repository)
   - `JWT_SECRET` viene generato automaticamente
3. Dopo il primo deploy: apri `https://<indirizzo>/api/health` → `{"stato":"online",...}`.
4. Crea l'account amministratore dal tuo computer, puntando al database di produzione:
   `cd backend && npm run crea-admin` (con `MONGO_URI` di Atlas nel `.env` locale).
5. Esegui `npm run migra` una volta, così i capi già presenti vengono registrati sul contratto di Amoy.
6. Aggiorna `PUBLIC_BASE_URL` e **ristampa le etichette QR**; riscrivi i tag NFC con il nuovo dominio.

## Da sapere per la demo

- Il servizio gratuito **si sospende dopo circa 15 minuti** senza visite: la prima richiesta può richiedere
  quasi un minuto. Apri la pagina qualche minuto prima della discussione. Le misure del requisito P
  (< 2 s) vanno fatte con il servizio già attivo.
- In alternativa, per la sola demo in aula: backend e web app sul Mac e telefono sulla stessa rete Wi-Fi
  (`npm run dev` nel frontend mostra l'indirizzo di rete), ma senza HTTPS la fotocamera del telefono non si
  apre nel browser; il tag NFC e i link funzionano comunque.
