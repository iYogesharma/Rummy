
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2');
const axios = require('axios')

let strategy = new OAuth2Strategy({
    authorizationURL: 'https://getalby.com/oauth',
    tokenURL: 'https://api.getalby.com/oauth/token',
    clientID: 'uI4b4eEVx4',
    clientSecret: 'jSX0pxYhTuGsqdqysHkx',
    callbackURL: '/alby_callback'
  },
  async function (accessToken, refreshToken, profile, cb) {
    return cb(null,profile);
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
  