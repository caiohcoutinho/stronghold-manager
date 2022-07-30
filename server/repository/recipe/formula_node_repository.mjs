import Logger from '../../repository/commons/LogCommons.mjs';
import { FORMULA_NODE_REPOSITORY_LOG_ENABLED } from '../../repository/commons/LogProperties.mjs';
import { FormulaNodeQueries } from './formula_node_repository_queries.mjs';
import { RecipeRepository } from './recipe_repository.mjs';
import _ from '../commons/UnderscoreMixin.mjs';
import { ResourceRepository } from '../resource/resource_repository.mjs';
import { Authentication } from '../authentication/Authentication.mjs';

const loggerUpsertFormula = new Logger(FORMULA_NODE_REPOSITORY_LOG_ENABLED, 'FormulaNodeRepository', 'upsertFormula');

const upsertFormula = async function(pool, idGenerator, recipe, idToken) {
    let formula = recipe.formula;
    let rootNode;

    const client = await pool.connect()
    try {
        await client.query('BEGIN');

        loggerUpsertFormula.logDebug(FormulaNodeQueries.UPSERT_FORMULA_LABEL, "recipe = " + JSON.stringify(recipe));
        let previous_recipe = (await client.query(FormulaNodeQueries.SELECT_RECIPE_BY_ID_AND_USER_ID, [recipe.id, idToken.sub])).rows[0];
        loggerUpsertFormula.logDebug(FormulaNodeQueries.UPSERT_FORMULA_LABEL, "previous_recipe = " + JSON.stringify(previous_recipe));

        await client.query(FormulaNodeQueries.UPDATE_RECIPE_FORMULA_NODE_ID, [recipe.id, idToken.sub, null]);

        let formula_to_delete_id = previous_recipe ? previous_recipe.formula_id : null;

        loggerUpsertFormula.logDebug(FormulaNodeQueries.UPSERT_FORMULA_LABEL, "formula_to_delete_id = " + formula_to_delete_id);
        if (!_.isNullOrUndefined(formula_to_delete_id)) {
            loggerUpsertFormula.logDebug(FormulaNodeQueries.UPSERT_FORMULA_LABEL, 'Deleting previous node. formula_to_delete_id = ' + formula_to_delete_id);
            await deleteFormulaNode(client, formula_to_delete_id, idToken);
        }

        loggerUpsertFormula.logDebug(FormulaNodeQueries.UPSERT_FORMULA_LABEL, 'Creating updated node');
        rootNode = await upsertFormulaNode(client, idGenerator, null, null, formula, idToken);

        let root_node_id = rootNode ? rootNode.node_id : null
        loggerUpsertFormula.logDebug(FormulaNodeQueries.UPSERT_FORMULA_LABEL, 'Node created succesfully. Updating recipe with root_node_id = ' + root_node_id);
        await client.query(FormulaNodeQueries.UPDATE_RECIPE_FORMULA_NODE_ID, [recipe.id, idToken.sub, root_node_id]);
        await client.query('COMMIT')
        client.release();

        loggerUpsertFormula.logDebug(FormulaNodeQueries.UPSERT_FORMULA_LABEL, "Finished. Returning.");
        return rootNode;
    } catch (e) {
        await client.query('ROLLBACK')
        loggerUpsertFormula.logError(FormulaNodeQueries.UPSERT_FORMULA_LABEL, e);
        loggerUpsertFormula.logError(FormulaNodeQueries.UPSERT_FORMULA_LABEL, e.stack);
        client.release();
        throw new Error("Error upserting Formula", e);
    }
}

const loggerDeleteFormula = new Logger(FORMULA_NODE_REPOSITORY_LOG_ENABLED, 'FormulaNodeRepository', 'deleteFormulaNode');

