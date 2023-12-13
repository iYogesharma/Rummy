
exports.handleCallback = async ( req, res ) => {
    const {user} = req;
    const {APP_NAME} = process.env;
    if( user ) {
        const currentTime = new Date().getTime();
        const expires = new Date(currentTime + 30 * 24 * 60 * 60 * 1000);
        res.cookie(APP_NAME, JSON.stringify({ access_token : user._token }), {
            secure: true,
            httpOnly: true,
            expires: expires,
        });
        res.redirect('/home')
    } else {
        res.redirect('/login/alby')
    }
}