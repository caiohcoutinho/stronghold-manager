export const SELECT_SCENARIO_BY_USER_ID = `
    SELECT s.*, u.name as owner_name
    FROM scenario s LEFT join stronghold_user u on u.id = s.owner_id
    WHERE s.owner_id = $1
    ORDER BY s.id
`;

export const UPDATE_SCENARIO = `
    UPDATE scenario
    SET name = $2
    WHERE id = $1 AND owner_id = $3
`;

export const SELECT_SCENARIO_BY_ID_AND_USER_ID = `
    SELECT *
    FROM scenario
    WHERE id = $1 AND owner_id = $2
    ORDER BY id
`;

export const CREATE_SCENARIO = "INSERT INTO public.scenario(id, name, owner_id) VALUES ($1, $2, $3);";

export const DELETE_SCENARIO_BY_ID = `
    DELETE FROM scenario
    WHERE id = $1
`;