const User = require('../Database/Models/user.model')
const querystring = require('querystring');
const lnurl = require('lnurl');
const { generateQrCode, pay, deposite, checkInvoiceStatus } = require('../Helpers/qr.helper');
const Invoice = require('../Database/Models/invoice.model');


exports.accountBalance = async ( req,res ) => {

    const invoices = await Invoice.find({
        user_id: req.user._id,
        setteled:false
    });
  
    if( invoices.length ) {
        await checkForInvoiceStatusUpdates( req.user._id, invoices)
        .then( async () => {
            const user = await  User.findOne({_id:req.user._id})

            if(user) {
                return res.status(200).json({success:true, data:{balance:user.balance,currency:'Satoshi'}, message:"User Account Balance"});
                
            } else {
                return res.status(400).json({success:false, data:null, message: "User Not Found"});
            }
        })
    } else {
        const user = await  User.findOne({_id:req.user._id})
        if(user) {
            return res.status(200).json({success:true, data:{balance:user.balance,currency:'Satoshi'}, message:"User Account Balance"});
            
        } else {
            return res.status(400).json({success:false, data:null, message: "User Not Found"});
        }
    }
}


checkForInvoiceStatusUpdates = async (id,invoices)  => {
   
    let failedids = [];let successids = []; let increment = 0; let decrement = 0;

    await invoices.map( async (invoice) => {
        checkInvoiceStatus(invoice)
        .then( async (data) => {
          
            if( data.settled ) {
                successids.push(invoice._id);  console.log(successids)
                // await Invoice.findOneAndUpdate({_id:invoice._id},{setteled:true});
                if( invoice.type != "Deposite") {
                    decrement += invoice.amount;
                } else {
                    increment += invoice.amount;
                } 
            } else {
                failedids.push(invoice._id)
            }
        }).finally(async () => {
          
            if( successids.length ) {
                const res = await Invoice.updateMany({_id: {$in: successids}},{ $set: {setteled:true}});
                
                if( res.acknowledged ) {
                    if( increment > 0 ) {
                        await User.findOneAndUpdate(
                            { _id: id },
                            {
                                $inc: { balance: increment }
                            }
                        );  
                    } 

                    if( decrement > 0 ) {
                        await User.findOneAndUpdate(
                            { _id: id },
                            {
                                $inc: { balance: - decrement}
                            }
                        );  
                    } 
                   
                }
            }
        
            if( failedids.length ) {
                await Invoice.deleteMany({_id: {$in: successids}});
            }
        })
    })
   

}

exports.withdrawInvoice = async ( req,res ) => {
    const invoice = req.body.invoice;
    if( invoice ) {
        pay(invoice).then( async (data) => {
            console.log(data);
            await Invoice.create({
                user_id: req.user._id,
                amount: data.amount,
                paymentHash: data.payment_hash,
                paymentRequest: data.payment_request,
                setteled: true,
                type: 'Withdraw'
            });
            await User.findOneAndUpdate(
                { _id: req.user._id },
                {
                    $inc: { balance: `-${data.amount}`}
                }
            );
            return res.status(200).json({success:true, message:"withdrawal successfull",setteled:true})
        }).catch( err => {
            return res.status(500).json({success:false, message:"Error while processing withdrawal",setteled:false})
        })
    } else {
        return res.status(400).json({success:false, message:"Invoice field is reuired",setteled:false})
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
            "message": "LiWithdrawal Request successfull" // Up to 144 characters
        }
    });
    const encoded = lnurl.encode(callbackUrl).toUpperCase();
    // const invoice = generatePaymentRequest(10000,{
    //     description: "Gin Rummy deposite",
    //     nodePrivateKey: req.user.lnid
    // });
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

