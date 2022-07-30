import { Authentication } from "../authentication/Authentication.mjs";
import { HtmlUtilities } from "../commons/HtmlUtilities.mjs";
import _ from "../commons/UnderscoreMixin.mjs";
import { ScenarioQueries } from "./scenario_queries.mjs";
import { IdGenerator } from "../commons/IdGenerator.mjs";

const getScenario = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    HtmlUtilities.sendQuery(res, ScenarioQueries.SELECT_SCENARIO_BY_USER_ID, [idToken.sub]);
});

const postScenario = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    HtmlUtilities.sendQuery(res, ScenarioQueries.CREATE_SCENARIO, [IdGenerator.uuidv4(), req.body.name, idToken.sub]);
});

const putScenario = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    let scenario = req.body.scenario;
    HtmlUtilities.sendQuery(res, ScenarioQueries.UPDATE_SCENARIO, [scenario.id, scenario.name, idToken.sub]);
});

const deleteScenario = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    let scenario_id = req.body.scenario.id;
    let scenario = await HtmlUtilities.runQuerySync(ScenarioQueries.SELECT_SCENARIO_BY_ID_AND_USER_ID, [scenario_id, idToken.sub]).rows[0];
    if (_.isNullOrUndefined(scenario)) {
        throw new Error("Could not find scenario do delete with id: " + scenario_id);
    }
    HtmlUtilities.sendQuery(res, ScenarioQueries.DELETE_SCENARIO_BY_ID, [scenario_id]);
});

export const ScenarioRepository = {
    getScenario,
    postScenario,
    putScenario,
    deleteScenario
}