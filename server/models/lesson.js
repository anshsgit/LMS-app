const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {type: String, required: true},
    videoUrl: {type: String, required: true},
    description: {type: String},
    duration: {type: Number},
    isFreePreview:{type: Boolean, default: false}
}, {timestamps: true});

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = {Lesson};