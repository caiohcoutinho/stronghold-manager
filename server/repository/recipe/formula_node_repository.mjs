import Logger from '../../repository/commons/LogCommons.mjs';
import { FORMULA_NODE_REPOSITORY_LOG_ENABLED } from '../../repository/commons/LogProperties.mjs';
import { FormulaNodeQueries } from './formula_node_repository_queries.mjs';
import { RecipeRepository } from './recipe_repository.mjs';
import _ from '../commons/UnderscoreMixin.mjs';
import { Authentication } from '../authentication/Authentication.mjs';
import { Database } from '../commons/Database.mjs';

const loggerUpsertFormula = new Logger(FORMULA_NODE_REPOSITORY_LOG_ENABLED, 'FormulaNodeRepository', 'upsertFormula');

const upsertFormula = async function(idGenerator, recipe, idToken) {
    let formula = recipe.formula;
    let rootNode;

    const client = await Database.getPool().connect();
    try {
        await client.query('BEGIN');

        loggerUpsertFormula.logDebug("recipe = " + JSON.stringify(recipe));
        let previous_recipe = await RecipeRepository.findRecipeById(recipe.id, idToken);

        loggerUpsertFormula.logDebug("previous_recipe = " + JSON.stringify(previous_recipe));

        RecipeRepository.updataRecipeFormulaNodeId(recipe.id, idToken, null);

        let formula_to_delete_id = previous_recipe ? previous_recipe.formula_id : null;

        loggerUpsertFormula.logDebug("formula_to_delete_id = " + formula_to_delete_id);
        if (!_.isNullOrUndefined(formula_to_delete_id)) {
            loggerUpsertFormula.logDebug('Deleting previous node. formula_to_delete_id = ' + formula_to_delete_id);
            await deleteFormulaNode(client, formula_to_delete_id, idToken);
        }

        loggerUpsertFormula.logDebug('Creating updated node');
        rootNode = await upsertFormulaNode(client, idGenerator, null, null, formula, idToken);

        let root_node_id = rootNode ? rootNode.node_id : null
        loggerUpsertFormula.logDebug('Node created succesfully. Updating recipe with root_node_id = ' + root_node_id);
        RecipeRepository.updataRecipeFormulaNodeId(recipe.id, idToken, root_node_id);
        await client.query('COMMIT')
        client.release();

        loggerUpsertFormula.logDebug("Finished. Returning.");
        return rootNode;
    } catch (e) {
        await client.query('ROLLBACK')
        loggerUpsertFormula.logError(e);
        loggerUpsertFormula.logError(e.stack);
        client.release();
        throw new Error("Error upserting Formula", e);
    }
}

const loggerDeleteFormula = new Logger(FORMULA_NODE_REPOSITORY_LOG_ENABLED, 'FormulaNodeRepository', 'deleteFormulaNode');

const deleteFormulaNode = async function(client, node_id, idToken) {
    loggerDeleteFormula.logDebug("Start of delete node_id = " + node_id);
    let result = await client.query(FormulaNodeQueries.SELECT_FORMULA_NODE_BY_ID_AND_USER_ID, [node_id, idToken.sub]);
    if (_.isEmpty(result.rows)) {
        loggerDeleteFormula.logDebug("No rows found to delete. Skipping.");
        return;
    }
    let node = result.rows[0];
    let childrenResult = await client.query(FormulaNodeQueries.SELECT_FORMULA_NODE_BY_PARENT_ID_AND_USER_ID, [node.node_id, idToken.sub]);
    let children = childrenResult.rows;
    if (!_.isEmpty(children)) {
        loggerDeleteFormula.logDebug("Deleting children first.");

        await Promise.all(_.map(children, (child) => {
            return deleteFormulaNode(client, child.node_id, idToken);
        }));
    }

    loggerDeleteFormula.logDebug("Removing root_node_id before deleting. node_id: " + node_id);
    await client.query(FormulaNodeQueries.UPDATE_FORMULA_NODE, [node.node_id, idToken.sub, node.node_type,
        node.parent_id, node.resource_id, node.quantity, null
    ]);

    loggerDeleteFormula.logDebug("Deleting node: " + node_id);
    await client.query(FormulaNodeQueries.DELETE_FORMULA_BY_ID_AND_USER_ID, [node.node_id, idToken.sub]);
    return node;
}

