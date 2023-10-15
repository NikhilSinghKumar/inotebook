const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Create a User using: POST "/api/auth/createuser" . No login required
// use POST otherwise login data might be seen in computer log, also for large Data
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 chars').isLength({ min: 5 })
] , async (req,res) =>{
    // If there are errorss, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Check whether this email exits already
    try {
        let user = await User.findOne({email: req.body.email})
        if(user){
            return res.status(400).json({error: "Sorry this email exists already."})
        }
        // create a new user
        user = await User.create({
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
        })
        res.json({user})
    } 
    // catch error
    catch (error){
        console.error(error.message);
        res.status(500).send("Some error ocurred.")
    }
})

module.exports = router