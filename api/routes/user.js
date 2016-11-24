/**
 * Created by Emmanuel on 4/30/2016.
 */
var config = require('config');
var router = require('express').Router();
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var apiVersion = ('v'+process.env.API_VERSION).toLowerCase();
var UserController = require('../controllers/'+apiVersion+ '/user');
var checkToken = require('../../api/middlewares/auth_token');

var s3 = new aws.S3(config.get('aws.credentials'));
var uploadAvatar = multer({
    fileFilter: function (req, file, cb) {
        if (!file){
            var error =  helper.transformToError({code:422,message:"You didn't upload any file!"}).toCustom();
            cb(error);
        }
        else
        cb(null, true);
    },
    storage: multerS3({
        s3: s3,
        bucket: config.get('aws.bucket'),
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            var ext = file.originalname.split(".").pop();
            var prefix = "avatars/" + (req.user._id || Date.now())+"."+ext;
            cb(null, prefix);
        }
    })
});
//Middleware to check authorization token
router.use(checkToken);
/*user_id param*/
router.param('user_id',UserController.userIdParam);
router.route('/users/:user_id')
    .get(UserController.findOne)
    .put(UserController.update);
router.get('/users',UserController.find)
    .post('/users/avatar',uploadAvatar.single('avatar'),UserController.uploadAvatar)
    .post('/users/switch-account',UserController.switchUserType);
router.get('/users/:user_id/nurseries',UserController.getUserNurseries);

module.exports = router;