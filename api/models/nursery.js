/**
 * Created by Malcom on 11/6/2016.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NurserySchema = new Schema({
    name: {type:String, required: true},
    logo: {type:String},
    website: {type:String},
    children_capacity: {type:String},
    primary_mobile: {type:String},
    other_mobiles: [String],
    primary_email: {type:String},
    other_emails: [String],
    owner: {type: Schema.Types.ObjectId, ref: 'User'}, //Owner of the nursery
    location: {
        street: {type:String},
        city: {type:String},
        state: {type:String},
        zip: {type:String}
    }
},{
    timestamps: true
});

NurserySchema.statics.createRules = function() {
    return {
        name : 'required'
    }
};

NurserySchema.post('save', function(doc) {
    console.log('%s has been saved', doc._id);
});

NurserySchema.post('remove', function(doc) {
    console.log('%s has been removed', doc._id);
});

module.exports = mongoose.model('Nursery', NurserySchema);
