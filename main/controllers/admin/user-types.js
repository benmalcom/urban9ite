/**
 * Created by Emmanuel on 8/30/2016.
 */

var UserType = require('../../../api/models/user-type');
module.exports = {
    index: function (req, res) {

        UserType.find()
            .sort('-createdAt')
            .exec(function (err, userTypes) {
                if (err) {
                    var error = helper.transformToError({code: 503, message: "Error in server interaction"}).toCustom();
                    req.flash('error','Problem retrieving user types, try again!');
                    res.render('pages/user/user-types',
                        {
                            title: 'Home',
                            error: error
                        });
                }
                else {
                    res.render('pages/user/user-types',
                        {
                            title: 'Home',
                            userTypes: userTypes
                        });
                }
            });
    },
    updateUserTypes: function (req, res) {
        // res.json(req.body);
        var _ids = req.body['_ids[]'];
        var names = req.body['names[]'];
        var updated = 0;
        for(var i = 0;  i < names.length; i++){

            var obj = {
                name : names[i],
                _id : _ids[i]
            };
            if(_ids[i] == '-1'){
                delete obj._id;
                var userType = new UserType(obj);
                userType.save(function (err,data) {
                    if(err){
                        req.flash('error','Problem retrieving user types, try again!');
                    }
                });

            }else{
                UserType.update({_id: obj._id}, obj, {upsert: true,  setDefaultsOnInsert: true}, function (err, data) {
                    if(err){
                        req.flash('error','Problem retrieving user types, try again!');
                    }
                });
            }
        }

        res.redirect('user-types');
    },

    deleteUserTypes: function (req, res) {
        console.log(req.params)
    }
};
