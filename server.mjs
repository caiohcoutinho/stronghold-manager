import express from 'express';
import session from 'express-session';
import csrf from 'csurf';
import pg from 'pg';
import path from 'path';
import _ from './server/repository/commons/UnderscoreMixin.mjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Logger from './server/repository/commons/LogCommons.mjs';
import { htmlRenderer } from './server/repository/commons/HtmlRenderer.mjs';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

import { Authentication } from './server/repository/authentication/Authentication.mjs';
import { StrongholdRepository } from './server/repository/stronghold/stronghold_repository.mjs'
import { UserRepository } from './server/repository/user/user_repository.mjs'
import { ResourceRepository } from './server/repository/resource/resource_repository.mjs'
import { ScenarioRepository } from './server/repository/scenario/scenario_repository.mjs'
import { RecipeRepository } from './server/repository/recipe/recipe_repository.mjs'
import { FormulaNodeRepository } from './server/repository/recipe/formula_node_repository.mjs';
import { SERVER_ENABLED_LOG_ENABLED } from './server/repository/commons/LogProperties.mjs';

const app = express();

const logger = new Logger(SERVER_ENABLED_LOG_ENABLED, 'Server');

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

app.get('/components/profile/login.js', function(req, res) {
    res.sendFile(path.join(__dirname, 'static/components/profile/login' + (process.env.LOCAL ? '-local' : '') + '.js'));
});

app.use(express.static(path.join(__dirname, 'static')));

app.use('/favicon.ico', express.static('static/favicon.ico'));

app.post('/authenticate', Authentication.postAuthenticate);
app.post('/logout', Authentication.postLogout);

app.get('/stronghold', StrongholdRepository.getStronghold);
app.put('/stronghold', StrongholdRepository.putStronghold);
app.post('/stronghold', StrongholdRepository.postStronghold);
app.delete('/stronghold', StrongholdRepository.deleteStronghold);

app.get('/scenario', ScenarioRepository.getScenario);
app.put('/scenario', ScenarioRepository.putScenario);
app.post('/scenario', ScenarioRepository.postScenario);
app.delete('/scenario', ScenarioRepository.deleteScenario);

app.get('/resource', ResourceRepository.getResource);
app.post('/resource', ResourceRepository.postResource);
app.put('/resource', ResourceRepository.putResource);
app.delete('/resource', ResourceRepository.deleteResource);

app.get('/recipe', RecipeRepository.getRecipe);
app.post('/recipe', RecipeRepository.postRecipe);
app.put('/recipe', RecipeRepository.putRecipe);
app.delete('/recipe', RecipeRepository.deleteRecipe);

app.get('/formula/:formula_id', FormulaNodeRepository.getFormula);