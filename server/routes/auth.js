const express = require("express");
const router = express.Router();
const {authorization} = require("../middlewares/authMiddleware");
const {signup, login, getMe, logout, resetPassword} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);

router.use(authorization);

router.get("/getMe", getMe);
router.delete("/logout", logout);
router.post("/resetPassword", resetPassword);

module.exports = router;