const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    coverImage: { type: String, required: true },
    price: { type: Number, required: true },
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalDuration: { type: Number, default: 0 }
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);

module.exports = { Course };