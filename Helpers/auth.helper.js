const User = require('../Database/Models/user.model')
const jwt = require('jsonwebtoken');

/**
 * Logs a user into the application based on 
 * provided user id
 * @param id 
 * @param device_id 
 * @returns bool|personalAccessToken
 */
async function loginUserById( id , device_id ) {
    const user  = await User.findOne(
        { 
            _id:id
        },
        {
            _id: true,
            lnId:true
        }
    );

    if( !user ) return false;
    else {
        return login( user , device_id );
    } 
}


/**
 * Logs a user into the application
 * @param user User
 * @param device_id 
 * @returns bool|personalAccessToken
 */
async function login ( user, device_id ) {
    if( !user ) return false;
    else {
        const jwtOptions = {
            expiresIn: '30d',  // Expire token in 30 days
        };
      
        const { ACCESS_TOKEN_SECRET } = process.env;

        const { _id, lnId } = user;

        return jwt.sign({_id, lnId}, ACCESS_TOKEN_SECRET, jwtOptions);
    } 
}

function decodeToken(token){
    try {
        token = JSON.parse(token);
        const {access_token} = token;
        if( access_token ) {
            const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
            if( decoded._id ) return decoded;
            else false; 
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

module.exports = { login, loginUserById, decodeToken};