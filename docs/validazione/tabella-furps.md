# Validazione: requisiti FURPS+ → test → esiti (punti 25 e 26)

Colonna **Esito (prova di sviluppo)**: test eseguiti il 22/09/2026 in ambiente di sviluppo (database locale,
blockchain simulata e chain locale Hardhat per lo smart contract). Colonna **Esito sul Mac con Atlas**: da
compilare dopo aver eseguito gli stessi comandi con il database reale (servono per il Capitolo 5).

Come rieseguire tutto:

```bash
cd backend && npm test                       # 38 test automatici (database in memoria)
npm run dev                                  # in un secondo terminale:
npm run passaggi                             # Passaggi 1-8 sull'API reale
npm run misura-tempi                         # requisito P (< 2 s)
cd ../contracts && npm run chain             # in un terzo terminale, poi:
npm run misura-gas                           # gas e controlli di sicurezza del contratto
cd ../ai-module && python -m pytest test/    # servizio AI
```

| Req. | Requisito (§3.2) | Come è verificato | Esito (prova di sviluppo) | Esito sul Mac con Atlas |
|---|---|---|---|---|
| F | Creazione dell'identità digitale del capo | `items.test.js` "crea un capo…"; Passaggio 2 | ✅ 201, registrazione on-chain confermata | |
| F | Associazione hardware-software (tag ↔ capo) | tagId univoco; `sun.test.js` associazione chip; etichetta QR (`items.test.js` "QR code") | ✅ | |
| F | Registrazione degli interventi di rigenerazione | `items.test.js` "eventi…"; Passaggio 3 | ✅ evento salvato e ancorato | |
| F | Certificato di autenticità con catena dei proprietari | `verify.test.js` "certificato pubblico…"; Passaggi 5, 6, 8 | ✅ | |
| F | Dashboard di sostenibilità (CO₂, acqua) | `verify.test.js`: jeans → 12 kg CO₂e, 1.753 L con fonti; categoria senza dati → "non disponibile" | ✅ | |
| U | Interfaccia mobile-first | Test nel browser (Chromium, schermo 390×844): home, certificato, gestione, etichetta, NFC | ✅ schermate in `docs/validazione/schermate/` | |
| U | Accesso pubblico senza registrazione | Passaggio 6 (verifica senza token) | ✅ | |
| R | Immutabilità / rilevazione delle manomissioni | `verify.test.js`: modifica di un evento, dei dati del capo e cancellazione di un passaggio direttamente nel database → "manomesso"; stesso test su smart contract reale | ✅ rilevate tutte e 3 le manomissioni | |
| R | Anti-duplicazione del tag | `items.test.js` anti-replay (anche 3 richieste simultanee: 1×201, 2×409); Passaggio 7; tag eliminato non riusabile | ✅ | |
| R | Anti-replay del chip NFC (chip clonato) | `sun.test.js`: vettore NXP AN12196, stesso URL riusato → 409, CMAC alterato → 400 | ✅ | |
| R | Accesso controllato all'area gestionale | `auth.test.js`: 401 senza login, 403 per ruolo non ammesso, account disattivato | ✅ | |
| R | Dati in ingresso validi | `items.test.js` "validazione…": campi mancanti, tagId non valido, campi sconosciuti, anno futuro, JSON malformato → 400 | ✅ | |
| R | Protezione da abusi | `verify.test.js` limite di richieste → 429 | ✅ | |
| P | Risposta alla scansione < 2 s | `npm run misura-tempi` (50 richieste) | ✅ media 5,7 ms, max 79 ms (database locale) | media ___ ms, max ___ ms |
| P | Scritture blockchain asincrone | risposta immediata con stato "in_attesa", poi "confermato" (Passaggio 2) | ✅ | |
| S | Provider blockchain sostituibile | stessi Passaggi 1–8 con `BLOCKCHAIN_MODE=mock` e con `BLOCKCHAIN_MODE=polygon` (contratto su chain locale) | ✅ 8/8 in entrambi i modi | |
| + | Stack open-source/LTS, licenze permissive | Node.js, Express, MongoDB, React, ethers.js, OpenZeppelin (MIT), TextileNet (CC BY) | ✅ | |
| + | Dati conformi al Passaporto Digitale del Prodotto (bozza) | Campi: brand, modello, materiali, filiera, anno, storico interventi e proprietà | ⚠️ allineamento concettuale: i requisiti di dettaglio per il tessile arriveranno con gli atti delegati ESPR | |
| — | Smart contract: tag duplicato e ruoli | `npm run misura-gas`: `TagAlreadyRegistered`, `AccessControlUnauthorizedAccount` | ✅ | |
| — | Modulo AI: servizio di inferenza | `ai-module/test`: modello ONNX fittizio, errori 415/400/413/503 | ✅ servizio; ❌ addestramento da eseguire su Colab | |

## Limiti da dichiarare nel Capitolo 5

- I test di sviluppo usano database e blockchain locali: i tempi reali vanno misurati con Atlas (colonna a destra).
- L'anticlonazione del chip è verificata con il vettore ufficiale NXP, non ancora con un chip fisico.
- Il modulo AI non è ancora addestrato: accuratezza e matrice di confusione arriveranno dal notebook.
- Con la custodia della piattaforma (decisione 4.2) la blockchain prova l'integrità dei dati, non l'identità
  dell'operatore che li ha inseriti.
