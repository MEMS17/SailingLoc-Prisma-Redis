import express from "express";
import boatRoutes from "./routes/boat.routes.js";
import { createClient } from "redis";
import availabilityRoutes from "./routes/availability.routes.js";


const app = express();
app.use(express.json());

app.use("/boats", boatRoutes);
app.use("/", availabilityRoutes);

// Connexion à Redis
const redisClient = createClient({
  socket: {
    host: "redis",  // nom du service Docker
    port: 6379
  }
});

// Connexion Redis
redisClient.connect()
  .then(() => console.log("Connexion à Redis établie"))
  .catch(err => console.error("Erreur de connexion à Redis :", err));


// Lancement du serveur
app.listen(3000, () => {
  console.log("Serveur démarré sur http://localhost:3000");
});
