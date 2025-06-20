// routes/boat.routes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { ObjectId } from "bson";

const router = express.Router();
const prisma = new PrismaClient();

// CREATE - Ajouter un bateau
router.post("/", async (req, res) => {
  const { name, type, year } = req.body;

  // Vérification : year est requis et doit être un nombre
  if (year === undefined || isNaN(Number(year))) {
    return res.status(400).json({
      error: "Erreur de validation",
      details: {
        year: "L'année doit être un nombre valide"
      }
    });
  }

  const parsedYear = parseInt(year);
  const currentYear = new Date().getFullYear();

  // Vérification : year dans une plage raisonnable
  if (parsedYear < 1900 || parsedYear > currentYear) {
    return res.status(400).json({
      error: "Erreur de validation",
      details: {
        year: `L'année doit être comprise entre 1900 et ${currentYear}`
      }
    });
  }

  try {
    const newBoat = await prisma.Boat.create({
      data: { name, type, year: parsedYear },
    });
    res.status(201).json(newBoat);
  } catch (error) {
    console.error("Erreur création bateau :", error);
    res.status(500).json({
      error: "Erreur lors de la création du bateau",
      details: error.message,
    });
  }
});


// READ ALL - Liste des bateaux
router.get("/", async (req, res) => {
  try {
    const boats = await prisma.Boat.findMany();
    res.json(boats);
  } catch (error) {
    console.error("Erreur récupération bateaux :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des bateaux", details: error.message });
  }
});

// READ ONE - Obtenir un bateau
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const boat = await prisma.Boat.findUnique({
      where: { id: new ObjectId(id) },
    });
    if (boat) res.json(boat);
    else res.status(404).json({ error: "Bateau non trouvé" });
  } catch (error) {
    console.error("Erreur récupération bateau :", error);
    res.status(500).json({ error: "Erreur lors de la récupération du bateau", details: error.message });
  }
});

// UPDATE - Modifier un bateau
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, year } = req.body;
  try {
    const updatedBoat = await prisma.Boat.update({
      where: { id: new ObjectId(id) },
      data: { name, type, year: parseInt(year) },
    });
    res.json(updatedBoat);
  } catch (error) {
    console.error("Erreur mise à jour bateau :", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du bateau", details: error.message });
  }
});

// DELETE - Supprimer un bateau
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.Boat.delete({
      where: { id: new ObjectId(id) },
    });
    res.json({ message: "Bateau supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression bateau :", error);
    res.status(500).json({ error: "Erreur lors de la suppression du bateau", details: error.message });
  }
});

export default router;
