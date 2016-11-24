var express = require('express');
var router = express.Router();

//Require middlewares here
var isAuthenticated = require('../middlewares/isAuthenticated');
var hasRole = require('../middlewares/hasRole');

//Require routes here
var adminRoutes = require('../routes/admin');
var pagesRoutes = require('../routes/pages');


router.use(isAuthenticated);
router.use(hasRole);

adminRoutes(router);
pagesRoutes(router);

module.exports = router;
