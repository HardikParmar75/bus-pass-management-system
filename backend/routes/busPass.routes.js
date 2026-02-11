const express = require("express");
const router = express.Router();
const { buyPass, getUserPasses, verifyPass } = require("../controllers/busPass.controller");
const { protectUser } = require("../middleware/auth");

// Buy a new bus pass (user only)
router.post("/buy", protectUser, buyPass);

// Get all passes for the logged-in user
router.get("/my-passes", protectUser, getUserPasses);

// Verify a bus pass using QR token or code (public — so admin scanner can hit it)
router.post("/verify", verifyPass);

module.exports = router;
