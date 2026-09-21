import mongoose from "mongoose";

// Connessione a MongoDB Atlas.
// La connection string viene letta dalla variabile d'ambiente MONGO_URI (file .env).
export async function connectDB(uri = process.env.MONGO_URI ?? process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error("MONGO_URI non definita: controlla il file .env");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB Atlas: connesso");
}
