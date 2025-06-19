const express = require("express");
const router = express.Router();
const kosController = require("../controllers/kosController");

router.get("/rating", kosController.lihatRating);
router.post("/rating", kosController.kasihRating);
router.get("/rating-list", kosController.lihatListRating);

module.exports = router;
