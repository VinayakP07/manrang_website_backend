// add
// delete
// update
// fetch

require('dotenv').config();
const User = require('../middleware/userInfo.js');
const express = require('express');
const router = express.Router();
const Address = require('../models/Address.js');
const { body, validationResult } = require('express-validator');

// Route 1 : Adding an address
// Base link address = http://localhost:5000/user/address


router.post('/addAddress', User, [
    body('houseno', 'Enter a valid house number').notEmpty(),
    body('street', 'Enter a valid street').notEmpty(),
    body('landmark', 'Enter a valid landmark').notEmpty(),
    body('city', 'Enter a valid city').notEmpty(),
    body('state', 'Enter a valid state').notEmpty(),
    body('pincode', 'Enter a valid pincode').notEmpty()
], async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        let success = false;
        return res.status(400).json({ success, errors: result.array() });
    }

    try {
        // Check if req.user is populated correctly
        const userId = req.user; 
        if (!userId) {
            return res.status(400).json({ message: "User not found" });
        }

        let newAddress = await Address.create({
            houseno: req.body.houseno,
            street: req.body.street,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            userId: userId
        });
        
        const savedAddress = await newAddress.save();
        res.status(200).json(savedAddress);
    } catch (error) {
        // Log the actual error for debugging
        console.error(error);
        res.status(500).json({ message: "Some Error Occurred", error: error.message });
    }
});

// Route 2 : Deleting an address
router.delete('/deleteAddress/:id', async (req, res) => {
    try {
        let address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ error: "Address not found" });
        }

        await Address.findByIdAndDelete(req.params.id);
        res.json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Some Error Occurred" });
    }
});

// Route 3 : Updating an address
router.put(
    '/updateAddress/:id',
    [
        body('houseno').optional().isString(),
        body('street').optional().isString(),
        body('landmark').optional().isString(),
        body('city').optional().isString(),
        body('state').optional().isString(),
        body('pincode').optional().isNumeric()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { houseno, street, landmark, city, state, pincode } = req.body;
            const updateAddress = {};
            if (houseno) updateAddress.houseno = houseno;
            if (street) updateAddress.street = street;
            if (landmark) updateAddress.landmark = landmark;
            if (city) updateAddress.city = city;
            if (state) updateAddress.state = state;
            if (pincode) updateAddress.pincode = pincode;

            let address = await Address.findById(req.params.id);
            if (!address) {
                return res.status(404).json({ error: "Address not found" });
            }

            address = await Address.findByIdAndUpdate(req.params.id, { $set: updateAddress }, { new: true });

            res.status(200).json(address);

        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: "Some Error Occurred" });
        }
    }
);

// Route 4 : Fetching all addresses
router.get('/fetchAddresses', User ,async (req, res) => {
    try {
        const userId = await req.user;
        const addresses = await Address.find({userId : userId});

        if (!addresses.length) {
            return res.status(404).json({ message: "No Address found for this user." });
        }

        res.status(200).json(addresses);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Some error occurred" });
    }
});

module.exports = router;
