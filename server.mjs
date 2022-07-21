import express from 'express';
import session from 'express-session';
import fs from "fs";
import csrf from 'csurf';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import pg from 'pg';
import path from 'path';
import _ from 'underscore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let Pool = pg.Pool;
let Client = pg.Client;

const app = express();

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

var googlePublicKeysRetrieveDate = null;
var googlePublicKeysMaxAge = null;
var googlePublicKeys = [];

const areKeysExpired = function() {
    if (googlePublicKeysRetrieveDate == null) {
        return true;
    }
    let diff = now.getTime() - googlePublicKeysRetrieveDate;
    let diffInSeconds = diff / 1000;
    return diff >= googlePublicKeysMaxAge;
}

const refreshGoogleKeys = async function(){
    return axios
        .get('https://www.googleapis.com/oauth2/v1/certs')
        .then(function (response) {
            googlePublicKeysRetrieveDate = new Date();
            googlePublicKeysMaxAge = parseInt(response.headers['cache-control'].match(/max-age=(\d+)/)[1], 10);
            googlePublicKeys = response.data;
          })
          .catch(function (error) {
            googlePublicKeysRetrieveDate = null;
            googlePublicKeysMaxAge = null;
            googlePublicKeys = [];
            logError('Error while trying to refresh google public keys: '+error);
            logError(error.stack);
          });
}

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

const pool = new Pool({max: 200});

const verifyIdTokenWithKey = function(idToken, pub){
    return jwt.verify(idToken, pub, {
           audience: "240439775239-khrfib64ndsij9nndeoprqrg1gkogn4r.apps.googleusercontent.com",
           issuer: ["accounts.google.com", "https://accounts.google.com"],
           algorithms: 'RS256'});
}

const isNullOrUndefined = function(obj) {
    return _.isNull(obj) || _.isUndefined(obj);
}

const validateIdToken = async function(idToken) {
    if(areKeysExpired){
        await refreshGoogleKeys();
    }
    let i = 0;
    return _.find(_.map(_.values(googlePublicKeys), (key) => {
        //logDebug("Trying "+(1+i++)+"th key");
        try {
            return verifyIdTokenWithKey(idToken, key);
            //logDebug("Key worked.");
            return true;
        } catch(error) {
            //logDebug("Key did not work.");
            return null;
        }
    }), _.negate(_.isNull));
}

const validateAuthenticated = function(callback) {
    return function(req, res){
        let idToken = req.session.parsedToken;
        if(!process.env.LOCAL && isNullOrUndefined(idToken)){
            res.status(401);
            res.send("Unauthorized");
        } else {
            callback(req, res, idToken);
        }
    }
}

const setHeadersNeverCache = function(res){
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
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

app.get('/components/profile/login.js', function(req, res) {
  res.sendFile(path.join(__dirname, 'static/components/profile/login'+ (process.env.LOCAL ? '-local' : '') +'.js'));
});

app.use(express.static(path.join(__dirname, 'static')));

const port = process.env.PORT || 8080

var server = app.listen(port, function () {
   var host = server.address().address

   console.log("Stronghold-Manager running at http://%s:%s", host, port)
})

const queryFullTable = function(tableName, response) {
    logDebug("tableName = "+tableName);
    pool
      .query('SELECT * FROM ' + tableName)
      .then(res => {
        response.send(res.rows);
      })
      .catch(err => {
        logError('Error executing query: ' + err);
        logError(err.stack);
        response.status(500);
        response.send('Error executing query: ' + err.stack);
      })
}

app.post('/authenticate', async function(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if(process.env.LOCAL){
        logDebug("Local testing user");
        req.session.parsedToken = {};
        res.send("OK");
        return;
    }

    let body = req.body;
    let idToken = body.idToken;
    let parsedToken = await validateIdToken(idToken);
    if(isNullOrUndefined(parsedToken)) {
        res.status(401)
        res.send("Unauthorized");
    } else {
        req.session.parsedToken = parsedToken;
        res.send("OK");
    }
});

app.post('/logout', async function(req, res){
    req.session.destroy(function(err) {
      if(err){
        res.status(500)
        res.send("Error while logging out: "+err);
      } else {
        res.send("OK");
      }
    })
});

app.get('/stronghold', validateAuthenticated(async function(req, res, idToken) {
    setHeadersNeverCache(res);
    res.setHeader('Content-Type', 'application/json');
    queryFullTable("stronghold", res);
}));

app.post('/stronghold', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    res.send("OK");
}));