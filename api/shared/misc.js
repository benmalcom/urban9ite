/**
 * Created by Malcom on 9/7/2016.
 */
var jwt = require('jsonwebtoken');
var config = require('config');
exports.signToken = function (obj) {
    var token = jwt.sign(obj, config.get('authToken.superSecret'), {expiresIn: config.get('authToken.expiresIn')}); // expires in 24 hours
    return token;
};
