
var HomeController = require('../controllers/home');

var NurseryController = require('../controllers/nursery');

//All routes here
module.exports = function (router) {
    /* GET home page. */
    router.get('/', HomeController.index);

    /* GET nursery page. */
    router.get('/nursery', NurseryController.index);
};
