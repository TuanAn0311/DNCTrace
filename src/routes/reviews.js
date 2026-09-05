const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", reviewController.getReviews);
router.get("/:productId", reviewController.getReviewsByProduct);
router.post("/", verifyToken, reviewController.createReview);
router.put("/:id", verifyToken, reviewController.updateReview);
router.delete("/:id", verifyToken, reviewController.deleteReview);

module.exports = router;
