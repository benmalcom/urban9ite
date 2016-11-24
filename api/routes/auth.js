/**
 * Created by Emmanuel on 4/30/2016.
 */
var config = require('config');
var router = require('express').Router();
var multer = require('multer');
var apiVersion = ('v'+process.env.API_VERSION).toLowerCase();
var AuthController = require('../controllers/'+apiVersion+ '/auth');
var checkToken = require('../../api/middlewares/auth_token');

router.post('/login', AuthController.login);

//Middleware to check authorization token
router.use(checkToken);
router.post('/register', AuthController.startRegistration)
    .post('/verify-code', AuthController.verifyCode)
    .post('/change-password', AuthController.changePassword);
module.exports = router;
