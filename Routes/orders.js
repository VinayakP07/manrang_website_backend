require('dotenv').config();
const express = require('express');
const router = express.Router();
const Orders = require('../models/Orders');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Clothes = require('../models/Clothes');
const UserAuth = require('../middleware/userInfo'); // Ensure this path is correct

// Route 1: Adding an order
//Base URL: http://localhost:5000/user/orders

router.post('/addOrder', [
    body('userId', 'Enter valid user ID').isMongoId(),
    body('clothId', 'Enter valid cloth ID').isMongoId(),
    body('totalPrice', 'Enter a valid total price').isString(),
    body('deliveryAddress', 'Enter a valid delivery address').isString(),
    body('quantity', 'Enter a valid quantity').isNumeric()
], async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ success: false, error: result.array() });
    }

    try {
        // Find if user and cloth exist
        const user = await User.findById(req.body.userId);
        const cloth = await Clothes.findById(req.body.clothId);
        if (!user || !cloth) {
            return res.status(404).json({ error: "User or Cloth not found" });
        }

        // Add new order
        let newOrder = new Orders({
            userId: req.body.userId,
            clothId: req.body.clothId,
            totalPrice: req.body.totalPrice,
            deliveryAddress: req.body.deliveryAddress,
            quantity: req.body.quantity,
            accept: null, // Default to null
            reject: null // Default to null
        });

        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);
    } catch (error) {
        res.status(500).json({ error: "Some error occurred" });
    }
});

// Route 2: Deleting an order
router.delete('/deleteOrder/:id', async (req, res) => {
    try {
        let order = await Orders.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        await Orders.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Some error occurred" });
    }
});

// Route 3: Updating an order
// //router.put('/updateOrder/:id', [
//     body('totalPrice').optional().isString(),
//     body('deliveryAddress').optional().isString(),
//     body('quantity').optional().isNumeric(),
//     body('accept').optional().isBoolean(),
//     body('reject').optional().isBoolean()
// ], async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//         const { totalPrice, deliveryAddress, quantity, accept, reject } = req.body;
//         const updateOrder = {};
//         if (totalPrice) updateOrder.totalPrice = totalPrice;
//         if (deliveryAddress) updateOrder.deliveryAddress = deliveryAddress;
//         if (quantity) updateOrder.quantity = quantity;
//         if (accept !== undefined) updateOrder.accept = accept;
//         if (reject !== undefined) updateOrder.reject = reject;

//         let order = await Orders.findById(req.params.id);
//         if (!order) {
//             return res.status(404).json({ error: "Order not found" });
//         }

//         order = await Orders.findByIdAndUpdate(req.params.id, { $set: updateOrder }, { new: true });

//         res.status(200).json(order);
//     } catch (error) {
//         res.status(500).json({ error: "Some error occurred" });
//     }
// });

// Route 4: Fetching all orders
router.get('/fetchOrders', async (req, res) => {
    try {
        const orders = await Orders.find().populate('userId', 'name email').populate('clothId', 'name price');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Some error occurred" });
    }
});

// Route 5: Fetching orders by a user
router.get('/fetchUserOrders/:userId',UserAuth, async (req, res) => {
    try {
        const orders = await Orders.find({ userId: req.params.userId }).populate('clothId', 'name price');
        if (!orders.length) {
            return res.status(404).json({ error: "No orders found for this user" });
        }
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Some error occurred" });
    }
});

module.exports = router;
