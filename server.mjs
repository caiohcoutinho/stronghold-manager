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
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { SELECT_USER_BY_USER_ID, CREATE_USER } from './server/repository/profile/user_repository.mjs'

import { SELECT_RESOURCE_BY_USER_ID, SELECT_RESOURCE_BY_ID_AND_USER_ID, UPDATE_RESOURCE,
    CREATE_RESOURCE, DELETE_RESOURCE_BY_ID } from './server/repository/resource/resource_repository.mjs'

import { SELECT_STRONGHOLD_BY_USER_ID, SELECT_STRONGHOLD_BY_ID_AND_USER_ID, UPDATE_STRONGHOLD,
    CREATE_STRONGHOLD, DELETE_STRONGHOLD_BY_ID } from './server/repository/stronghold/stronghold_repository.mjs'

import { SELECT_SCENARIO_BY_USER_ID, SELECT_SCENARIO_BY_ID_AND_USER_ID, UPDATE_SCENARIO,
    CREATE_SCENARIO, DELETE_SCENARIO_BY_ID } from './server/repository/scenario/scenario_repository.mjs'

import { SELECT_RECIPE_BY_USER_ID, SELECT_RECIPE_BY_ID_AND_USER_ID, UPDATE_RECIPE,
    CREATE_RECIPE, DELETE_RECIPE_BY_ID } from './server/repository/recipe/recipe_repository.mjs'

let Pool = pg.Pool;

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
    if (process.env.LOCAL){
        return {
           sub: "1234abcd-1234-abcd-1234-abcd1234abcd",
           email: 'test_user@gmail.com',
           name: 'Goofy Goofest',
           picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDEzLQIYir3TKubuEpEgSS3mMWvKbUtPbPzzcKV0V3ai2Jq4FLsL6Kno0aD3H1R34xzsM&usqp=CAU'
        }
    }
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

const sendQuery = function(response, query, values) {
    return runQuery(query, values, (result) => {
        response.send(result.rows);
    }, (err) => {
        logError('Error executing query: ' + err);
        logError(err.stack);
        response.status(500);
        response.send('Error executing query: ' + err.stack);
    });
}

const runQuery = function(query, values, callback, errorCallback) {
    return pool
      .query(query, values)
      .then(res => {
        callback(res);
      })
      .catch(err => {
        errorCallback(err);
      })
}

app.post('/authenticate', async function(req, res) {
    res.setHeader('Content-Type', 'application/json');

    let body = req.body;
    let idToken = body.idToken;
    let parsedToken = await validateIdToken(idToken);
    if(isNullOrUndefined(parsedToken)) {
        res.status(401)
        res.send("Unauthorized");
        return;
    }
    runQuery(SELECT_USER_BY_USER_ID, [parsedToken.sub], (result) => {
       if(_.isEmpty(result.rows)){
            logDebug("User don't exist. Creating.");
            runQuery(CREATE_USER,
                [parsedToken.sub, parsedToken.name, parsedToken.email, parsedToken.picture],
                (result2) => {
                   req.session.parsedToken = parsedToken;
                   res.send("OK");
                   return;
                },
                (err) => {
                    logError("Error while creating user: "+err);
                    logError(err.stack);
                    res.status(500)
                    res.send("Internal server error");
                    return;
                });
       } else {
           req.session.parsedToken = parsedToken;
           res.send("OK");
           return;
       }
    }, (err) => {
        logError("Error while trying get check existing user: "+err);
        logError(err.stack);
        res.status(500)
        res.send("Internal server error");
        return;
    });
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
    sendQuery(res, SELECT_STRONGHOLD_BY_USER_ID, [idToken.sub]);
}));

app.put('/stronghold', validateAuthenticated(async function(req, res, idToken) {
    setHeadersNeverCache(res);
    res.setHeader('Content-Type', 'application/json');
    let stronghold = req.body.stronghold;
    sendQuery(res, UPDATE_STRONGHOLD, [stronghold.id, stronghold.name, stronghold.scenario_id, idToken.sub]);
}));

app.post('/stronghold', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    sendQuery(res, CREATE_STRONGHOLD, [uuidv4(), req.body.name, idToken.sub]);
}));

