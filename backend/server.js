import "dotenv/config"; // carica le variabili d'ambiente dal file .env (deve restare il primo import)
import { connectDB } from "./config/db.js";
import { creaApp } from "./app.js";

const PORT = process.env.PORT || 5000;

// --- Avvio del server dopo la connessione al DB ---
try {
  await connectDB();
  creaApp().listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT} (blockchain: ${process.env.BLOCKCHAIN_MODE ?? "mock"})`);
  });
} catch (err) {
  console.error("Errore di avvio:", err.message);
  process.exit(1); // interrompe l'avvio se il DB non è raggiungibile
}
