const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
        question: {type: String, required: true},
        options: [{type: String, required: true}],
        correctIndex: {type: Number, required: true}
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = {Quiz};