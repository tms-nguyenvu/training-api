"use strict";

const express = require("express");
const router = express.Router();
const User = require('../../models/user.model');
const userController = require("../../controllers/user.controller");


// Get all users
router.get('/', async (req, res) => {
    try {
        const { field } = req.query; 
        let query = {};

     
        if (field === 'email') {
            query[field] = { $regex: '@tomosia\\.com$', $options: 'i' };
        }
        

        const users = await User.find(query)
        res.json(users); 
    } catch (err) {
        res.status(500).json({ message: err.message }); 
    }
});



// router.get("/", userController.getAllUser)

// Create user
router.post('/', async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email
    });

    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();

            res.json({ message: 'User deleted' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;