/**
 * Created by Malcom on 11/6/2016.
 */

var config = require('config');
var router = require('express').Router();
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var _ = require('underscore');
var apiVersion = ('v'+process.env.API_VERSION).toLowerCase();
var NurseryController = require('../controllers/'+ apiVersion+ '/nursery');
var checkToken = require('../../api/middlewares/auth_token');
var canUpdateLogo = require('../middlewares/can_update_logo');
var helper = require('../../utils/helper');



var s3 = new aws.S3(config.get('aws.credentials'));
var uploadLogo = multer({
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
            var prefix = "nurseries/logo/" + (req.nursery._id || Date.now())+"."+ext;
            cb(null, prefix);
        }
    })
});
//Middleware to check authorization token
router.use(checkToken);

router.route('/nurseries')
    .post(NurseryController.createNursery)
    .get(NurseryController.find);

/*nursery_id param*/
router.param('nursery_id',NurseryController.nurseryIdParam);
router.route('/nurseries/:nursery_id')
    .get(NurseryController.findOne)
    .put(NurseryController.update)
    .delete(NurseryController.deleteNursery);
router.post('/nurseries/:nursery_id/logo',canUpdateLogo,uploadLogo.single('logo'),NurseryController.uploadLogo);
module.exports = router;
