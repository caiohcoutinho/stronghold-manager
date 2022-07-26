import { SELECT_FORMULA_NODE_BY_ID_AND_USER_ID, CREATE_FORMULA_NODE, UPDATE_FORMULA_NODE,
    DELETE_FORMULA_BY_ID_AND_USER_ID, SELECT_FORMULA_NODE_BY_PARENT_ID_AND_USER_ID }
    from './formula_node_repository_queries.mjs'

export const upsertFormula = async function(pool, recipe){
    let formula = recipe.formula;
    if(isNullOrUndefined(formula)){
        res.send("OK");
        return;
    }
    ;(async () => {
      const client = await pool.connect()
      try {
          await client.query('BEGIN');
          let node_id = formula.node_id;
          if(!isNullOrUndefined(node_id)){
              await client.query(UPDATE_RECIPE_FORMULA_NODE_ID, [recipe.id, idToken.sub, null]);
              await deleteFormulaNode(client, node_id, idToken);
          }
          let rootNode = await upsertFormulaNode(client, null, null, formula, idToken);
          await client.query(UPDATE_RECIPE_FORMULA_NODE_ID, [recipe.id, idToken.sub, rootNode.node_id]);
          await client.query('COMMIT')
          client.release();

      } catch (e) {
          await client.query('ROLLBACK')
          logError(e);
          logError(e.stack);
          client.release();
          return;
      }
    })().catch(e => console.error(e.stack))
}

const upsertFormulaNode = async function(client, root_node_id, parent_id, node, idToken){
    let result = await client.query(SELECT_FORMULA_NODE_BY_ID_AND_USER_ID, [node.node_id, idToken.sub]);
    logDebug("node.node_id = "+node.node_id);

    if(!_.isEmpty(result.rows)){
        logDebug("Updating")
        logDebug("root_node_id = "+root_node_id);
        await client.query(UPDATE_FORMULA_NODE, [node.node_id, idToken.sub, node.node_type,
            parent_id, node.resource_id, node.quantity, root_node_id]);
    } else {
        logDebug("Creating");
        node.node_id = uuidv4();
        logDebug("Before root_node_id = "+root_node_id);
        if(isNullOrUndefined(root_node_id)){
            root_node_id = node.node_id;
        }
        logDebug("After root_node_id = "+root_node_id);
        await client.query(CREATE_FORMULA_NODE, [node.node_id, node.node_type,
            parent_id, node.resource_id, node.quantity, root_node_id, idToken.sub]);
    }
    _.each(node.children, async (child) => {
        logDebug("child.node_id = "+child.node_id);
        await upsertFormulaNode(client, root_node_id, node.node_id, child, idToken);
    });
    return node;
}