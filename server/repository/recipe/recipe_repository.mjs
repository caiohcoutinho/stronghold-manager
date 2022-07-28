export const SELECT_RECIPE_BY_USER_ID = `
    SELECT s.*, u.name as owner_name
    FROM recipe s LEFT join stronghold_user u on u.id = s.owner_id
    WHERE s.owner_id = $1
    ORDER BY s.id
`;

export const UPDATE_RECIPE = `
    UPDATE recipe
    SET name = $2, scenario_id = $3
    WHERE id = $1 AND owner_id = $4
`;

export const UPDATE_RECIPE_FORMULA_NODE_ID = `
    UPDATE recipe
    SET formula_id = $3
    WHERE id = $1 AND owner_id = $2
`

export const SELECT_RECIPE_BY_ID_AND_USER_ID = `
    SELECT *
    FROM recipe
    WHERE id = $1 AND owner_id = $2
    ORDER BY id
`;

export const CREATE_RECIPE = "INSERT INTO public.recipe(id, name, owner_id) VALUES ($1, $2, $3);";

export const DELETE_RECIPE_BY_ID = `
    DELETE FROM recipe
    WHERE id = $1
`;

export const RECIPE_REPOSITORY = {
    SELECT_RECIPE_BY_USER_ID,
    SELECT_RECIPE_BY_ID_AND_USER_ID,
    UPDATE_RECIPE,
    CREATE_RECIPE,
    DELETE_RECIPE_BY_ID,
    UPDATE_RECIPE_FORMULA_NODE_ID
}