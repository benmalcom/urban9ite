/**
 * Created by Ekaruztech on 9/2/2016.
 */
var User = require('../../models/user');
var formatResponse = require('../../shared/format-response'),
    misc = require('../../shared/misc'),
    config = require('config'),
    Validator = require('validatorjs'),
    helper = require('../../../utils/helper'),
    _ = require('underscore');



module.exports = {

    login: function (req, res, next) {
        var meta = {code:200, success:true},
            error = {},
            obj = req.body,
            rules = {email: 'required',password:'required|min:6'},
            validator = new Validator(obj,rules);
        if(validator.passes()) {
            User.findOne({email:obj.email}, function (err, foundUser) {
                if (err) {
                    error =  helper.transformToError({code:503,message:"Error in server interaction",extra:err});
                    return next(error);
                }

                else if (!foundUser) {
                    error =  helper.transformToError({code:404,message:"Authentication failed. User not found"}).toCustom();
                    return next(error);
                }

                else {
                    if(!foundUser.account_verified) {
                        foundUser.save(); // TODO: Take care of errors here
                        meta.error = {code:meta.code, message:"This account has not been verified, please verify it with the code sent to you again!"};
                        meta.token = misc.signToken({userId:foundUser._id,user:foundUser});
                        return res.status(meta.code).json(formatResponse.do(meta,foundUser));
                    }
                     else if (req.body.password != null && !foundUser.comparePassword(req.body.password)) {
                        error =  helper.transformToError({
                            code:401,message:"Authentication failed. Wrong password supplied"
                        }).toCustom();
                        return next(error);
                    }

                    else {
                        meta.token = misc.signToken({userId:foundUser._id,user:foundUser});
                        return res.status(meta.code).json(formatResponse.do(meta,foundUser));
                    }
                }

            });
        }
        else
        {
            error =  helper.transformToError({
                code:400,message:"There are problems with your input",
                messages:helper.validationErrorsToArray(validator.errors.all())}).toCustom();
            return next(error);
        }

    },

    startRegistration: function (req, res, next) {
        var meta = {code:200, success:true},
            error = {},
            obj = req.body,
            rules = User.createRules(),
            validator = new Validator(obj,rules);

        if(validator.passes())
        {
            User.findOne({$or: [{email:obj.email},{username:obj.username}]}).exec()
                .then(function (existingUser) {
                    if(existingUser) {
                        if(!existingUser.account_verified)
                        {
                            obj.verification_code = helper.generateOTCode();
                            _.extend(existingUser,obj);
                            existingUser.save(); // TODO: Take care of errors here
                            message = "This Account is not verified! If you're the owner please enter the code sent to your email to verify it!";
                            meta.error = {code:meta.code, message:message};
                            meta.token = misc.signToken({userId:existingUser._id,user:existingUser});
                            return res.status(meta.code).json(formatResponse.do(meta,existingUser));
                        }
                        else {
                            var message = "";
                            if(existingUser.email == obj.email) message = "A user with this email already exists";
                            if(existingUser.username == obj.username) message = "That username  has been taken";
                            error =  helper.transformToError({code:409,message:message}).toCustom();
                            throw error;
                        }
                    }
                    obj.verification_code = helper.generateOTCode();
                    obj.user_types = [obj.user_type];
                    delete obj.user_type;
                    var user = new User(obj);
                    return user.save();
                })
                .then(function (savedUser) {
                    meta.token = misc.signToken({userId:savedUser._id,user:savedUser});
                    res.status(meta.code).json(formatResponse.do(meta,savedUser));
                },function (err) {
                    error =  helper.transformToError(err);
                    return next(error);
                });
        }
        else
        {
            error =  helper.transformToError({
                code:400,message:"There are problems with your input",
                messages:helper.validationErrorsToArray(validator.errors.all())})
                .toCustom();
            return next(error);
        }


    },
    verifyCode: function (req, res, next) {
        var meta = {code:200, success:true},
            error = {},
            obj = req.body,
            rules = {verification_code: 'required'},
            validator = new Validator(obj,rules);
        if(validator.passes())
        {
            var userId = req.userId;
                User.findById(userId).exec()
                    .then(function(existingUser){
                        if (!existingUser) {
                            error =  helper.transformToError({code:404,message:"This user does not exist"}).toCustom();
                            throw error;
                        }
                        else if(existingUser && existingUser.account_verified) {
                            error =  helper.transformToError({code:409,message:"This account has been verified already"}).toCustom();
                            throw error;
                        }
                        else if(existingUser && !existingUser.account_verified && existingUser.verification_code != obj.verification_code) {
                            error =  helper.transformToError({code:409,message:"Incorrect verification code!"}).toCustom();
                            throw error;
                        }
                        var updateObj = {verification_code:"",account_verified:true,active:true};
                     _.extend(existingUser,updateObj);
                    return existingUser.save();
                })
                .then(function(updatedUser){
                    meta.message = "Code verification successful!";
                    res.status(meta.code).json(formatResponse.do(meta,updatedUser));
                },function (err) {
                    console.log("error ",err);
                    error =  helper
                        .transformToError({code:err.custom ? err.code : 503,message:err.custom ? err.message : "We encountered an error while verifying your code!"});
                    return next(error);
                });

        }
        else
        {
            error =  helper.transformToError({code:400,message:"There are problems with your input",
                errors:helper.validationErrorsToArray(validator.errors.all())}).toCustom();
            return next(error);
        }

    },
    changePassword: function (req, res, next) {
        var meta = {code:200, success:true},
            error = {},
            obj = req.body,
            rules = {current_password: 'required',new_password: 'required|min:6'},
            validator = new Validator(obj,rules,{'new_password.required':'Your new password is required','new_password.min':'New password must be at least 6 characters!'});
        if(validator.passes())
        {
            var userId = req.userId;
            User.findById(userId).exec()
                .then(function (existingUser) {
                    if(!existingUser) {
                        error =  helper.transformToError({code:404,message:"User not found!"}).toCustom();
                        throw error;
                    }
                    else if(existingUser && !existingUser.comparePassword(obj.current_password)) {
                        error =  helper.transformToError({code:422,message:"Operation failed, incorrect password!",}).toCustom();
                        throw error;
                    }
                    existingUser.password = obj.new_password;
                    return existingUser.save();
                })
                .then(function (existingUser) {
                    meta.message = "Password changed successfully!";
                    return res.status(meta.code).json(formatResponse.do(meta,existingUser));
                },function (err) {
                    console.log("Change password error ",err);
                    return next(err);
                });
        }
        else
        {
            error =  helper.transformToError({code:400,message:"There are problems with your input",
                messages:validator.errors.all()}).toCustom();
            return next(error);
        }

    }
};
