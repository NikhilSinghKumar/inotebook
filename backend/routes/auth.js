const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = '$$richmentality$$richlife$$royal$$';

// ROUTE 1: Create a User using: POST "/api/auth/createuser" . No login required
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
        // Password Gen salt
        const salt = await bcrypt.genSalt(10);
        // Password hashing
        const secPass = await bcrypt.hash(req.body.password, salt);
        // create a new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        })
        const data = {
            user: {
                id : user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({authtoken});
        // res.json({user})
    } 
    // catch error
    catch (error){
        console.error(error.message);
        res.status(500).send("Internal server error occurred.")
    }
})

// ROUTE 2: Authenticate a User using: POST "/api/auth/login" . No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
] , async (req,res) =>{
    // If there are errorss, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructuring to get email & password from req.body
    const{email, password} = req.body;
    try{
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error: "Please try to login with correct credentials"});
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            return res.status(400).json({error: "Please try to login with correct credentials"});
        }
        const data = {
            user: {
                id : user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({authtoken});
    } 
    catch (error){
        console.error(error.message);
        res.status(500).send("Internal server error occurred.")
    }
})

// ROUTE 3: Get loggedin User details using: POST "/api/auth/getuser" . Login required
// JWT token need to send here
router.post('/getuser', fetchuser, async (req,res) =>{

try{
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user)
} 
catch (error){
    console.error(error.message);
    res.status(500).send("Internal server error occurred.")
}

})

module.exports = router