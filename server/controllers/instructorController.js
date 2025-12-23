const {User} = require('../models/user');
const {Course} = require('../models/course');
const bcrypt = require('bcrypt');

const getInstructorCourses = async (req, res) => {
    try {
        const instructor = req.user;
        const courses = await Course.find({instructor: instructor._id});
        res.status(200).json({courses});

    } catch(error) {
        console.log("Error while getting instructor courses: ", error);
        res.status(500).json({error: error.message});
    }
}

const getInstructorStats = async (req, res) => {
    try {
        const instructor = req.user;
        
        // 1. Get the instructor's courses using the correct field (_id, not uid)
        const courses = await Course.find({ instructor: instructor._id });
        
        // Extract just the IDs into an array for the next query
        const courseIds = courses.map(course => course._id);
        
        // 2. Count total courses created
        const totalCourses = courses.length;

        // 3. Count unique students enrolled in ANY of these courses
        // We use $in to find users who have at least one of the instructor's course IDs in their list
        const totalStudents = await User.countDocuments({
            enrolledCourses: { $in: courseIds }
        });
        
        res.status(200).json({
            totalCourses,
            totalStudents,
            instructor: {
                name: instructor.name,
                email: instructor.email,
                bio: instructor.bio,
                expertise: instructor.expertise
            }
        });

    } catch(error) {
        console.log("Error while getting instructor stats: ", error);
        res.status(500).json({error: error.message});
    }
}

module.exports = {
    getInstructorCourses, 
    getInstructorStats
};

