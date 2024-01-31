
const axios = require('axios');
const QRCode = require('qrcode');

exports.generateQrCode = function(data, options) {
	return new Promise(function(resolve, reject) {
		QRCode.toDataURL(data, options, function(error, dataUri) {
			if (error) return reject(error);
			resolve(dataUri);
		});
	});
};


exports.pay = async (invoice) =>  {
    try {
        const {data} = await axios.post('https://api.getalby.com/payments/bolt11', {invoice},{
            headers: {
                "Authorization": "Bearer "+ process.env.ALBY_ACCESS_TOKEN
            }
        });

        return data;
    } catch ( err ) {
        return false
    }
 
}


exports.deposite = async (amount) =>  {
    try {
        const {data} = await axios.post('https://api.getalby.com/invoices', {amount, description: "Gin Rummy Wallet Deposite"},{
            headers: {
                "Authorization": "Bearer "+ process.env.ALBY_ACCESS_TOKEN
            }
        });

        return data;
    } catch ( err ) {
        console.log(err)
        return false
    }
 
}


exports.checkInvoiceStatus= async (invoice) => {
    try {
        if(invoice.paymentHash){
            const {data} = await axios.get(`https://api.getalby.com/invoices/${invoice.paymentHash}`,{
                headers: {
                    "Authorization": "Bearer "+ process.env.ALBY_ACCESS_TOKEN
                }
            });
            return data;
        }  else {
            return false;
        }
       

      
    } catch ( err ) {
        console.log(err)
        return false
    }
}