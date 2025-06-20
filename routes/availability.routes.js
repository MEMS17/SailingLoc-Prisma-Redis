import express from "express";
import { createClient } from "redis";
import { randomUUID } from "crypto";

const router = express.Router();

const redisClient = createClient({
  socket: { host: "redis", port: 6379 }
});
redisClient.connect().catch(console.error);

// CREATE - Ajouter une disponibilité
router.post("/availability", async (req, res) => {
  const { start_date, end_date, status } = req.body;
  const id = randomUUID();
  const availability = { id, start_date, end_date, status };

  try {
    await redisClient.set(`availability:${id}`, JSON.stringify(availability));
    res.status(201).json(availability);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la création", details: err.message });
  }
});

// READ ALL - Obtenir toutes les disponibilités
router.get("/availability", async (req, res) => {
  try {
    const keys = await redisClient.keys("availability:*");
    const results = await Promise.all(keys.map(key => redisClient.get(key)));
    const availabilities = results.map(JSON.parse);
    res.json(availabilities);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération", details: err.message });
  }
});

// READ ONE - Obtenir une disponibilité par ID
router.get("/availability/:id", async (req, res) => {
  const key = `availability:${req.params.id}`;
  try {
    const value = await redisClient.get(key);
    if (value) res.json(JSON.parse(value));
    else res.status(404).json({ error: "Disponibilité non trouvée" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération", details: err.message });
  }
});

// UPDATE - Modifier une disponibilité
router.put("/availability/:id", async (req, res) => {
  const key = `availability:${req.params.id}`;
  try {
    const existing = await redisClient.get(key);
    if (!existing) return res.status(404).json({ error: "Disponibilité non trouvée" });

    const updated = { ...JSON.parse(existing), ...req.body, id: req.params.id };
    await redisClient.set(key, JSON.stringify(updated));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour", details: err.message });
  }
});

// DELETE - Supprimer une disponibilité
router.delete("/availability/:id", async (req, res) => {
  const key = `availability:${req.params.id}`;
  try {
    const result = await redisClient.del(key);
    if (result) res.json({ message: "Disponibilité supprimée" });
    else res.status(404).json({ error: "Disponibilité non trouvée" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression", details: err.message });
  }
});

export default router;
