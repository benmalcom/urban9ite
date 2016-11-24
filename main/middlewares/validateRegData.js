/**
 * Created by Malcom on 11/5/2016.
 */
var Validator = require('validatorjs');
var User = require('../../api/models/user');
var helper = require('../../utils/helper');


module.exports = function (req, res, next) {
    var obj = req.body,
        validator = new Validator(obj, User.rules());
    console.log("data ",obj);
    if(validator.passes()) next();
    else
    {
        req.flash('errors',helper.validationErrorsToArray(validator.errors.all()));
        return res.redirect('/register');
    }
};
