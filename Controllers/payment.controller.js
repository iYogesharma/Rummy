const User = require('../Database/Models/user.model')
const querystring = require('querystring');
const lnurl = require('lnurl');
const { generateQrCode, pay, withdraw } = require('../Helpers/qr.helper');

exports.accountBalance = async ( req,res ) => {

    const user = await  User.findOne({_id:req.user._id})

    try {
        if(user) {
            return res.status(200).json({success:true, data:{balance:user.balance,currency:'Satoshi'}, message:"User Account Balance"});
            
        } else {
            return res.status(400).json({success:false, data:null, message: "User Not Found"});
        }
    } catch(AxiosError) {
        res.clearCookie(process.env.APP_NAME);
        return res.status(401).json({success:false, data:null, message: "Not Able To Connect To Wallet"});
    }
}


exports.withdrawAmmount = async ( req,res ) => {

    const k1 = req.user.lnId;

    const callbackUrl = process.env.APP_URL+'/lightning/withdraw?' + querystring.stringify({
        tag: 'withdrawRequest',
        defaultDescription: "GinRummy Wallet Withdrawal",
        minWithdrawable:10
    });
    const encoded = lnurl.encode(callbackUrl).toUpperCase();


    let options = {
        errorCorrectionLevel: 'L',
		margin: 2,
		type: 'image/png',
        uriSchemaPrefix: 'LIGHTNING:',
    }
    
    const href = `${options.uriSchemaPrefix}${encoded}`;

    const  dataUri =  await generateQrCode(href, options);

    if(dataUri) return  res.status(200).json({success:true, data:{ dataUri, href: options.uriSchemaPrefix === '' ? '#' : href}});

    else return res.status(500).json({'success': 'false', 'message': 'something went wrong try again'})
}


exports.withdrawRequest = async ( req,res ) => {
    const k1 = req.user.lnId;
    const id = req.user._id;
    if( k1 && req.query.pr ){
        pay(req.query.pr).then( async (data) => {
        
            await User.findOneAndUpdate(
                { _id: id },
                {
                    $inc: { balance: `-${data.amount}`}
                }
            );

            return res.status(200).json({"status": "OK"})
        }).catch( err => {
            return res.status(200).json({"status":"Error", "reason":"Error while processing withdrawal"})
        })
       
    }
    else if(k1 ){

        return res.status(200).json({
            k1:k1,
            tag: 'withdrawRequest',
            defaultDescription: "GinRummy Wallet Withdrawal",
            minWithdrawable:0,
            maxWithdrawable: 10,
            callback: process.env.APP_URL+'/lightning/withdraw'
        });
    }
}


exports.depositeAmount = async ( req,res ) => {
    const callbackUrl = process.env.APP_URL+'/lightning/deposite?' + querystring.stringify({
        tag: 'payRequest',
        minSendable: 1,
        maxSendable: 10,
        successAction: {
            "tag": "message",
            "message": "Withdrawal Request successfull" // Up to 144 characters
        }
    });
    const encoded = lnurl.encode(callbackUrl).toUpperCase();


    let options = {
        errorCorrectionLevel: 'L',
		margin: 2,
		type: 'image/png',
        uriSchemaPrefix: 'LIGHTNING:',
    }
    
    const href = `${options.uriSchemaPrefix}${encoded}`;

    const  dataUri =  await generateQrCode(href, options);

    if(dataUri) return  res.status(200).json({success:true, data:{ dataUri, href: options.uriSchemaPrefix === '' ? '#' : href}});

    else return res.status(500).json({'success': 'false', 'message': 'something went wrong try again'})
}   



exports.depositeRequest = async ( req,res ) => {
    const k1 = req.user.lnId;
    const id = req.user._id;
    if( k1 && req.query.amount ){
        const amount = req.query.amount / 1000;
        withdraw(amount).then( async (data) => {
          
            await User.findOneAndUpdate(
                { _id: id },
                {
                    $inc: { balance: data.amount}
                }
            );  
          
            return res.status(200).json({
                pr: data.payment_request,
                successAction: {
                    "tag": "message",
                    "message": "Account has been Credited, Thank you for using Rummy" // Up to 144 characters
                },
                routes: []
            })
        }).catch( err => {
            console.log(err)
            return res.status(200).json({"status":"Error", "reason":"Error while processing deposite"})
        })
       
    }
    else if(k1) {
        
        return res.status(200).json({
            k1:k1,
            tag: 'payRequest',
            minSendable: 10000,
            "metadata": "[[\"text/plain\",\"lnurl-toolbox: payRequest\"]]",
            callback: process.env.APP_URL+'/lightning/deposite'
        });
    }
}


