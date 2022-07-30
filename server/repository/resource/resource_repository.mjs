import { ResourceQueries } from "./resource_queries.mjs";
import { Authentication } from "../authentication/Authentication.mjs";
import { HtmlUtilities } from "../commons/HtmlUtilities.mjs";
import { IdGenerator } from "../commons/IdGenerator.mjs";
import _ from "../commons/UnderscoreMixin.mjs";

const getResource = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    HtmlUtilities.sendQuery(res, ResourceQueries.SELECT_RESOURCE_BY_USER_ID, [idToken.sub]);
});

const postResource = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    HtmlUtilities.sendQuery(res, ResourceQueries.CREATE_RESOURCE, [IdGenerator.uuidv4(), req.body.name, idToken.sub]);
});

const putResource = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    let resource = req.body.resource;
    HtmlUtilities.sendQuery(res, ResourceQueries.UPDATE_RESOURCE, [resource.id, idToken.sub, resource.name, resource.scenario_id,
        resource.icon, resource.hex, resource.filter
    ]);
});

const deleteResource = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    const resource_id = req.body.resource.id;
    let resource = await HtmlUtilities.runQuerySync(ResourceQueries.SELECT_RESOURCE_BY_ID_AND_USER_ID, [resource_id, idToken.sub]).rows[0];
    if (_.isNullOrUndefined(resource)) {
        throw new Error("Could not find resource to delete with id: " + resource_id);
    }
    HtmlUtilities.sendQuery(res, ResourceQueries.DELETE_RESOURCE_BY_ID, [resource_id]);
})

export const ResourceRepository = {
    getResource,
    postResource,
    putResource,
    deleteResource
}