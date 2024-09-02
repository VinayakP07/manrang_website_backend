require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchSuperAdmin = require('../middleware/superAdmin.js');


const shhh = process.env.JWT_SECRET;

// Route 1 : Creating a Admin
// Base link address = http://localhost:5000/auth/superAdmin

router.post('/createSuperAdmin',[
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
        
        // opening account for new Super admin
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        let newUser = await User.create({
            email : req.body.email,
            username : req.body.username,
            password : secPass,
            phone : req.body.phone,
            isAdmin : false,
            isSuperAdmin : true
        })

        const data = newUser.id

        const authToken = jwt.sign(data , shhh);
        let success = true;
        res.status(200).json({success,authToken});
    } catch (error) {
        res.status(400).json({ message: "Some Error Occured" });
    }
});



 // Route : 2 : Logging in the Super admin
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
        let findingSuperAdmin = await User.findOne({email : email});
        if(!findingSuperAdmin){
    let success = false;
            return res.status(400).json({success,error : "Enter valid credentials to login"});
        }
        
        // checking password
        const check = await bcrypt.compare(password , findingSuperAdmin.password);
        if(!check){
    let success = false;
            return res.status(400).json({success,error : "Enter valid credentials to login"});
        }

        const data = findingSuperAdmin.id;

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
    router.post('/fetchSuperAdmin', fetchSuperAdmin ,async (req,res)=>{
        try {
            let SuperAdminId = await req.admin;
            const SuperAdminInfo = await User.findById(SuperAdminId).select('-password');
            res.send(SuperAdminInfo);
            // res.send(adminInfo.email);
        } catch (e) {
            console.log(e);
            res.status(400).json({error : "Some Error Occured"});
        }
    });

module.exports = router;