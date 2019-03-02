const jwt = require('jsonwebtoken');

const { JWT_KEY } = process.env;


module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        // new custom field on the request
        req.isAuth = false;
        return next();
    }

    const token = authHeader.split(' ')[1]; // Bearer tokenstring
    if (!token || token === '') {
        req.isAuth = false;
        return next();
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_KEY);
        
    } catch (error) {
        req.isAuth = false;
        return next();
    }

    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }

    req.isAuth = true;
    req.userId = decodedToken.userId;
    return next();
}