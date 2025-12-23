const jwt = require('jsonwebtoken');
const {User} = require('../models/user');

const authorization = async (req, res, next) => {
    const token = req.cookies.token;
    try {
        const verify = jwt.verify(token, process.env.secret);
        const user = await User.findOne({_id: verify.uid});
        req.user = user;
        next();

    } catch(error) {
        console.log("Error in verifying the user: ", error);
        res.status(400).json({ error: error.message});
    }
    
}

module.exports = {authorization};