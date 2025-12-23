const express = require('express');
const router = express.Router();
const {updateUser, deleteUser} = require("../controllers/userController");
const {getInstructorCourses, getInstructorStats} = require('../controllers/instructorController');
const {authorization} = require("../middlewares/authMiddleware");
const {createCourse, createSection, createLesson} = require("../controllers/courseController");

// Middleware to ensure only instructors can access these routes
const instructorOnly = (req, res, next) => {
    if (req.user.role !== 'instructor') {
        return res.status(403).json({error: 'Access denied. Instructor role required.'});
    }
    next();
};

router.use(authorization);
router.use(instructorOnly);

router.get("/courses", getInstructorCourses);
router.get("/stats", getInstructorStats);
router.post("/create", createCourse);
router.post("/sections/:courseId", createSection);
router.post("/lessons/:sectionId", createLesson);

module.exports = router;

