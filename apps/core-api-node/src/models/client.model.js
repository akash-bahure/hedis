const express = require("express");
const router = express.Router();

const clientController = require("../controllers/client.controller");

// CRUD APIs
router.post("/", clientController.createClient);
router.get("/", clientController.getClients);
router.get("/:id", clientController.getClientById);
router.patch("/:id", clientController.updateClient);
router.delete("/:id", clientController.deleteClient);

module.exports = router;