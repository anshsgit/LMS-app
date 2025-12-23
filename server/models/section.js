const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    title : {type: String, required: true},
    lessons: [{type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'}],
    quiz: [{type: mongoose.Schema.Types.ObjectId, ref: 'Quiz'}]
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = {Section};