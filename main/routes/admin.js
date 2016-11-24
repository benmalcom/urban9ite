
var MenusController = require('../controllers/admin/menus');
var UserTypesController = require('../controllers/admin/user-types');

//All routes here
module.exports = function (router) {
    router.post('/menus', MenusController.saveMenu);

    /* GET nursery page. */
    router.get('/user-types', UserTypesController.index);
    router.post('/user-types', UserTypesController.updateUserTypes);
    router.delete('/user-types/:user_type_id', UserTypesController.deleteUserTypes);
};
