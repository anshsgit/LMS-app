const {Course} = require('../models/course');
const {Section} = require('../models/section');
const {Lesson} = require('../models/lesson');
const {Quiz} = require('../models/quiz');
const mongoose = require('mongoose');

const getAllCourses = async (req, res) => {
    try{
        const courses = await Course.find({});
        res.status(200).json({courses});

    }   catch(error) {
            console.log("Error while getting all the courses: ", error);
            res.status(500).json({error: error.message});
}
}

const getCourse = async (req, res) => {
    try {
    const courseId = req.params.id;
    const course = await Course.findOne({_id: courseId});
    res.status(200).json(course);

    }catch(error) {
        console.log("Error in getting a course: ", error);
        res.status(500).json({error: error.message});
    }

}
const { z } = require('zod');

// 1. Define Validation Schemas
const courseSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).optional(),
    category: z.string().min(2),
    coverImage: z.string().url({ message: "Invalid cover image URL" }),
    price: z.number().min(0)
});

const sectionSchema = z.object({
    title: z.string().min(2).max(100)
});

const lessonSchema = z.object({
    title: z.string().min(2).max(100),
    videoUrl: z.string().url({ message: "Invalid video URL" }),
    description: z.string().optional(),
    duration: z.number().min(1).optional(),
    isFreePreview: z.boolean().default(false)
});

// 2. Updated Controller Functions
const createCourse = async (req, res) => {
    // Validate request body
    const result = courseSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
    }

    const { title, description, category, coverImage, price } = result.data;
    const instructor = req.user._id;

    try {
        const newCourse = new Course({
            title,
            description,
            category,
            coverImage,
            price,
            instructor
        });

        await newCourse.save();
        res.status(200).json({ message: "Course created successfully.", course: newCourse });
    } catch (error) {
        console.log("Error in creating the course: ", error.message);
        res.status(500).json({ error: error.message });
    }
};

const createSection = async (req, res) => {
    const result = sectionSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
    }

    const { title } = result.data;
    const { courseId } = req.params;

    try {
        const newSection = new Section({ title });
        const savedSection = await newSection.save();

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $addToSet: { sections: savedSection._id } },
            { new: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.status(200).json({ message: "Section created successfully.", section: savedSection });
    } catch (error) {
        console.log("Error while creating the section: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

const createLesson = async (req, res) => {
    const result = lessonSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
    }

    const { title, videoUrl, description, duration, isFreePreview } = result.data;
    const { sectionId } = req.params;

    try {
        const newLesson = new Lesson({
            title,
            videoUrl,
            description,
            duration,
            isFreePreview
        });

        const savedLesson = await newLesson.save();
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            { $addToSet: { lessons: savedLesson._id } },
            { new: true }
        );

        if (!updatedSection) {
            return res.status(404).json({ error: "Section not found" });
        }

        res.status(200).json({ message: "Lesson created successfully.", lesson: savedLesson });
    } catch (error) {
        console.log("Error while creating the lesson: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {getAllCourses, getCourse, createCourse, createSection, createLesson}