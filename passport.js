
const passport = require('passport')
const User = require('./Database/Models/user.model')

const { login } = require('./Helpers/auth.helper');

const LnurlAuth = require('passport-lnurl-auth');

let strategy  =  new LnurlAuth.Strategy( async function(linkingPublicKey, done) {
  let user = await User.findOne({lnId :linkingPublicKey, active: true});

  if( !user ) {
    user = await User.create({
      lnId: linkingPublicKey,
      balance: 1000
    });
  }

  if( user ) {
    const token = await login(user, linkingPublicKey);
      if( token ) user._token = token;
    }
	done(null, user);
});
  
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user || null);
});
passport.use(strategy);

const LnAuth = new LnurlAuth.Middleware({
  // The externally reachable URL for the lnurl-auth middleware.
  // It should resolve to THIS endpoint on your server.
  callbackUrl: process.env.APP_URL+'/login/lightning',
  // The URL of the "Cancel" button on the login page.
  // When set to NULL or some other falsey value, the cancel button will be hidden.
  cancelUrl: '/',
  // Instruction text shown below the title on the login page:
  instruction: 'Scan the QR code to login',
  // The file path to the login.html template:
  loginTemplateFilePath:  __dirname+ '/public/ln.html',
  // The number of seconds to wait before refreshing the login page:
  refreshSeconds: 5,
  // The title of the login page:
  title: 'Login with lnurl-auth',
  // The URI schema prefix used before the encoded LNURL.
  // e.g. "lightning:" or "LIGHTNING:" or "" (empty-string)
  uriSchemaPrefix: 'LIGHTNING:',
  // Options object passed to QRCode.toDataURL(data, options) - for further details:
  // https://github.com/soldair/node-qrcode/#qr-code-options
  qrcode: {
    errorCorrectionLevel: 'L',
    margin: 2,
    type: 'image/png',
  },
})

module.exports = {passport,LnAuth};
  