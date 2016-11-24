/**
 * Created by Ekaruztech on 7/19/2016.
 */
var config = require('config');
var prefix = config.get('api.prefix');
var helper = require('../../utils/helper');

module.exports = function (app) {
    app.use(prefix,require('./auth'));
    app.use(prefix,require('./user-type'));
    app.use(prefix,require('./user'));
    app.use(prefix,require('./nursery'));

    app.use(config.get('api.prefix')+"/*",function (req,res, next) {
        var error = helper.transformToError({code:404,message:"We don't seem to understand your request!"})
            .toCustom();
        return next(error);
    });
};
