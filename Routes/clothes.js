require('dotenv').config();
const express = require('express');
const router = express.Router();
const Clothes = require('../models/Clothes.js');
const { body, validationResult } = require('express-validator');
const superAdmin = require('../middleware/superAdmin.js');
const Admin = require('../middleware/adminInfo.js');


const shhh = process.env.JWT_SECRET;

// Route 1 : Adding clothes
// Base link address = http://localhost:5000/superAdmin/clothes

router.post('/addClothes',[
    body('section','Enter valid Section'),
    body('name','Enter valid name'),
    body('description','Enter valid description'),
    body('price','Enter valid price'),
    body('images','Enter valid image url'),
    body('topBuys','Enter valid response'),
    body('ourRecommendation','Enter valid response'),
    body('newArrivals','Enter valid response'),
    body('inStock','Enter valid response')
] ,async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        let success = false;
        return res.status(400).json({success,error : result.array()});
    }

    try {
        let finding = await Clothes.findOne({name : req.body.name});
        if(finding){
        let success = false;
            return res.status(400).json({success,error : "Cloth already exist"});
        }
        
        // Adding new cloth
        let newCloth = await Clothes.create({
            section : req.body.section,
            name : req.body.name,
            description : req.body.description,
            price : req.body.price,
            images : req.body.images,
            topBuys : req.body.topBuys,
            ourRecommendation : req.body.ourRecommendation,
            newArrivals : req.body.newArrivals,
            inStock : req.body.inStock
        })
        const saveCloth = await newCloth.save();
        res.status(200).json(saveCloth);
    } catch (error) {
        res.status(400).json({error, message: "Some Error Occured" });
    }
});



 // Route : 2 : Deleting the Cloth
 router.delete('/deleteCloth/:id',async (req, res) => {
    try {
        let cloth = await Clothes.findById(req.params.id);
        if (!cloth) {
            return res.status(404).json({ error: "Cloth not found" });
        }
        await Clothes.findByIdAndDelete(req.params.id);
        res.json({ message: "Cloth deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Some Error Occurred" });
    }
});



// Route 3 : To update the cloth
router.put(
    '/updateCloth/:id',
    [
        body('section').optional().isString(),
        body('name').optional().isString(),
        body('description').optional().isString(),
        body('price').optional().isNumeric(),
        body('images').optional().isArray(),
        body('topBuys').optional().isBoolean(),
        body('ourRecommendation').optional().isBoolean(),
        body('newArrivals').optional().isBoolean(),
        body('inStock').optional().isBoolean()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { section, name, description,price, images, topBuys, ourRecommendation, newArrivals, inStock } = req.body;
            const updateCloth = {};
            if (section) updateCloth.section = section;
            if (name) updateCloth.name = name;
            if (description) updateCloth.description = description;
            if (price) updateCloth.price = price;
            if (images) updateCloth.images = images;
            if (topBuys) updateCloth.topBuys = topBuys;
            if (ourRecommendation) updateCloth.ourRecommendation = ourRecommendation;
            if (newArrivals) updateCloth.newArrivals = newArrivals;
            if (inStock) updateCloth.inStock = inStock;

            let cloth = await Clothes.findById(req.params.id);
            if (!cloth) {
                return res.status(404).json({ error: "Cloth not found" });
            }

            cloth = await Clothes.findByIdAndUpdate(req.params.id, { $set: updateCloth }, { new: true });

            res.status(200).json(cloth);

        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: "Some Error Occurred" });
        }
    }
);



    // Route 4 : Fetching all clothes
    router.get('/fetchClothes', async (req, res) => {
        try {
            const clothes = await Clothes.find();
            res.status(200).json(clothes);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: "Some error occurred" });
        }
    });

    
    // Route 5: Fetch clothes with topBuys = true
    router.get('/fetchTopBuys', async (req, res) => {
        try {
           const topBuysClothes = await Clothes.find({ topBuys: true });
           res.status(200).json(topBuysClothes);
        } catch (error) {
           console.error(error.message);
           res.status(500).json({ error: "Some error occurred" });
        }
    });

    // Route 6: Fetch clothes with ourRecommendation = true
    router.get('/fetchOurRecommendations', async (req, res) => {
        try {
           const recommendedClothes = await Clothes.find({ ourRecommendation: true });
           res.status(200).json(recommendedClothes);
        } catch (error) {
           console.error(error.message);
          res.status(500).json({ error: "Some error occurred" });
        }
    });
    
    // Route 7: Fetch clothes with newArrivals = true
    router.get('/fetchNewArrivals', async (req, res) => {
        try {
           const newArrivalsClothes = await Clothes.find({ newArrivals: true });
           res.status(200).json(newArrivalsClothes);
        } catch (error) {
           console.error(error.message);
          res.status(500).json({ error: "Some error occurred" });
        }
    });


module.exports = router;