const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    photo: {type: String},
    points: {type: Number},
    role: {type: String, enum: ['user', 'instructor'], default: 'user'},
    enrolledCourses: {
        type: [mongoose.Schema.Types.ObjectId],
        default: undefined
    },
    bio: {
        type: String,
        validator: function(value) {
            if(this.role === 'instructor') {
                return value && value.length>0;
            }
            return true;
        },
        message: "Bio is required if role is instructor."
    },
    expertise: {
        type: [String],
        validator: function(value) {
            if(this.role === "instructor") {
                return value && value.length>0;
            }
            return true;
        },
        message: "Expertise is required if role is instructor.",
        default: undefined
    }
});

const User = mongoose.model("User", userSchema);

module.exports = {User};