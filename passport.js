
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2');
const axios = require('axios')
const User = require('./Database/Models/user.model')

const { login } = require('./Helpers/auth.helper');

let strategy = new OAuth2Strategy({
    authorizationURL: 'https://getalby.com/oauth',
    tokenURL: 'https://api.getalby.com/oauth/token',
    clientID: 'uI4b4eEVx4',
    clientSecret: 'jSX0pxYhTuGsqdqysHkx',
    callbackURL: '/alby_callback'
  },
  async function (accessToken, refreshToken, profile, cb) {
    try {
      const user = await User.findOneAndUpdate({providerId :profile.identifier}, {accessToken,refreshToken});

      if( !user ){
        const user = await User.create({
          email: profile.email,
          name: profile.name,
          accessToken:accessToken,
          refreshToken:refreshToken,
          lightningAddress:profile.lightning_address,
          provider: 'Alby',
          providerId: profile.identifier,
          email_validated: profile.email ? 1 : 0
        });
      }

      if( user ) {
        const token = await login(user, user.device_id);

        if( token ) user._token = token;
      }

      return cb(null,user);
    } catch {
      return cb(null,null);
    }
  });
  
strategy.userProfile = async function(accessToken, done) {
  try {
    const {data}= await axios.get('https://api.getalby.com/user/me', {
      headers: {
        'Authorization' : `Bearer ${accessToken}`
      }
    })
    return done(null, data);
  } catch {
    return done(null, {});
  };
};
  
passport.use(strategy);

module.export = passport;
  