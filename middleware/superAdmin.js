require('dotenv').config();
const { application } = require('express');
const jwt = require('jsonwebtoken');

const shhh = process.env.JWT_SECRET;

const fetchSuperAdmin = (req, res, next) =>{
        const token = req.header('auth_token');
        if(!token){
            res.status(400).json({error : "Enter valid token"});
        }
    try {
        let data = jwt.verify(token, shhh);
        req.admin = data;
        next();
    } catch (e) {
        // console.log(e);
        return res.status(400).json({error : "Enter valid token"});
    }
}

module.exports = fetchSuperAdmin;

