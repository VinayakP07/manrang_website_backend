require('dotenv').config();
const express = require('express');
const router = express.Router();
const Complain = require('../models/Complain.js');
const { body, validationResult } = require('express-validator');
const superAdmin = require('../middleware/superAdmin.js');
const User = require('../middleware/userInfo.js');


// const shhh = process.env.JWT_SECRET;

// Route 1 : Adding complains
// Base link address = http://localhost:5000/user/complains

router.post('/addComplains',User  ,[
    body('subject','Enter valid Subject'),
    body('description','Enter the description')
   
] ,async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        let success = false;
        return res.status(400).json({success,error : result.array()});
    }

    try {
        const userId = await req.user; 
        let finding = await Complain.findOne({subject : req.body.subject, userId: userId });
        if(finding){
        let success = false;
            return res.status(400).json({success,error : "Complain already exits"});
        }
        
        // Adding new complain
        let newComplain = await Complain.create({
            subject : req.body.subject,
            description : req.body.description,
            userId: userId            
        })
        const saveComplain = await newComplain.save();
        res.status(200).json(saveComplain);
    } catch (error) {
        res.status(400).json({ message: "Some Error Occured" });
    }
});



 // Route : 2 : Deleting the Complain
 router.delete('/deleteComplain/:id',async (req, res) => {
    try {
        let cloth = await Complain.findById(req.params.id);
        if (!cloth) {
            return res.status(404).json({ error: "Complain not found" });
        }
        await Complain.findByIdAndDelete(req.params.id);
        res.json({ message: "Complain deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Some Error Occurred" });
    }
});



// Route 3 : To update the complain
router.put(
    '/updateComplain/:id',
    [
        body('subject').optional().isString(),
        body('description').optional().isString()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { subject, description } = req.body;
            const updateComplain = {};
            if (subject) updateComplain.subject = subject;
            if (description) updateComplain.description = description;
           

            let complain = await Complain.findById(req.params.id);
            if (!complain) {
                return res.status(404).json({ error: "Complains not found" });
            }

            complain = await Complain.findByIdAndUpdate(req.params.id, { $set: updateComplain }, { new: true });

            res.status(200).json(complain);

        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: "Some Error Occurred" });
        }
    }
);



    // Route 4 : Fetching all complains
    router.get('/fetchComplains', async (req, res) => {
        try {
            const complains = await Complain.find();
            res.status(200).json(complains);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: "Some error occurred" });
        }
    });


        // Route 5: Fetching specific user's complaints
router.get('/specificFetchComplains',User, async (req, res) => {
    try {
        const userId = await req.user; 
        const complains = await Complain.find({ userId: userId });

        if (!complains.length) {
            return res.status(404).json({ message: "No complaints found for this user." });
        }

        res.status(200).json(complains);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Some error occurred" });
    }
});

        
    

module.exports = router;