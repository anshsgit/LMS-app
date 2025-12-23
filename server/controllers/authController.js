const {User} = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid');
const {z} = require("zod");
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const upperCaseRegex = /[A-Z]/;
    const lowerCaseRegex = /[a-z]/;

const signup = async (req, res) => {
    const baseSchema = z.object({
        name: z.string().min(3).max(50),
        email: z.email().max(50).transform(v => v.toLowerCase()),
        password: z.string()
          .min(8, { message: "Must be 8 char long." })
          .max(50)
          .regex(specialCharRegex, { message: "Must contain one special char." })
          .regex(upperCaseRegex, { message: "Must contain one upper case char." })
          .regex(lowerCaseRegex, { message: "Must contain one lower case char." }),
        photo: z.string().optional(),
        role: z.enum(['user', 'instructor']),
        bio: z.string().optional(),
        expertise: z.array(z.string()).optional()
      });

      const refinedSchema = baseSchema.refine(data => {
        if (data.role === 'instructor') {
          // Require at least one of bio or expertise
          return (data.bio && data.bio.length > 0) && 
                 (data.expertise && data.expertise.length > 0);
        }
        return true;  // No extra requirement if role is user
      }, {
        message: "Bio and expertise is required if role is instructor",
        path: ["bio", "expertise"]
      });
      
        const parsedData = refinedSchema.safeParse(req.body);
      if(!parsedData.success) {

            return res.status(400).json({
                message: "Incorrect format.",
                error: parsedData.error
            })

        } else {
            try {
                const {name, email, password, photo, role, bio, expertise} = parsedData.data;
            const user = await User.findOne({email});
            if(!user) {
                const hashPassword = await bcrypt.hash(password, 10);
                const userDb = new User({
                    name,
                    email,
                    password: hashPassword,
                    photo,
                    role,
                    points: (role === "user")? 1000 : undefined,
                    bio,
                    expertise
                })
                const newUser = await userDb.save();

                const token = jwt.sign({_id: newUser._id}, process.env.secret);
                res.cookie('token', token, {httpOnly: true, sameSite: true}).status(200).json({message: 'Signed up successfully.'});
                
            } else {
                res.status(400).json({message: 'User alredy exists'})
            }

        } catch(error) {
            console.log("Error in registering the user: ", error);
            res.status(500).json({error: error.message});
        }
        }
}

const login = async (req, res) => {
    try{
    const {email, password} = req.body;
    const user = await User.findOne({email});
    let isPassword;
    if(user) {
    isPassword = await bcrypt.compare(password, user.password);
    }

    if(user && isPassword) {
        const token = jwt.sign({_id: user._id}, process.env.secret);
        res.cookie('token', token, {httpOnly: true, sameSite: true}).status(200).json({message: 'Logged in successfully.', token});

    } else {
        res.status(400).json({message: 'Either email or password is incorrect.'});
    }

    } catch(error) {
        console.log("Error while loggin in: ", error);
        res.status(500).json({error: error.message});
    }
} 

const getMe = (req, res) => {
    const {name, email, role} = req.user;
    res.status(200).json({name, email, role});
}

const logout = (req, res) => {
    res.clearCookie('token', {httpOnly: true, sameSite: true});
    res.status(200).json({message: 'Token deleted successfully.'});  
}

const resetPassword = async (req, res) => {
    try {
        const isPassword = await bcrypt.compare(req.body.password, req.user.password);
    if(!isPassword) {

        const passwordSchema = z.string().min(8,{message: "Must be 8 char long."}).max(50).regex(specialCharRegex, {message: "password must contain one special case character."}).regex(upperCaseRegex, {message: "password must contain one upper case character."}).regex(lowerCaseRegex, {message: "password must contain one lower case character."});

        const validatedPass = passwordSchema.safeParse(req.body.password);
        if(validatedPass.success) {
            const hashPassword = await bcrypt.hash(req.body.password, 10);
            const newUser = await User.findByIdAndUpdate(
                {_id: req.user._id},
                { $set: {password: hashPassword} }
            )
            res.status(200).json({message: "Password created successfully."});
        } else {
            res.status(401).json({message: "Invalid password."});
            
        }

    }
    } catch(error) {
        console.error(error);
        res.status(500).json({error: error.message});

    }
    
}

module.exports = {signup, login, getMe, logout, resetPassword};