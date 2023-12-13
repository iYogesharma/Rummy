
const axios = require('axios');

const User = require('../Database/Models/user.model')


exports.accountBalance = async ( req,res ) => {

    const user = await  User.findOne({_id:req.user._id})

    try {
        if(user) {
            const access_token = user.accessToken;
    
            const {data} = await axios.get('https://api.getalby.com/balance',{
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });
            return res.status(200).json({success:true, data:data, message:"User Account Balance"});
            
        } else {
            return res.status(400).json({success:false, data:null, message: "User Not Found"});
        }
    } catch {
        return res.status(401).json({success:false, data:null, message: "Not Able To Connect To Wallet"});
    }
}