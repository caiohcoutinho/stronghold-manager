var express = require('express');
var app = express();

const { Pool, Client } = require('pg')

const pool = new Pool({max: 200});

const path = require('path');

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'static/index.html'));
});

app.use(express.static(path.join(__dirname, 'static')));

const port = process.env.PORT || 8080

var server = app.listen(port, function () {
   var host = server.address().address

   console.log("Stronghold-Manager running at http://%s:%s", host, port)
})

const log = function(label, object){
    console.log("["+label+"] "+JSON.stringify(object));
}

const logDebug = function(object){
    log("DEBUG", object);
}

const logError = function(object){
    log("ERROR", object);
}

const queryFullTable = function(tableName, response) {
    logDebug("tableName = "+tableName);
    pool
      .query('SELECT * FROM ' + tableName)
      .then(res => {
        response.send(res.rows[0]);
      })
      .catch(err => {
        response.send('Error executing query: ' + err.stack);
      })
}

app.get('/stronghold', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    queryFullTable("stronghold", res);
});