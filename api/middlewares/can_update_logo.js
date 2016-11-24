/**
 * Created by Malcom on 11/16/2016.
 */
var helper = require('../../utils/helper');

module.exports = function(req, res, next) {
    var nursery = req.nursery;
    var user = req.user;
    if(nursery && user && (nursery.owner == user._id)) return next();

    var error =  helper.transformToError({code:403,message:"You are not permitted to update this nursery's logo"}).toCustom();
    return next(error);
};