const loggerUpsertFormulaNode = new Logger(FORMULA_NODE_REPOSITORY_LOG_ENABLED, 'FormulaNodeRepository', 'upsertFormulaNode');

const upsertFormulaNode = async function(client, idGenerator, root_node_id, parent_id, node, idToken) {

    if (_.isNullOrUndefined(node) || _.isEmpty(_.keys(node))) {
        loggerUpsertFormulaNode.logDebug("Empty formula. Skipping");
        return null;
    }

    let result = await client.query(FormulaNodeQueries.SELECT_FORMULA_NODE_BY_ID_AND_USER_ID, [node.node_id, idToken.sub]);
    loggerUpsertFormulaNode.logDebug("Upsersting Formula Node. node.node_id = " + node.node_id);

    if (!_.isEmpty(result.rows)) {
        loggerUpsertFormulaNode.logDebug("Updating. root_node_id = " + root_node_id)
        await client.query(FormulaNodeQueries.UPDATE_FORMULA_NODE, [node.node_id, idToken.sub, node.node_type,
            parent_id, node.resource_id, node.quantity, root_node_id
        ]);
    } else {
        node.node_id = idGenerator();
        loggerUpsertFormulaNode.logDebug("Creating. node = " + JSON.stringify(node));
        await client.query(FormulaNodeQueries.CREATE_FORMULA_NODE, [node.node_id, node.node_type,
            parent_id, node.resource_id, node.quantity, root_node_id, idToken.sub
        ]);
        if (_.isNullOrUndefined(root_node_id)) {
            loggerUpsertFormulaNode.logDebug("root_node_id is null or undefined. Filling it with own node_id");
            await client.query(FormulaNodeQueries.UPDATE_FORMULA_NODE, [node.node_id, idToken.sub, node.node_type,
                parent_id, node.resource_id, node.quantity, node.node_id
            ]);
        }
    }

    loggerUpsertFormulaNode.logDebug("Node upserted. Going for children.");
    await Promise.all(_.map(node.children, (child) => {
        loggerUpsertFormulaNode.logDebug("child.node_id = " + child.node_id);
        return upsertFormulaNode(client, idGenerator, root_node_id, node.node_id, child, idToken);
    }));

    loggerUpsertFormulaNode.logDebug("Node created. Returning.")
    return node;
}

const getFormulaNode = async function(client, node_id, idToken) {
    let result = await client.query(FormulaNodeQueries.SELECT_FORMULA_NODE_BY_ID_AND_USER_ID, [node_id, idToken.sub]);
    if (_.isEmpty(result.rows)) {
        return;
    }
    let node = result.rows[0];
    let childrenResult = await client.query(FormulaNodeQueries.SELECT_FORMULA_NODE_BY_PARENT_ID_AND_USER_ID, [node.node_id, idToken.sub]);
    let children = childrenResult.rows;
    if (!_.isEmpty(children)) {
        node.children = await Promise.all(_.map(children, (child) => {
            let childResult = getFormulaNode(client, child.node_id, idToken);
            return childResult;
        }));
    }
    return node;
}

const getFormula = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
    let formula_id = req.params.formula_id;;
    (async() => {
        const client = await Database.getPool().connect()
        try {
            await client.query('BEGIN');
            let rootNode = await getFormulaNode(client, formula_id, idToken);
            await client.query('COMMIT')
            client.release();
            res.send(rootNode);
            return;
        } catch (e) {
            await client.query('ROLLBACK')
            client.release();
            throw new Error("Error while getting FormulaNode", e);
        }
    })().catch(e => console.error(e.stack))
})

export const FormulaNodeRepository = {
    upsertFormula,
    deleteFormulaNode,
    upsertFormulaNode,
    getFormula
}