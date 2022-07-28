import express from 'express';
import session from 'express-session';
import csrf from 'csurf';
import axios from 'axios';
import pg from 'pg';
import path from 'path';
import _ from '/server/repository/commons/UnderscoreMixin.mjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Logger from './server/repository/commons/LogCommons.mjs';
import { htmlRenderer } from './server/repository/commons/HtmlRenderer.mjs';
import { HtmlUtilities } from './server/repository/commons/HtmlUtilities.mjs';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

import { Authentication } from './server/repository/authentication/Authentication.mjs';
import { StrongholdRepository } from './server/repository/stronghold/stronghold_repository.mjs'

import { USER_REPOSITORY } from './server/repository/profile/user_repository.mjs'
import { RESOURCE_REPOSITOR } from './server/repository/resource/resource_repository.mjs'
import { RESOURCE_REPOSITORY } from './server/repository/scenario/scenario_repository.mjs'
import { RECIPE_REPOSITORY } from './server/repository/recipe/recipe_repository.mjs'
import { FORMULA_NODE_REPOSITORY } from './server/repository/recipe/formula_node_repository.mjs';

let Pool = pg.Pool;

const app = express();

const logger = new Logger('server.mjs');

app.engine('html', htmlRenderer);

// creating 2 hours from milliseconds
const TWO_HOURS = 1000 * 60 * 60 * 2;
const THREE_SECONDS = 1000 * 3;

//session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: TWO_HOURS },
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

const pool = new Pool({ max: 200 });

const port = process.env.PORT || 8080

var server = app.listen(port, function() {
    var host = server.address().address;

    console.log("Stronghold-Manager running at http://%s:%s", host, port)
})

app.get('/', function(req, res) {
    if (req.session.csrfToken == undefined) {
        req.session.csrfToken = req.csrfToken();
    }
    res.header('Content-type', 'text/html');
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.render(path.join(__dirname, 'static/index.html'), { properties: { csrfToken: req.session.csrfToken } });
});

app.use(express.static(path.join(__dirname, 'static')));

app.use('/favicon.ico', express.static('static/favicon.ico'));

app.get('/components/profile/login.js', function(req, res) {
    res.sendFile(path.join(__dirname, 'static/components/profile/login' + (process.env.LOCAL ? '-local' : '') + '.js'));
});

app.post('/authenticate', Authentication.postAuthenticate);
app.post('/logout', Authentication.postLogout);


app.get('/stronghold', StrongholdRepository.getStronghold);
app.put('/stronghold', StrongholdRepository.putStronghold);
app.post('/stronghold', StrongholdRepository.postStronghold);
app.delete('/stronghold', StrongholdRepository.deleteStronghold);

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
            if (isNullOrUndefined(scenarioToDelete)) {
                logger.logError("Cannot find scenario to delete: " + err);
                logger.logError(err.stack);
                res.status(500)
                res.send("Internal server error");
                return;
            }
            sendQuery(res, DELETE_SCENARIO_BY_ID, [scenarioToDelete.id]);
        },
        (err) => {
            logger.logError("Error while trying to find scenario to delete: " + err);
            logger.logError(err.stack);
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
        resource.icon, resource.hex, resource.filter
    ]);
}));

app.delete('/resource', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    runQuery(SELECT_RESOURCE_BY_ID_AND_USER_ID, [req.body.resource.id, idToken.sub],
        (result) => {
            let resourceToDelete = result.rows[0];
            if (isNullOrUndefined(resourceToDelete)) {
                logger.logError("Cannot find resource to delete: " + err);
                logger.logError(err.stack);
                res.status(500)
                res.send("Internal server error");
                return;
            }
            sendQuery(res, DELETE_RESOURCE_BY_ID, [resourceToDelete.id]);
        },
        (err) => {
            logger.logError("Error while trying to find resource to delete: " + err);
            logger.logError(err.stack);
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
    runQuery(UPDATE_RECIPE, [recipe.id, recipe.name, recipe.scenario_id, idToken.sub],
        (result) => {
            try {
                upsertFormula(pool, uuidv4, recipe, idToken);
                res.send("OK");
                return;
            } catch (e) {
                logger.logError(e);
                logger.logError(e.stack);
                res.status(500);
                res.send("Internal server error");
                return;
            }
        },
        (err) => {
            logger.logError("Error while trying to find update recipe: " + err);
            logger.logError(err.stack);
            res.status(500)
            res.send("Internal server error");
            return;
        });
}));

app.delete('/recipe', validateAuthenticated(async function(req, res, idToken) {
    res.setHeader('Content-Type', 'application/json');
    runQuery(SELECT_RECIPE_BY_ID_AND_USER_ID, [req.body.recipe.id, idToken.sub],
        (result) => {
            let recipeToDelete = result.rows[0];
            if (isNullOrUndefined(recipeToDelete)) {
                logger.logError("Cannot find recipe to delete: " + err);
                logger.logError(err.stack);
                res.status(500)
                res.send("Internal server error");
                return;
            }
            let formula_id = recipeToDelete.formula_id;
            runQuery(DELETE_RECIPE_BY_ID, [recipeToDelete.id],
                (result2) => {;
                    (async() => {
                        const client = await pool.connect()
                        try {
                            await client.query('BEGIN');
                            let rootNode = await deleteFormulaNode(client, formula_id, idToken);
                            await client.query('COMMIT')
                            client.release();
                            res.send("OK");
                            return;
                        } catch (e) {
                            await client.query('ROLLBACK')
                            logger.logError(e);
                            logger.logError(e.stack);
                            res.status(500);
                            res.send("Internal server error");
                            client.release();
                            return;
                        }
                    })().catch(e => console.error(e.stack))
                },
                (err) => {
                    logger.logError("Error while trying to delete recipe: " + err);
                    logger.logError(err.stack);
                    res.status(500)
                    res.send("Internal server error");
                    return;
                });
        },
        (err) => {
            logger.logError("Error while trying to find recipe to delete: " + err);
            logger.logError(err.stack);
            res.status(500)
            res.send("Internal server error");
            return;
        });
}));

const getFormulaNode = async function(client, node_id, idToken) {
    let result = await client.query(SELECT_FORMULA_NODE_BY_ID_AND_USER_ID, [node_id, idToken.sub]);
    if (_.isEmpty(result.rows)) {
        return;
    }
    let node = result.rows[0];
    let childrenResult = await client.query(SELECT_FORMULA_NODE_BY_PARENT_ID_AND_USER_ID, [node.node_id, idToken.sub]);
    let children = childrenResult.rows;
    if (!_.isEmpty(children)) {
        node.children = await Promise.all(_.map(children, (child) => {
            let childResult = getFormulaNode(client, child.node_id, idToken);
            return childResult;
        }));
    }
    return node;
}

app.get('/formula/:formula_id', validateAuthenticated(async function(req, res, idToken) {
    setHeadersNeverCache(res);
    res.setHeader('Content-Type', 'application/json');
    let formula_id = req.params.formula_id;;
    (async() => {
        const client = await pool.connect()
        try {
            await client.query('BEGIN');
            let rootNode = await getFormulaNode(client, formula_id, idToken);
            await client.query('COMMIT')
            client.release();
            res.send(rootNode);
            return;
        } catch (e) {
            await client.query('ROLLBACK')
            logger.logError(e);
            logger.logError(e.stack);
            res.status(500);
            res.send("Internal server error");
            client.release();
            return;
        }
    })().catch(e => console.error(e.stack))
}));