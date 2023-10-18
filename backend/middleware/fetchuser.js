// Middleware a function is called when any request is found in Login Route
var jwt = require('jsonwebtoken');

const JWT_SECRET = '$$richmentality$$richlife$$royal$$';

const fetchuser = (req, res, next) => {
    // get the user from the jwt token and add id to req object
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: "Please authenticate using a valid token"})
    }
    try{
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next()
    } catch (error){
        return res.status(401).send({error: "Please authenticate using a valid token"})
    }
}


module.exports = fetchuser;