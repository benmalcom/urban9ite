/**
 * Created by Emmanuel on 10/15/2016.
 */
var Validator = require('validatorjs');
var UserType = require('../../../api/models/user-type');
var helper = require('../../../utils/helper');

module.exports = {

    login : function(req, res, next){
        res.render('auth/login',{title:'Login'});
    },

    register : function(req, res, next){
        UserType.find().exec()
            .then(function (userTypes) {
                res.render('auth/register',{title:'Register',userTypes: userTypes});
            },function (err) {
                console.log("error ",err);
                res.render('auth/register',{title:'Register'});
            });
    },
    verify : function(req, res, next){
        res.render('auth/verify-account',{title:'Verify account'});
    },

    postVerify : function(req, res, next){
        var user = req.user,
            obj = req.body,
            rules = {verification_code: 'required'},
            validator = new Validator(obj,rules);
        if(validator.passes())
        {
            var verification_code = obj.verification_code;
            if(user.verification_code == verification_code)
            {
                user.verification_code = "";
                user.account_verified = true;
                user.save(function (err) {
                    if(err)
                    {
                        req.flash('danger','Problem verifying your code, try again!');
                        res.redirect('/verify-account');
                    }
                    else
                        res.redirect('/');
                });

            }
            else
            {
                req.flash('danger','Incorrect verification code!');
                res.redirect('/verify-account');
            }
        }
        else
        {
            req.flash('errors',helper.validationErrorsToArray(validator.errors.all()));
            res.redirect('/verify-account');
        }
    },

    logout : function(req, res, next){
        req.logout();
        res.redirect('/login');
    }

};
