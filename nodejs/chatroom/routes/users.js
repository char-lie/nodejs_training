var express = require('express'),
    _ = require('lodash'),
    assert = require('assert'),
    router = express.Router(),
    http = require('http'),
    httpStatus = require('http-status'),
    MongoClient = require('mongodb').MongoClient,
    ObjectId = require('mongodb').ObjectId,
    Users = new require('../models/Users.js')(),
    debug = require('debug')('Users');

var sendError = function (response, statusCode) {
    response.status(statusCode).json({success: false, error: httpStatus[statusCode]});
};

router.param('user_id', function (request, response, next, user_id) {
    request.users = [];
    Users.findById(user_id, function (err, got) {
        if (err != null) {
            console.error(err);
            sendError(response, httpStatus.INTERNAL_SERVER_ERROR);
            //request.error = httpStatus.INTERNAL_SERVER_ERROR;
        }
        request.users = got;
        return next();
    });
});

router.get('/', function(request, response, next) {
    Users.find({}, function (err, got) {
        if (err != null) {
            console.error(err);
            sendError(response, httpStatus.INTERNAL_SERVER_ERROR);
            return;
        }
        response.json({success: true, response: got});
    });
});

router.get('/:user_id', function(request, response, next) {
    if (request.users.length == 0) {
        sendError(response, httpStatus.NOT_FOUND);
        return;
    }
    response.json({success: true, response: request.users});
});

router.post('/', function(request, response, next) {
    if (Object.keys(request.body).length == 0) {
        sendError(response, httpStatus.BAD_REQUEST);
        return;
    }
    Users.insert([request.body], function (err, result) {
        assert.equal(err, null);
        response.json({success: result.result.ok == 1, response: {users: result.ops}});
    });
});

router.delete('/', function(request, response, next) {
    sendError(response, httpStatus.BAD_REQUEST);
});

// TODO: change parameter name for not calling `parameter' method?
router.delete('/:user_id', function(request, response, next) {
    Users.removeById(request.params.user_id, function (err, deleted) {
        if (err != null) {
            console.error(err);
            sendError(response, httpStatus.INTERNAL_SERVER_ERROR);
            return;
        } else if (deleted.length == 0) {
            sendError(response, httpStatus.NOT_FOUND);
            return;
        }
        response.json({success: deleted.result.ok == 1, response: {count: deleted.result.n}});
    });
});

module.exports = router;
