'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./lib/config/config');
var db = mongoose.connect(config.mongo.uri, config.mongo.options);

// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});

// Populate empty DB with sample data
require('./lib/config/dummydata');

// Passport Configuration
var passport = require('./lib/config/passport');

// Setup Express
var app = express();
require('./lib/config/express')(app);
require('./lib/routes')(app);

var mysql = require('mysql');
var squel = require('squel');
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

var connectionpool = mysql.createPool({
    host     : process.env.RDS_HOSTNAME || 'localhost',
    user     : process.env.RDS_USERNAME || 'ehr-db-user',
    password : process.env.RDS_PASSWORD || 'ehr-admin-pw',
    port 	   : process.env.RDS_PORT || 3306,
    database: 'ebdb',
    timezone: 'UTC' // important: if not set, node-mysql does funny time calculations
});

var db = {};
MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, dbNew) {
    if (err) throw err;
    db = dbNew;
});

startMongoDbService('consultation');



startQueryService('patient', ['lastname', 'firstname', 'city', 'birthday']);
startQueryService('employee', ['lastname', 'firstname']);

function startMongoDbService(serviceName) {

    app
        .get('/' + serviceName, function (request, response) {
            var mode = request.query.mode;
            var coll = db.collection('tests');
            if (mode==="makeDummy") {
                coll.insert({asdf: "bla"}, function(err, docs)
                {
                    coll.find().toArray(function (err, results) {
                        response.send(results);
                    });
                });
            } else if (mode==="list") {
                coll.find().toArray(function (err, results) {
                    response.send(results);
                });
            } else if (mode==="clear") {
                coll.remove(function (err, results) {
                    response.send(results);
                });
            } else {
                response.send("Unsupported mode: "+ mode);
            }

        });
    app.post('/' + serviceName, function (request, response) {
        var mode = request.query.mode;
        var coll = db.collection('tests');
        if (mode==="makeDummy") {
            coll.insert({asdf: "bla"}, function(err, docs)
            {
                coll.find().toArray(function (err, results) {
                    response.send(results);
                });
            });
        } else if (mode==="create") {
            console.dir(request.body);
            coll.insert(request.body, function(err, docs) {
                response.send()
                response.send("Has error? "+err);
            });
        } else {
            response.send("Unsupported mode: "+ mode);
        }

    });

}


function startQueryService(serviceName, allowedForFiltering) {

    app
        .get('/' + serviceName, function (request, response) {
            connectionpool.getConnection(function (err, connection) {
                if (err) {
                    console.error('CONNECTION error: ', err);
                    response.statusCode = 503;
                    response.send({
                        result: 'error',
                        err: err.code
                    });
                } else {
                    var select = squel.select();

                    select.from(serviceName);
                    select.limit(200);

                    for (var parameterName in request.query) {
                        if (request.query.hasOwnProperty(parameterName) && allowedForFiltering.indexOf(parameterName) >= 0) {
                            select.where(parameterName + ' = ?', request.param(parameterName));
                        }
                    }

                    connection.query(select.toParam().text, select.toParam().values, function (err, rows) {

                        if (err) {
                            console.error(err);
                            response.statusCode = 500;
                            response.send({
                                result: 'error',
                                err: err.code
                            });
                        }

                        response.send(rows);

                        connection.release();
                    });
                }
            });
        });
}


// Start server
app.listen(config.port, config.ip, function () {
  console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
