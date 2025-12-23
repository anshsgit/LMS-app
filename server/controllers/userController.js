const {User} = require('../models/user');
const {Course} = require('../models/course');
const {Section} = require('../models/section');
const {Review} = require('../models/review');
const {Quiz} = require('../models/quiz');
const {Lesson} = require('../models/lesson');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const {z} = require('zod');

const normalizeToArray = (value) => {
    if(!value && value !== 0) return [];
    return Array.isArray(value) ? value : [value];
};

const updateUser = async (req, res) => {
    try{
        // Zod validation schema for update fields
        const updateSchema = z.object({
            name: z.string().min(3).max(50).optional(),
            email: z.email().transform(v => v.toLowerCase()).optional(),
            photo: z.string().optional(),
            bio: z.string().min(1).optional(),
            expertise: z.union([
                z.array(z.string()),
                z.object({
                    replace: z.array(z.string()).optional(),
                    add: z.array(z.string()).optional(),
                    remove: z.array(z.string()).optional(),
                    toggle: z.array(z.string()).optional()
                })
            ]).optional()
        });

        const validatedData = updateSchema.safeParse(req.body);
        if (!validatedData.success) {
            return res.status(400).json({
                message: "Incorrect format.",
                error: validatedData.error
            });
        }

        const user = req.user;
        const {name, email, photo, role, bio, expertise} = validatedData.data;
        const allowedRoles = ['user', 'instructor'];
        
        // Update basic fields
        if(name) {
            user.name = name;
        }

        if(email) {
            user.email = email;
        }

        if(photo) {
            user.photo = photo;
        }

        if(bio && user.role === 'instructor') {
            user.bio = bio;
        }

        if(user.role === "instructor" && expertise !== undefined) {
            const currentExpertise = Array.isArray(user.expertise) ? [...user.expertise] : [];
            let updatedExpertise = currentExpertise;

            if(Array.isArray(expertise)) {
                updatedExpertise = [...new Set(expertise)];

            } else if(typeof expertise === 'object' && expertise !== null) {
                if(expertise.replace !== undefined) {
                    updatedExpertise = [...new Set(normalizeToArray(expertise.replace))];
                    
                }

                if(expertise.add !== undefined) {
                    updatedExpertise = [...new Set([...updatedExpertise, ...normalizeToArray(expertise.add)])];
                }

                if(expertise.remove !== undefined) {
                    const removalSet = new Set(normalizeToArray(expertise.remove));
                    updatedExpertise = updatedExpertise.filter(item => !removalSet.has(item));
                }

                if(expertise.toggle !== undefined) {
                    const toggleValues = normalizeToArray(expertise.toggle);
                    toggleValues.forEach(value => {
                        const index = updatedExpertise.indexOf(value);
                        if(index > -1) {
                            updatedExpertise.splice(index, 1);
                        } else {
                            updatedExpertise.push(value);
                        }
                    });
                }
            } else {
                updatedExpertise = [...new Set(normalizeToArray(expertise))];
            }

            user.expertise = updatedExpertise;
        }

        await user.save();
        res.status(200).json({message: 'User updated successfully'});

    } catch(error) {
        console.log("Error: ", error);
        res.status(400).json({error: error.message});
    }
}

const getEnrolledCourses = async (req, res) => {
    try {
        const user = req.user;
        const ids = Array.isArray(user.enrolledCourses) ? user.enrolledCourses : [];
        const courses = await Course.find({_id: { $in: ids }})
        res.status(200).json({courses});

    } catch(error) {
        console.log("Error while displaying enrolled courses: ", error);
        res.status(500).json({error: error.message});
    }
}

const deleteUser = async (req, res) => {
    try {
        if (req.user.role === "instructor") {
            // 1. Find all courses owned by this instructor
            const courses = await Course.find({ instructor: req.user._id });

            for (const course of courses) {
                // 2. For each course, find the sections to get lesson IDs
                const sections = await Section.find({ _id: { $in: course.sections } });

                for (const section of sections) {
                    // 3. Delete all lessons associated with this section
                    await Lesson.deleteMany({ _id: { $in: section.lessons } });
                    
                    // 4. (Optional) If you have quizzes, delete them here too
                    await Quiz.deleteMany({ _id: { $in: section.quiz } });
                }

                // 5. Delete all sections associated with this course
                await Section.deleteMany({ _id: { $in: course.sections } });
            }

            // 6. Delete all courses owned by the instructor
            await Course.deleteMany({ instructor: req.user._id });
            
            // 7. Finally, delete the instructor
            await User.deleteOne({ uid: req.user.uid });
        } else {
            // Logic for a regular user deletion
            await User.deleteOne({ uid: req.user.uid });
        }

        res.status(200).json({ message: "User and all associated content deleted successfully." });

    } catch (error) {
        console.log('Error while deleting the user: ', error);
        res.status(400).json({ error: error.message });
    }
}

const purchaseCourse = async (req, res) => {
    // 1. Start a Session
    const session = await mongoose.startSession();
    
    try {
        // 2. Start the Transaction
        session.startTransaction();

        const courseId = req.body.courseId;
        const user = req.user;
        const objectId = new mongoose.Types.ObjectId(courseId);

        // check if already enrolled (logic remains same)
        if (user.enrolledCourses?.some(u => u.toString() === objectId.toString())) {
            await session.abortTransaction();
            return res.status(200).json({ message: 'Course already exists.' });
        }

        const course = await Course.findById(objectId).session(session);
        if (!course) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Course does not exist.' });
        }

        if (user.points < course.price) {
            await session.abortTransaction();
            return res.status(200).json({ message: 'Insufficient balance.' });
        }

        // 3. Perform operations WITHIN the session
        // Deduct points
        user.points -= course.price;
        user.enrolledCourses.push(objectId);

        // Save using the session
        await user.save({ session });

        // 4. Commit the Transaction
        // If it reaches here, both the points and the enrollment are saved permanently
        await session.commitTransaction();
        res.status(200).json({ message: 'Purchased Successfully' });

    } catch (error) {
        // 5. Rollback on Error
        // If the server crashes or any error occurs, the points are NOT deducted
        await session.abortTransaction();
        console.log('Error in purchaseCourse: ', error);
        res.status(500).json({ error: error.message });
    } finally {
        // 6. End the session
        session.endSession();
    }
};

module.exports = {
    updateUser, getEnrolledCourses, deleteUser, purchaseCourse
};