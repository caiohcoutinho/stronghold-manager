export const SELECT_FORMULA_NODE_BY_ID_AND_USER_ID = `
    SELECT *
    FROM formula_node
    WHERE owner_id = $2 AND node_id = $1
    ORDER BY node_id
`;

export const SELECT_FORMULA_NODE_BY_PARENT_ID_AND_USER_ID = `
    SELECT *
    FROM formula_node
    WHERE owner_id = $2 AND parent_id = $1
    ORDER BY node_id
`;

export const CREATE_FORMULA_NODE = `
    INSERT INTO formula_node(node_id, node_type, parent_id, resource_id, quantity, root_node_id, owner_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
`;

export const UPDATE_FORMULA_NODE = `
    UPDATE formula_node
    SET node_type = $3, parent_id = $4, resource_id = $5, quantity = $6, root_node_id = $7
    WHERE node_id = $1 AND owner_id = $2
`;

export const DELETE_FORMULA_BY_ID_AND_USER_ID = `
    DELETE FROM formula_node
    WHERE node_id = $1 AND owner_id = $2
`;

// export const SELECT_RECIPE_BY_USER_ID = `
//     SELECT s.*, u.name as owner_name
//     FROM recipe s LEFT join stronghold_user u on u.id = s.owner_id
//     WHERE s.owner_id = $1
//     ORDER BY s.id
// `;
//
// export const UPDATE_RECIPE = `
//     UPDATE recipe
//     SET name = $2, scenario_id = $3
//     WHERE id = $1 AND owner_id = $4
// `;
//
// export const SELECT_RECIPE_BY_ID_AND_USER_ID = `
//     SELECT *
//     FROM recipe
//     WHERE id = $1 AND owner_id = $2
//     ORDER BY id
// `;
//
// export const CREATE_RECIPE = "INSERT INTO public.recipe(id, name, owner_id) VALUES ($1, $2, $3);";
//
// export const DELETE_RECIPE_BY_ID = `
//     DELETE FROM recipe
//     WHERE id = $1
// `;