exports.generateDepositeInvoice = async ( req,res ) => {
    try {

        const amount = req.query.amount || 10;

        let invoice = await  Invoice.findOne({
            user_id: req.user._id,
            amount:amount, 
            expires_at: { $gt: new Date()},
            setteled:false,
            type: 'Deposite'
        });

        if( !invoice ) {
            const data = await deposite( amount)
            invoice =  await Invoice.create({
                user_id: req.user._id,
                amount:amount,
                paymentHash: data.payment_hash,
                paymentRequest: data.payment_request,
                expires_at: data.expires_at,
                type: 'Deposite'
            });
        }

        if( invoice ) {

            let options = {
                errorCorrectionLevel: 'L',
                margin: 2,
                type: 'image/png',
                uriSchemaPrefix: 'LIGHTNING:',
            }

            const callbackUrl = process.env.APP_URL+'/lightning/deposite?' + querystring.stringify({
                tag: 'payRequest',
                minSendable: 1,
                maxSendable: 10,
                successAction: {
                    "tag": "message",
                    "message": "LiWithdrawal Request successfull" // Up to 144 characters
                }
            });
            const encoded = lnurl.encode(callbackUrl).toUpperCase();

            const href = `LIGHTNING:${encoded}`;

            const  dataUri =  await generateQrCode(`LIGHTNING:${invoice.paymentRequest}`, options);

            if(dataUri) return  res.status(200).json({success:true, data:{ dataUri, href: options.uriSchemaPrefix === '' ? '#' : href, invoice:invoice.paymentRequest}});
        
            else return res.status(500).json({'success': 'false', 'message': 'something went wrong try again'})
        }
     
    } catch (err ){
        console.log(err)
        return res.status(500).json({'success': 'false', 'message': 'something went wrong try again'})
    }
}  

exports.depositeRequest = async ( req,res ) => {
    const k1 = req.user.lnId;
    const id = req.user._id;
    if( k1 && req.query.amount ){
        const amount = req.query.amount / 1000;
        deposite(amount).then( async (data) => {

            await Invoice.create({
                user_id: id,
                amount:amount,
                paymentHash: data.payment_hash,
                paymentRequest: data.payment_request,
                expires_at: data.expires_at,
                setteled: true,
                type: 'Deposite'
            });
        
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

exports.invoiceUpdates = async (req,res) => {
    let invoice = await  Invoice.findOne({
        user_id: req.user._id,
        paymentRequest: req.body.pr,
        setteled:false,
        type: 'Deposite'
    });
    if( invoice ) {
        checkInvoiceStatus(invoice)
        .then( async (data) => {
            if( data.settled ) {

                await Invoice.findOneAndUpdate({_id:invoice._id},{setteled:true});

                await User.findOneAndUpdate(
                    { _id: req.user._id },
                    {
                        $inc: { balance: invoice.amount}
                    }
                );  

                return res.status(200).json({success:true,message:"Account has been Credited, Thank you for using Rummy", setteled:true})
            } else {
                await Invoice.deleteOne({_id:invoice._id});
                return res.status(200).json({success:true,message:"Invoice not settled deleting invoice", setteled:false})
            }
        }).catch( err => {
            console.log(err)
            return res.status(500).json({"status":"Error", message:"Error while processing deposite"})
        })
    } else {
        return res.status(500).json({"status":"Error", message:"Invoice not found"})
    }
}

exports.webhookInvoiceUpdates = async (req,res) => {

    if(req.body.settled) {
        let invoice = await  Invoice.findOne({
            amount:req.body.amount, 
            paymentHash: req.body.payment_hash,
            paymentRequest: req.body.payment_request,
            setteled:false,
            type: 'Deposite'
        });

        if( invoice ) {
            await Invoice.findOneAndUpdate({_id:invoice._id},{setteled:true});
            await User.findOneAndUpdate(
                { _id: invoice.user_id },
                {
                    $inc: { balance: invoice.amount}
                }
            );  

            const response = {
                cmd: 'paymentSuccessfull',
                status:'payment deposite successfull'
            }

            if(  global.clients[req.sessionID] ) {
                global.clients[req.sessionID].write(`data: ${JSON.stringify(response)}\n\n`);
            }
            if ( global.clients[ws.user._id]) {
                global.clients[ws.user._id].send(JSON.stringify(response));
            }
           
        }
    }
}

