require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchAdmin = require('../middleware/adminInfo');


const shhh = process.env.JWT_SECRET;

// Route 1 : Creating a Admin
// Base link address = http://localhost:5000/auth/admin

router.post('/createAdmin',[
    body('email','Enter valid email').isEmail(),
    body('username','Enter valid username').isLength({min : 3}),
    body('password','Enter valid password').isLength({min : 8}),
    body('phone','Enter valid phone number').isLength({min : 10, max : 10}),
    body('isAdmin','Enter valid response'),
    body('isSuperAdmin','Enter valid response')
] ,async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        let success = false;
        return res.status(400).json({success,error : result.array()});
    }

    try {
        let finding = await User.findOne({email : req.body.email});
        if(finding){
        let success = false;
            return res.status(400).json({success,error : "Email already exist"});
        }
        
        // opening account for new admin
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        let newUser = await User.create({
            email : req.body.email,
            username : req.body.username,
            password : secPass,
            phone : req.body.phone,
            isAdmin : true,
            isSuperAdmin : false
        })

        const data = newUser.id

        const authToken = jwt.sign(data , shhh);
        let success = true;
        res.status(200).json({success,authToken});
    } catch (error) {
        res.status(400).json({ message: "Some Error Occured" });
    }
});



 // Route : 2 : Logging in the admin
 router.post('/login',[
    body('email','Enter valid email').isEmail(),
    body('password','Enter valid password').isLength({min : 8})],async (req,res)=>{

    const result = validationResult(req);
    if (!result.isEmpty()) {
    let success = false;
        return res.status(400).json({success,error : result.array()});
    }
    
    const {email , password} = req.body;

    try{

        // checking email
        let findingAdmin = await User.findOne({email : email});
        if(!findingAdmin){
    let success = false;
            return res.status(400).json({success,error : "Enter valid credentials to login"});
        }
        
        // checking password
        const check = await bcrypt.compare(password , findingAdmin.password);
        if(!check){
    let success = false;
            return res.status(400).json({success,error : "Enter valid credentials to login"});
        }

        const data = findingAdmin.id;

        const authToken = jwt.sign(data , shhh);
    let success = true;
        res.status(200).json({success,authtoken : authToken});
    } 
    catch (e){
        // console.log(e);
        res.status(400).send("Some Error Occured");
    }
    });


    // Route 3 : Fetching admin details
    router.post('/fetchAdmin', fetchAdmin ,async (req,res)=>{
        try {
            let adminId = await req.admin;
            const adminInfo = await User.findById(adminId).select('-password');
            res.send(adminInfo);
            // res.send(adminInfo.email);
        } catch (e) {
            console.log(e);
            res.status(400).json({error : "Some Error Occured"});
        }
    });

      // Route : 2 : Deleting the Admin
 router.delete('/deleteAdmin/:id' ,async (req, res) => {
    try {
        let admin = await User.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Admin deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Some Error Occurred" });
    }
});

module.exports = router;