const deleteFormulaNode = async function(client, node_id, idToken) {
    loggerDeleteFormula.logDebug(DELETE_FORMULA_NODE_LABEL, "Start of delete node_id = " + node_id);
    let result = await client.query(SELECT_FORMULA_NODE_BY_ID_AND_USER_ID, [node_id, idToken.sub]);
    if (_.isEmpty(result.rows)) {
        loggerDeleteFormula.logDebug(DELETE_FORMULA_NODE_LABEL, "No rows found to delete. Skipping.");
        return;
    }
    let node = result.rows[0];
    let childrenResult = await client.query(SELECT_FORMULA_NODE_BY_PARENT_ID_AND_USER_ID, [node.node_id, idToken.sub]);
    let children = childrenResult.rows;
    if (!_.isEmpty(children)) {
        loggerDeleteFormula.logDebug(DELETE_FORMULA_NODE_LABEL, "Deleting children first.");

        await Promise.all(_.map(children, (child) => {
            return deleteFormulaNode(client, child.node_id, idToken);
        }));
    }

    loggerDeleteFormula.logDebug(DELETE_FORMULA_NODE_LABEL, "Removing root_node_id before deleting. node_id: " + node_id);
    await client.query(UPDATE_FORMULA_NODE, [node.node_id, idToken.sub, node.node_type,
        node.parent_id, node.resource_id, node.quantity, null
    ]);

    loggerDeleteFormula.logDebug(DELETE_FORMULA_NODE_LABEL, "Deleting node: " + node_id);
    await client.query(DELETE_FORMULA_BY_ID_AND_USER_ID, [node.node_id, idToken.sub]);
    return node;
}

const loggerUpsertFormulaNode = new Logger(FORMULA_NODE_REPOSITORY_LOG_ENABLED, 'FormulaNodeRepository', 'upsertFormulaNode');

const upsertFormulaNode = async function(client, idGenerator, root_node_id, parent_id, node, idToken) {

    if (_.isNullOrUndefined(node) || _.isEmpty(_.keys(node))) {
        loggerUpsertFormulaNode.logDebug(UPSERT_FORMULA_NODE_LABEL, "Empty formula. Skipping");
        return null;
    }

    let result = await client.query(SELECT_FORMULA_NODE_BY_ID_AND_USER_ID, [node.node_id, idToken.sub]);
    loggerUpsertFormulaNode.logDebug(UPSERT_FORMULA_NODE_LABEL, "Upsersting Formula Node. node.node_id = " + node.node_id);

    if (!_.isEmpty(result.rows)) {
        loggerUpsertFormulaNode.logDebug(UPSERT_FORMULA_NODE_LABEL, "Updating. root_node_id = " + root_node_id)
        await client.query(UPDATE_FORMULA_NODE, [node.node_id, idToken.sub, node.node_type,
            parent_id, node.resource_id, node.quantity, root_node_id
        ]);
    } else {
        node.node_id = idGenerator();
        loggerUpsertFormulaNode.logDebug(UPSERT_FORMULA_NODE_LABEL, "Creating. node = " + JSON.stringify(node));
        await client.query(CREATE_FORMULA_NODE, [node.node_id, node.node_type,
            parent_id, node.resource_id, node.quantity, root_node_id, idToken.sub
        ]);
        if (isNullOrUndefined(root_node_id)) {
            loggerUpsertFormulaNode.logDebug(UPSERT_FORMULA_NODE_LABEL, "root_node_id is null or undefined. Filling it with own node_id");
            await client.query(UPDATE_FORMULA_NODE, [node.node_id, idToken.sub, node.node_type,
                parent_id, node.resource_id, node.quantity, node.node_id
            ]);
        }
    }

    loggerUpsertFormulaNode.logDebug(UPSERT_FORMULA_NODE_LABEL, "Node upserted. Going for children.");
    await Promise.all(_.map(node.children, (child) => {
        loggerUpsertFormulaNode.logDebug(UPSERT_FORMULA_NODE_LABEL, "child.node_id = " + child.node_id);
        return upsertFormulaNode(client, idGenerator, root_node_id, node.node_id, child, idToken);
    }));

    loggerUpsertFormulaNode.logDebug(UPSERT_FORMULA_NODE_LABEL, "Node created. Returning.")
    return node;
}

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

const getFormula = Authentication.validateAuthenticatedNeverCache(async function(req, res, idToken) {
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