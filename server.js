var express = require('express');
var session = require('express-session');
var fs = require("fs");
var csrf = require('csurf');
var _ = require('underscore');

var app = express();

const htmlRenderer = function(path, view_options, callback){
    let props = view_options.properties;
    let str = fs.readFileSync(path).toString();
    _.each(_.pairs(props),  (pair) => {
        str = str.replace(new RegExp('#{'+pair[0]+'}', 'g'), pair[1]);
    });
    callback(null, str);
}

app.engine('html', htmlRenderer);

// creating 2 hours from milliseconds
const twoHours = 1000 * 60 * 60 * 2;
const threeSecond = 1000 * 3;

//session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: twoHours },
    resave: false,
    rolling: true
}));


app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.use(csrf());

const { Pool, Client } = require('pg')

const pool = new Pool({max: 200});

const path = require('path');

const validateCsrfToken = function(req, requestCrsfToken) {
    if(req.session.csrfToken !== requestCrsfToken) {
        throw new Error("Invalid CSRF Token");
    }
}

app.get('/', function(req, res) {
  if (req.session.csrfToken == undefined){
    req.session.csrfToken = req.csrfToken();
  }
  res.header('Content-type', 'text/html');
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.render(path.join(__dirname, 'static/index.html'),
        {properties: {csrfToken: req.session.csrfToken}});
});

app.get('/components/profile.js', function(req, res) {
  res.sendFile(path.join(__dirname, 'static/components/profile'+ (process.env.LOCAL ? '-local' : '') +'.js'));
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

const logInfo = function(object){
    log("INFO", object);
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

app.post('/stronghold', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    let body = req.body;
    validateCsrfToken(req, body.csrfToken);
    res.send("OK");
});