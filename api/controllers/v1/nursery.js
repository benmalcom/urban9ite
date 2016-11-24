/**
 * Created by Malcom on 11/6/2016.
 */
var Q = require('q');
var Validator = require('validatorjs');
var _ = require('underscore');
var config = require('config');
var Nursery = require('../../models/nursery');
var formatResponse = require('../../shared/format-response');
var helper = require('../../../utils/helper');

module.exports = {

    nurseryIdParam: function (req,res,next,nursery_id) {
        var error = {};
        Nursery.findById(nursery_id, function (err, nursery) {
            if (err) {
                console.log("error ",err);
                error =  helper.transformToError({code:503,message:"Error in server interaction!"}).toCustom();
                return next(error);
            }
            else if(nursery){
                req.nursery = nursery;
                next();
            }
            else {
                error =  helper.transformToError({code:404,message:"Nursery not found!"}).toCustom();
                return next(error);
            }
        });
    },

    createNursery: function(req, res, next){
        var meta = {code:200, success:true},
            error = {};
        var obj = req.body;
        var rules = Nursery.createRules();
        var validator = new Validator(obj,rules,{'required.name':"The name of the nursery is required"});
        if(validator.passes()) {
            var userId = req.userId;
            var nursery = new Nursery(_.extend({}, obj, {owner:userId}));
            nursery.save()
                .then(function (savedNursery) {
                    meta.message = "Nursery created!";
                    res.status(meta.code).json(formatResponse.do(meta, savedNursery));
                }, function (err) {
                    console.log("error ", err);
                    error = helper.transformToError({code: 503, message: "Error in server interaction!"}).toCustom();
                    return next(error);
                });
        }
        else {
            error =  helper.transformToError({
                code:422,
                message:"There are some errors with your input",
                messages:helper.validationErrorsToArray(validator.errors.all())}).toCustom();
            return next(error);
        }
    },
    findOne: function (req, res, next) {
        var meta = {code:200, success:true},
            nursery = req.nursery;
        res.status(meta.code).json(formatResponse.do(meta,nursery));
    },
    find: function (req, res, next) {
        var query = req.query,
            meta = {code:200, success:true},
            error = {};

        var per_page = query.per_page ? parseInt(query.per_page,"10") : config.get('itemsPerPage.default');
        var page = query.page ? parseInt(query.page,"10") : 1;
        var baseRequestUrl = config.get('app.baseUrl')+config.get('api.prefix')+"/nurseries";
        meta.pagination = {per_page:per_page,page:page,current_page:helper.appendQueryString(baseRequestUrl, "page="+page)};


        if(page > 1) {
            var prev = page - 1;
            meta.pagination.previous = prev;
            meta.pagination.previous_page = helper.appendQueryString(baseRequestUrl,"page="+prev);
        }

        Q.all([
            Nursery.find().skip(per_page * (page-1)).limit(per_page).sort('-createdAt'),
            Nursery.count().exec()
        ]).spread(function(nurseries, count) {
            meta.pagination.total_count = count;
            if(count > (per_page * page)) {
                var next = page + 1;
                meta.pagination.next = next;
                meta.pagination.next_page = helper.appendQueryString(baseRequestUrl,"page="+next);
            }
            res.status(meta.code).json(formatResponse.do(meta,nurseries));
        }, function(err) {
            console.log("err ",err);
            error =  helper.transformToError({code:503,message:"Error in server interaction",extra:err});
            return next(error);
        });
    },
    deleteNursery: function (req, res, next) {
        var meta = {code:200, success:true},
            error = {},
            nursery = req.nursery;

        nursery.remove(function (err) {
            if(err) {
                console.log("error ",err);
                error =  helper.transformToError({code:503,message:"Problem deleting nursery, please try again!"}).toCustom();
                return next(error);
            }
            else {
                meta.message = "Nursery deleted!";
                res.status(meta.code).json(formatResponse.do(meta));
            }

        });
    },
    update: function(req, res, next) {
        var meta = {code: 200, success: true},
            obj = req.body,
            error = {},
            nursery = req.nursery;
        _.extend(nursery, obj);
        nursery.save(function (err, savedNursery) {
            if (err) {
                console.log("err ", err);
                error = helper.transformToError({
                    code: 503,
                    message: "Nursery details could not be updated at this time, try again!"
                }).toCustom();
                return next(error);
            }
            else {
                meta.message = "Nursery details updated!";
                res.status(meta.code).json(formatResponse.do(meta, savedNursery));
            }
        });
    },
    uploadLogo: function (req, res, next) {
        var error = {},
            nursery = req.nursery,
            meta = {code:200, success:true};
        var updateObj = {logo : req.file ? req.file.location : ""};
        _.extend(nursery,updateObj);
        nursery.save(function (err,savedNursery) {
            if (err) {
                error =  helper.transformToError({code:503,message:"We encountered an error while updating your avatar!"}).toCustom();
                return next(error);
            }
            else {
                meta.message = "Logo uploaded successfully!";
                res.status(meta.code).json(formatResponse.do(meta,savedNursery));
            }
        });
    }
};