app.delete('/stronghold', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    runQuery(SELECT_STRONGHOLD_BY_ID_AND_USER_ID, [req.body.stronghold.id, idToken.sub],
        (result) => {
            let strongholdToDelete = result.rows[0];
            if(isNullOrUndefined(strongholdToDelete)){
                logError("Cannot find stronghold to delete: "+err);
                logError(err.stack);
                res.status(500)
                res.send("Internal server error");
                return;
            }
            sendQuery(res, DELETE_STRONGHOLD_BY_ID, [strongholdToDelete.id]);
        },
        (err) => {
            logError("Error while trying to find stronghold to delete: "+err);
            logError(err.stack);
            res.status(500)
            res.send("Internal server error");
            return;
        });
}));

app.get('/scenario', validateAuthenticated(async function(req, res, idToken) {
    setHeadersNeverCache(res);
    res.setHeader('Content-Type', 'application/json');
    sendQuery(res, SELECT_SCENARIO_BY_USER_ID, [idToken.sub]);
}));

app.post('/scenario', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    sendQuery(res, CREATE_SCENARIO, [uuidv4(), req.body.name, idToken.sub]);
}));

app.put('/scenario', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    let scenario = req.body.scenario;
    sendQuery(res, UPDATE_SCENARIO, [scenario.id, scenario.name, idToken.sub]);
}));

app.delete('/scenario', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    runQuery(SELECT_SCENARIO_BY_ID_AND_USER_ID, [req.body.scenario.id, idToken.sub],
        (result) => {
            let scenarioToDelete = result.rows[0];
            if(isNullOrUndefined(scenarioToDelete)){
                logError("Cannot find scenario to delete: "+err);
                logError(err.stack);
                res.status(500)
                res.send("Internal server error");
                return;
            }
            sendQuery(res, DELETE_SCENARIO_BY_ID, [scenarioToDelete.id]);
        },
        (err) => {
            logError("Error while trying to find scenario to delete: "+err);
            logError(err.stack);
            res.status(500)
            res.send("Internal server error");
            return;
        });
}));

app.get('/resource', validateAuthenticated(async function(req, res, idToken) {
    setHeadersNeverCache(res);
    res.setHeader('Content-Type', 'application/json');
    sendQuery(res, SELECT_RESOURCE_BY_USER_ID, [idToken.sub]);
}));

app.post('/resource', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    sendQuery(res, CREATE_RESOURCE, [uuidv4(), req.body.name, idToken.sub]);
}));

app.put('/resource', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    let resource = req.body.resource;
    sendQuery(res, UPDATE_RESOURCE, [resource.id, idToken.sub, resource.name, resource.scenario_id,
        resource.icon, resource.hex, resource.filter]);
}));

app.delete('/resource', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    runQuery(SELECT_RESOURCE_BY_ID_AND_USER_ID, [req.body.resource.id, idToken.sub],
        (result) => {
            let resourceToDelete = result.rows[0];
            if(isNullOrUndefined(resourceToDelete)){
                logError("Cannot find resource to delete: "+err);
                logError(err.stack);
                res.status(500)
                res.send("Internal server error");
                return;
            }
            sendQuery(res, DELETE_RESOURCE_BY_ID, [resourceToDelete.id]);
        },
        (err) => {
            logError("Error while trying to find resource to delete: "+err);
            logError(err.stack);
            res.status(500)
            res.send("Internal server error");
            return;
        });
}));

app.get('/recipe', validateAuthenticated(async function(req, res, idToken) {
    setHeadersNeverCache(res);
    res.setHeader('Content-Type', 'application/json');
    sendQuery(res, SELECT_RECIPE_BY_USER_ID, [idToken.sub]);
}));

app.post('/recipe', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    sendQuery(res, CREATE_RECIPE, [uuidv4(), req.body.name, idToken.sub]);
}));

app.put('/recipe', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    let recipe = req.body.recipe;
    sendQuery(res, UPDATE_RECIPE, [recipe.id, recipe.name, recipe.scenario_id, idToken.sub]);
}));

app.delete('/recipe', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    runQuery(SELECT_RECIPE_BY_ID_AND_USER_ID, [req.body.recipe.id, idToken.sub],
        (result) => {
            let recipeToDelete = result.rows[0];
            if(isNullOrUndefined(recipeToDelete)){
                logError("Cannot find recipe to delete: "+err);
                logError(err.stack);
                res.status(500)
                res.send("Internal server error");
                return;
            }
            sendQuery(res, DELETE_RECIPE_BY_ID, [recipeToDelete.id]);
        },
        (err) => {
            logError("Error while trying to find recipe to delete: "+err);
            logError(err.stack);
            res.status(500)
            res.send("Internal server error");
            return;
        });
}));