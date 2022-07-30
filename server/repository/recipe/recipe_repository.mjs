import { RecipeQueries } from "./recipe_queries.mjs";
import { Authentication } from "../authentication/Authentication.mjs";
import { HtmlUtilities } from "../commons/HtmlUtilities.mjs";
import { IdGenerator } from "../commons/IdGenerator.mjs";
import { FormulaNodeRepository } from "./formula_node_repository.mjs";
import _ from "../commons/UnderscoreMixin.mjs";

const getRecipe = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    HtmlUtilities.sendQuery(res, RecipeQueries.SELECT_RECIPE_BY_USER_ID, [idToken.sub]);
});

const postRecipe = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    HtmlUtilities.sendQuery(res, RecipeQueries.CREATE_RECIPE, [IdGenerator.uuidv4(), req.body.name, idToken.sub]);
});

const putRecipe = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    let recipe = req.body.recipe;
    await HtmlUtilities.runQuerySync(RecipeQueries.UPDATE_RECIPE, [recipe.id, recipe.name, recipe.scenario_id, idToken.sub]);
    await FormulaNodeRepository.upsertFormula(pool, IdGenerator.uuidv4, recipe, idToken);
    res.send("OK");
});

const deleteRecipe = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    const recipe_id = req.body.recipe.id;
    let recipe = await HtmlUtilities.runQuerySync(RecipeQueries.SELECT_RECIPE_BY_ID_AND_USER_ID, [recipe_id, idToken.sub]).rows[0];
    if (_.isNullOrUndefined(recipe)) {
        throw new Error("Could not find recipe to delete with id: " + recipe_id);
    }
    const formula_id = recipe.formula_id;
    await HtmlUtilities.runQuerySync(RecipeQueries.DELETE_RECIPE_BY_ID, [recipe_id]);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        let rootNode = await deleteFormulaNode(client, formula_id, idToken);
        await client.query('COMMIT')
        client.release();
        res.send("OK");
    } catch (e) {
        await client.query('ROLLBACK')
        client.release();
        throw new Error("Error while deleting formula_node", e);
    }
})

export const RecipeRepository = {
    getRecipe,
    postRecipe,
    putRecipe,
    deleteRecipe
}