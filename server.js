'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs');
var validators = require('./app/scripts/validation');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./lib/config/config');

//var db = mongoose.connect(config.mongo.uri, config.mongo.options);

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

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "localhost:8888,localhost:9000");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};
//app.use(allowCrossDomain);

var mysql = require('mysql');
var squel = require('squel');
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

var db = {};
MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, dbNew) {
    if (err) throw err;
    db = dbNew;
});

var connectionpool = mysql.createPool({
    host     : process.env.RDS_HOSTNAME || 'localhost',
    user     : process.env.RDS_USERNAME || 'ehr-db-user',
    password : process.env.RDS_PASSWORD || 'ehr-admin-pw',
    port 	   : process.env.RDS_PORT || 3306,
    database: 'ebdb',
    timezone: 'UTC' // important: if not set, node-mysql does funny time calculations
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
        } else if (mode==="validate") {
            var obj = request.body;
            console.dir(validators.validateUser(obj));
            if (!obj.name || ""===obj.name) {
                response.send({error: "Please enter a name", field: "name", input: obj});
            } else if ("Stivo"===obj.name) {
                response.send({error: "This name is taken and always will be", field: "name", input: obj});
            } else if (validators.validateUser(obj).error) {
                response.send(validators.validateUser(obj));
            } else
            {
                coll.findOne({name: obj.name}, function (err, item) {
                    console.log("Name here ist " + obj.name + " item "+ item);
                    if (item) {
                        response.send({error: "This name is taken", field: "name", input: obj});
                    } else {
                        response.send({input: obj});
                    }
                });
            }
        } else if (mode==="create") {
            console.dir(request.body);
            var obj = request.body;
            if (!obj.name || ""===obj.name) {
                response.send({error: "Please enter a name", field: "name", input: obj});
            } else if ("Stivo"===obj.name) {
                obj.name = "Loser";
                response.send({error: "This name is taken and always will be", field: "name", input: obj});
            } else
            {
                coll.insert(request.body, function (err, docs) {
                    response.send({success: err});
                });
            }
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

require('./lib/routes')(app);

app.set('json spaces', 2);
// Start server
app.listen(config.port, config.ip, function () {
  console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
