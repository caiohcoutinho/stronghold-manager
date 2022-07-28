import Logger from '../../repository/commons/LogCommons.mjs';
import { FORMULA_NODE_REPOSITORY_LOG_ENABLED } from '../../repository/commons/LogProperties.mjs';

import {
    SELECT_FORMULA_NODE_BY_ID_AND_USER_ID,
    CREATE_FORMULA_NODE,
    UPDATE_FORMULA_NODE,
    DELETE_FORMULA_BY_ID_AND_USER_ID,
    SELECT_FORMULA_NODE_BY_PARENT_ID_AND_USER_ID
}
from './formula_node_repository_queries.mjs';

import {
    SELECT_RECIPE_BY_ID_AND_USER_ID,
    UPDATE_RECIPE_FORMULA_NODE_ID
}
from './recipe_repository.mjs';

import _ from 'underscore';
import { SELECT_RESOURCE_BY_ID_AND_USER_ID } from '../resource/resource_repository.mjs';

const isNullOrUndefined = function(obj) {
    return _.isNull(obj) || _.isUndefined(obj);
}

const logger = new Logger('formula_node_repository.mjs', FORMULA_NODE_REPOSITORY_LOG_ENABLED);

const UPSERT_FORMULA_LABEL = 'upsertFormula';

export const upsertFormula = async function(pool, idGenerator, recipe, idToken) {
    let formula = recipe.formula;
    let rootNode;
    await (async() => {
        const client = await pool.connect()
        try {
            await client.query('BEGIN');

            logger.logDebug(UPSERT_FORMULA_LABEL, "recipe = " + JSON.stringify(recipe));
            let previous_recipe = (await client.query(SELECT_RECIPE_BY_ID_AND_USER_ID, [recipe.id, idToken.sub])).rows[0];
            logger.logDebug(UPSERT_FORMULA_LABEL, "previous_recipe = " + JSON.stringify(previous_recipe));

            await client.query(UPDATE_RECIPE_FORMULA_NODE_ID, [recipe.id, idToken.sub, null]);

            let formula_to_delete_id = previous_recipe ? previous_recipe.formula_id : null;

            logger.logDebug(UPSERT_FORMULA_LABEL, "formula_to_delete_id = " + formula_to_delete_id);
            if (!isNullOrUndefined(formula_to_delete_id)) {
                logger.logDebug(UPSERT_FORMULA_LABEL, 'Deleting previous node. formula_to_delete_id = ' + formula_to_delete_id);
                await deleteFormulaNode(client, formula_to_delete_id, idToken);
            }

            logger.logDebug(UPSERT_FORMULA_LABEL, 'Creating updated node');
            rootNode = await upsertFormulaNode(client, idGenerator, null, null, formula, idToken);

            let root_node_id = rootNode ? rootNode.node_id : null
            logger.logDebug(UPSERT_FORMULA_LABEL, 'Node created succesfully. Updating recipe with root_node_id = ' + root_node_id);
            await client.query(UPDATE_RECIPE_FORMULA_NODE_ID, [recipe.id, idToken.sub, root_node_id]);
            await client.query('COMMIT')
            client.release();

            logger.logDebug(UPSERT_FORMULA_LABEL, "Finished. Returning.");
            return rootNode;
        } catch (e) {
            await client.query('ROLLBACK')
            logger.logError(UPSERT_FORMULA_LABEL, e);
            logger.logError(UPSERT_FORMULA_LABEL, e.stack);
            client.release();
            return;
        }
    })().catch(e => console.error(e.stack));
    return rootNode;
}

const DELETE_FORMULA_NODE_LABEL = 'deleteFormulaNode';

const deleteFormulaNode = async function(client, node_id, idToken) {
    logger.logDebug(DELETE_FORMULA_NODE_LABEL, "Start of delete node_id = " + node_id);
    let result = await client.query(SELECT_FORMULA_NODE_BY_ID_AND_USER_ID, [node_id, idToken.sub]);
    if (_.isEmpty(result.rows)) {
        logger.logDebug(DELETE_FORMULA_NODE_LABEL, "No rows found to delete. Skipping.");
        return;
    }
    let node = result.rows[0];
    let childrenResult = await client.query(SELECT_FORMULA_NODE_BY_PARENT_ID_AND_USER_ID, [node.node_id, idToken.sub]);
    let children = childrenResult.rows;
    if (!_.isEmpty(children)) {
        logger.logDebug(DELETE_FORMULA_NODE_LABEL, "Deleting children first.");

        await Promise.all(_.map(children, (child) => {
            return deleteFormulaNode(client, child.node_id, idToken);
        }));
    }

    logger.logDebug(DELETE_FORMULA_NODE_LABEL, "Removing root_node_id before deleting. node_id: " + node_id);
    await client.query(UPDATE_FORMULA_NODE, [node.node_id, idToken.sub, node.node_type,
        node.parent_id, node.resource_id, node.quantity, null
    ]);

    logger.logDebug(DELETE_FORMULA_NODE_LABEL, "Deleting node: " + node_id);
    await client.query(DELETE_FORMULA_BY_ID_AND_USER_ID, [node.node_id, idToken.sub]);
    return node;
}

const UPSERT_FORMULA_NODE_LABEL = 'upsertFormulaNode';

const upsertFormulaNode = async function(client, idGenerator, root_node_id, parent_id, node, idToken) {

    if (isNullOrUndefined(node) || _.isEmpty(_.keys(node))) {
        logger.logDebug(UPSERT_FORMULA_NODE_LABEL, "Empty formula. Skipping");
        return null;
    }

    let result = await client.query(SELECT_FORMULA_NODE_BY_ID_AND_USER_ID, [node.node_id, idToken.sub]);
    logger.logDebug(UPSERT_FORMULA_NODE_LABEL, "Upsersting Formula Node. node.node_id = " + node.node_id);

    if (!_.isEmpty(result.rows)) {
        logger.logDebug(UPSERT_FORMULA_NODE_LABEL, "Updating. root_node_id = " + root_node_id)
        await client.query(UPDATE_FORMULA_NODE, [node.node_id, idToken.sub, node.node_type,
            parent_id, node.resource_id, node.quantity, root_node_id
        ]);
    } else {
        node.node_id = idGenerator(); //uuidv4();
        logger.logDebug(UPSERT_FORMULA_NODE_LABEL, "Creating. node = " + JSON.stringify(node));
        await client.query(CREATE_FORMULA_NODE, [node.node_id, node.node_type,
            parent_id, node.resource_id, node.quantity, root_node_id, idToken.sub
        ]);
        if (isNullOrUndefined(root_node_id)) {
            logger.logDebug(UPSERT_FORMULA_NODE_LABEL, "root_node_id is null or undefined. Filling it with own node_id");
            await client.query(UPDATE_FORMULA_NODE, [node.node_id, idToken.sub, node.node_type,
                parent_id, node.resource_id, node.quantity, node.node_id
            ]);
        }
    }

    logger.logDebug(UPSERT_FORMULA_NODE_LABEL, "Node upserted. Going for children.");
    await Promise.all(_.map(node.children, (child) => {
        logger.logDebug(UPSERT_FORMULA_NODE_LABEL, "child.node_id = " + child.node_id);
        return upsertFormulaNode(client, idGenerator, root_node_id, node.node_id, child, idToken);
    }));

    logger.logDebug(UPSERT_FORMULA_NODE_LABEL, "Node created. Returning.")
    return node;
}