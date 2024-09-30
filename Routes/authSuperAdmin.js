require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchSuperAdmin = require('../middleware/superAdmin.js');

const shhh = process.env.JWT_SECRET;

// Route 1 : Creating a Super Admin
// Base link address = http://localhost:5000/auth/superAdmin
router.post('/createSuperAdmin', [
    body('email', 'Enter a valid email').isEmail(),
    body('username', 'Enter a valid username').isLength({ min: 3 }),
    body('password', 'Enter a valid password').isLength({ min: 8 }),
    body('phone', 'Enter a valid phone number').isLength({ min: 10, max: 10 }),
    body('isAdmin', 'Enter a valid response').isBoolean(),
    body('isSuperAdmin', 'Enter a valid response').isBoolean()
], async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        let success = false;
        return res.status(400).json({ success, error: result.array() });
    }

    try {
        let finding = await User.findOne({ email: req.body.email });
        if (finding) {
            let success = false;
            return res.status(400).json({ success, error: "Email already exists" });
        }

        // Opening account for new Super Admin
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        let newUser = await User.create({
            email: req.body.email,
            username: req.body.username,
            password: secPass,
            phone: req.body.phone,
            isAdmin: false,
            isSuperAdmin: true
        });

        const data = newUser.id;
        const authToken = jwt.sign(data, shhh);
        let success = true;
        res.status(200).json({ success, authToken });
    } catch (error) {
        res.status(400).json({ message: "Some Error Occurred" });
    }
});

// Route 2 : Logging in the Super Admin
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 8 })
], async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        let success = false;
        return res.status(400).json({ success, error: result.array() });
    }

    const { email, password } = req.body;

    try {
        // Checking email
        let findingSuperAdmin = await User.findOne({ email });
        if (!findingSuperAdmin) {
            let success = false;
            return res.status(400).json({ success, error: "Enter valid credentials to login" });
        }

        // Checking password
        const check = await bcrypt.compare(password, findingSuperAdmin.password);
        if (!check) {
            let success = false;
            return res.status(400).json({ success, error: "Enter valid credentials to login" });
        }

        const data = findingSuperAdmin.id;
        const authToken = jwt.sign(data, shhh);
        let success = true;
        res.status(200).json({ success, authToken });
    } catch (error) {
        res.status(400).send("Some Error Occurred");
    }
});

// Route 3 : Fetching Super Admin details
router.post('/fetchSuperAdmin', fetchSuperAdmin, async (req, res) => {
    try {
        let superAdminId = req.admin;
        const superAdminInfo = await User.findById(superAdminId).select('-password');
        res.send(superAdminInfo);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Some Error Occurred" });
    }
});

// Route 4: Delete Super Admin
router.delete('/deleteSuperAdmin/:id', async (req, res) => {
    try {
        let superAdminRecord = await superAdmin.findById(req.params.id); // Changed variable name
        if (!superAdminRecord) {
            return res.status(404).json({ error: "superAdmin not found" });
        }
        await superAdmin.findByIdAndDelete(req.params.id); // This is now unambiguous

        return res.status(200).json({ message: "superAdmin deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "some error occurred" }); // 500 for server error
    }
});
    

module.exports = router;
