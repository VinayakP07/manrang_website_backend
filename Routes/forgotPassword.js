require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const Otp = require('../models/Otp.js');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/userInfo');
const nodemailer = require('nodemailer');


const shhh = process.env.JWT_SECRET;

// Base Link - http://localhost:5000/forgotPassword


router.post('/', [
    body('email', 'Please enter a valid email').isEmail(),
], async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found!! Enter Registered email' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time to 5 minutes from now
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP and its expiration time to the database
    const newOtp = new Otp({ email, otp, expirationTime });
    await newOtp.save();

    // Send OTP via email using nodemailer
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Password Reset OTP',
        text: `Your OTP for password reset is ${otp}. It will expire in 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
        } else {
            return res.status(200).json({ message: 'OTP sent successfully to your email!' });
        }
    });
});


// Verify OTP and Change Password
router.post('/verify-otp', [
    body('email', 'Please enter a valid email').isEmail(),
    body('otp', 'Please enter a valid OTP').isLength({ min: 6, max: 6 }),
    body('newPassword', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('confirmPassword', 'Confirm password must match').custom((value, { req }) => value === req.body.newPassword)
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, newPassword, confirmPassword } = req.body;

    // Check if the OTP exists for the given email
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid OTP or email' });
    }

    // Check if the OTP is expired
    if (otpRecord.expirationTime < new Date()) {
        return res.status(400).json({ message: 'OTP has expired' });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Remove the OTP from the database after successful password reset
    await Otp.deleteOne({ email, otp });

    return res.status(200).json({ message: 'Password reset successfully' });
});

module.exports = router;