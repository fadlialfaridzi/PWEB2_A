const express = require("express");
const router = express.Router();
const kosController = require("../controllers/kosController");

router.get("/rating", kosController.lihatRating);
router.post("/rating", kosController.kasihRating);

module.exports = router;
