
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


exports.withdraw = async (amount) =>  {
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