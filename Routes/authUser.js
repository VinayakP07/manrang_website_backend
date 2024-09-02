require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/userInfo');


const shhh = process.env.JWT_SECRET;

// Route 1 : Creating a User
// Base link address = http://localhost:5000/auth/user

router.post('/createUser',[
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
            isAdmin : false,
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



 // Route : 2 : Logging in the user
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
        let findingUser = await User.findOne({email : email});
        if(!findingUser){
    let success = false;
            return res.status(400).json({success,error : "Enter valid credentials to login"});
        }
        
        // checking password
        const check = await bcrypt.compare(password , findingUser.password);
        if(!check){
    let success = false;
            return res.status(400).json({success,error : "Enter valid credentials to login"});
        }

        const data = findingUser.id;

        const authToken = jwt.sign(data , shhh);
    let success = true;
        res.status(200).json({success,authtoken : authToken});
    } 
    catch (e){
        // console.log(e);
        res.status(400).send("Some Error Occured");
    }
    });


    // Route 3 : Fetching user details
    router.post('/fetchUser', fetchUser ,async (req,res)=>{
        try {
            let userId = await req.user;
            const userInfo = await User.findById(userId).select('-password');
            res.send(userInfo);
            // res.send(userInfo.email);
        } catch (e) {
            console.log(e);
            res.status(400).json({error : "Some Error Occured"});
        }
    });

module.exports = router;