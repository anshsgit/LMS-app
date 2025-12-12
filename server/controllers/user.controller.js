import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken.js';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });

        if(existingUser) {
            return res.status(400).json({ message: "User already exists" });

        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ name, email, password: hashedPassword });
            await newUser.save();
            generateToken(res, newUser, "Registration successful");
        }

    } catch (error) {
        console.error("Error in user registration:", error.message);
        return res.status(500).json({ message: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }
        generateToken(res, user, "Login successful");

    } catch (error) {
        console.error("Error in user login:", error.message);
        return res.status(500).json({ message: error.message });
    }
}