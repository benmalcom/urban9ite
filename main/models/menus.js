/**
 * Created by Emmanuel on 10/15/2016.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var MenusSchema = new Schema({
    name: {type:String, required: true},
    parent_id: {type:String, required: true},
    url: {type:String, default: "#"},
    active: {type:Number, default: 1},
    sequence: {type:Number, default: 1},
    icon: {type:String},
    type: {type:Number, default: 1},
    roles: [Schema.Types.ObjectId]
},{
    timestamps: true
});

MenusSchema.post('save', function(doc) {
    console.log('%s has been saved', doc._id);
});

MenusSchema.post('remove', function(doc) {
    console.log('%s has been removed', doc._id);
});
module.exports = mongoose.model('Menus', MenusSchema);
