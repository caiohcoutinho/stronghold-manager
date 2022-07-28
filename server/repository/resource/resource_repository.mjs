export const SELECT_RESOURCE_BY_USER_ID = `
    SELECT s.*, u.name as owner_name
    FROM resource s LEFT join stronghold_user u on u.id = s.owner_id
    WHERE s.owner_id = $1
    ORDER BY s.id
`;

export const UPDATE_RESOURCE = `
    UPDATE resource
    SET name = $3, scenario_id = $4, icon = $5, hex = $6, filter = $7
    WHERE id = $1 AND owner_id = $2
`;

export const SELECT_RESOURCE_BY_ID_AND_USER_ID = `
    SELECT *
    FROM resource
    WHERE id = $1 AND owner_id = $2
    ORDER BY id
`;

export const CREATE_RESOURCE = "INSERT INTO public.resource(id, name, owner_id) VALUES ($1, $2, $3);";

export const DELETE_RESOURCE_BY_ID = `
    DELETE FROM resource
    WHERE id = $1
`;

export const RESOURCE_REPOSITORY = {
    SELECT_RESOURCE_BY_USER_ID,
    UPDATE_RESOURCE,
    SELECT_RESOURCE_BY_ID_AND_USER_ID,
    CREATE_RESOURCE,
    DELETE_RESOURCE_BY_ID
}