
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2');
const axios = require('axios')
const User = require('./Database/Models/user.model')

const { login } = require('./Helpers/auth.helper');

const {ALBY_CLIENT_ID,ALBY_CLIENT_SECRET,ALBY_REDIRECT} =  process.env;

const LnurlAuth = require('passport-lnurl-auth');

let strategy  =  new LnurlAuth.Strategy( async function(linkingPublicKey, done) {
	// The user has successfully authenticated using lnurl-auth.
	// The linked public key is provided here.
	// You can use this as a unique reference for the user similar to a username or email address.
	// const user = { id: linkingPublicKey };

  try {

  
  const user = await User.find({lnId :linkingPublicKey, actice: true});

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
} catch (err) {
  console.log(err)
}
});



// let strategy1 = new OAuth2Strategy({
//     authorizationURL: 'https://getalby.com/oauth',
//     tokenURL: 'https://api.getalby.com/oauth/token',
//     clientID: ALBY_CLIENT_ID,
//     clientSecret: ALBY_CLIENT_SECRET,
//     callbackURL: ALBY_REDIRECT
//   },
//   async function (accessToken, refreshToken, profile, cb) {
//     try {
//       const user = await User.findOneAndUpdate({providerId :profile.identifier}, {accessToken,refreshToken});

//       if( !user ){
//         const user = await User.create({
//           email: profile.email,
//           name: profile.name,
//           accessToken:accessToken,
//           refreshToken:refreshToken,
//           lightningAddress:profile.lightning_address,
//           provider: 'Alby',
//           providerId: profile.identifier,
//           email_validated: profile.email ? 1 : 0
//         });
//       }

//       if( user ) {
//         const token = await login(user, user.device_id);

//         if( token ) user._token = token;
//       }

//       return cb(null,user);
//     } catch {
//       return cb(null,null);
//     }
//   });
  
// strategy.userProfile = async function(accessToken, done) {
//   try {
//     const {data}= await axios.get('https://api.getalby.com/user/me', {
//       headers: {
//         'Authorization' : `Bearer ${accessToken}`
//       }
//     })
//     return done(null, data);
//   } catch {
//     return done(null, {});
//   };
// };
  
passport.use(strategy);

const LnAuth = new LnurlAuth.Middleware({
  // The externally reachable URL for the lnurl-auth middleware.
  // It should resolve to THIS endpoint on your server.
  callbackUrl: process.env.APP_URL+'/login',
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
  