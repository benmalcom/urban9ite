

var AuthController = require('../controllers/auth/auth');
var validateRegData = require('../middlewares/validateRegData');


//All routes here
module.exports = function (app,passport) {
    app.get('/login', AuthController.login);
    app.post('/login',passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/register', AuthController.register);
    app.post('/register',validateRegData,passport.authenticate('local-signup', {
        successRedirect : '/verify-account', // redirect to the secure profile section
        failureRedirect : '/register', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    app.get('/verify-account', AuthController.verify);
    app.post('/verify-account',AuthController.postVerify);
    app.get('/logout', AuthController.logout);


};
