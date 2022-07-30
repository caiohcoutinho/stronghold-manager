import { Authentication } from "../authentication/Authentication.mjs";
import { HtmlUtilities } from "../commons/HtmlUtilities.mjs";
import { StrongholdQueries } from "./stronghold_queries.mjs";
import { IdGenerator } from '../commons/IdGenerator.mjs';
import _ from "../commons/UnderscoreMixin.mjs";

const getStronghold = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    HtmlUtilities.sendQuery(res, StrongholdQueries.SELECT_STRONGHOLD_BY_USER_ID, [idToken.sub]);
});

const putStronghold = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    let stronghold = req.body.stronghold;
    HtmlUtilities.sendQuery(res, StrongholdQueries.UPDATE_STRONGHOLD, [stronghold.id, stronghold.name, stronghold.scenario_id, idToken.sub]);
});

const postStronghold = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    HtmlUtilities.sendQuery(res, StrongholdQueries.CREATE_STRONGHOLD, [IdGenerator.uuidv4(), req.body.name, idToken.sub]);
})

const deleteStronghold = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    let stronghold_id = req.body.stronghold.id;
    let stronghold = await HtmlUtilities.runQuerySync(StrongholdQueries.SELECT_STRONGHOLD_BY_ID_AND_USER_ID, [stronghold_id, idToken.sub].rows[0]);
    if (_.isNullOrUndefined(stronghold)) {
        throw new Error("Couldn't find Stronghold to delete with id: " + stronghold_id);
    }
    HtmlUtilities.sendQuery(res, StrongholdQueries.DELETE_STRONGHOLD_BY_ID, [stronghold_id]);
});

export const StrongholdRepository = {
    getStronghold,
    putStronghold,
    postStronghold,
    deleteStronghold
}