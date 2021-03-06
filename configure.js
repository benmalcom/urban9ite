/**
 * Created by Malcom on 9/9/2016.
 */
var config = require('config');
var mongoose = require('mongoose');

exports.defaults = function () {

    process.env.API_VERSION = config.get('api.versions').pop();

    //Set upload directories
    global.__base = __dirname + '/';
    global.__avatar_dir = __dirname + '/web_client/uploads/avatars';

    global.__avatarStorage = {
        destination: global.__avatar_dir,
        filename: function (req, file, cb) {
            var ext = file.originalname.split(".").pop();
            cb(null, req.docId +"_"+Date.now()+"_"+"."+ext);
        }
    };
};

exports.mongoose = function () {
    // Use q. Note that you **must** use `require('q').Promise`.
    mongoose.Promise = require('q').Promise;

    mongoose.connection.on("open", function() {
        console.log("Connected to mongo server.");
    });

    mongoose.connection.on("error", function(err) {
        console.log("Could not connect to mongo server!");
        console.log(err);
    });
    console.log("mongo url ",config.get('db.url'));
    mongoose.connect(config.get('db.url'));
};