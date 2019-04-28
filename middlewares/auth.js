const jwt = require('jsonwebtoken');
const SECRET = "LEV3LUP!74";
/**
 * Auth Middleware that checks if authorization header exist in the request  and token contained within is valid
 */

module.exports = function(req, res, next){
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader) return res
        .status(401).json(
            {status: 'error', 
            message: "Please specify an authorization header"});

        const token = authHeader.split(" ")[1];

        const tokenData = jwt.verify(token, SECRET);

        req.user = tokenData.id;

        next();

    }catch(err){
        res
        .status(401).json(
            {status: 'error', 
            message: "You're not authorized"});
    }
}