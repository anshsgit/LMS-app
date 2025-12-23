const express = require('express');
const router = express.Router();
const {updateUser, getEnrolledCourses, deleteUser, purchaseCourse} = require('../controllers/userController');
const {authorization} = require("../middlewares/authMiddleware");
const {getAllCourses, getCourse} = require("../controllers/courseController");

// Middleware to ensure only users can access these routes
const userOnly = (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({error: 'Access denied. User role required.'});
    }
    next();
};

router.use(authorization);

router.delete("/delete", deleteUser);
router.put("/update", updateUser);

router.use(userOnly);

router.get("/getEnrolledCourses", getEnrolledCourses);
router.get("/get", getAllCourses);
router.get("/get/:id", getCourse);
router.put("/purchase", purchaseCourse);

module.exports = router;