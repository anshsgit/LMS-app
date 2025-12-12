import jwt from 'jsonwebtoken';

export const generateToken = (res, user, message) => {
    const payload = {
        id: user._id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).cookie('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day   
    }).json({ message });       
}