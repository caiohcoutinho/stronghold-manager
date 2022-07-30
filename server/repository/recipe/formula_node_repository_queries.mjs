const SELECT_FORMULA_NODE_BY_ID_AND_USER_ID = `
    SELECT *
    FROM formula_node
    WHERE owner_id = $2 AND node_id = $1
    ORDER BY node_id
`;

const SELECT_FORMULA_NODE_BY_PARENT_ID_AND_USER_ID = `
    SELECT *
    FROM formula_node
    WHERE owner_id = $2 AND parent_id = $1
    ORDER BY node_id
`;

const CREATE_FORMULA_NODE = `
    INSERT INTO formula_node(node_id, node_type, parent_id, resource_id, quantity, root_node_id, owner_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
`;

const UPDATE_FORMULA_NODE = `
    UPDATE formula_node
    SET node_type = $3, parent_id = $4, resource_id = $5, quantity = $6, root_node_id = $7
    WHERE node_id = $1 AND owner_id = $2
`;

const DELETE_FORMULA_BY_ID_AND_USER_ID = `
    DELETE FROM formula_node
    WHERE node_id = $1 AND owner_id = $2
`;

export const FormulaNodeQueries = {
    SELECT_FORMULA_NODE_BY_ID_AND_USER_ID,
    SELECT_FORMULA_NODE_BY_PARENT_ID_AND_USER_ID,
    CREATE_FORMULA_NODE,
    UPDATE_FORMULA_NODE,
    DELETE_FORMULA_BY_ID_AND_USER_ID
}