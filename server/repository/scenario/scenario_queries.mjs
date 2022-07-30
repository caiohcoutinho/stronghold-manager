const SELECT_SCENARIO_BY_USER_ID = `
    SELECT s.*, u.name as owner_name
    FROM scenario s LEFT join stronghold_user u on u.id = s.owner_id
    WHERE s.owner_id = $1
    ORDER BY s.id
`;

const UPDATE_SCENARIO = `
    UPDATE scenario
    SET name = $2
    WHERE id = $1 AND owner_id = $3
`;

const SELECT_SCENARIO_BY_ID_AND_USER_ID = `
    SELECT *
    FROM scenario
    WHERE id = $1 AND owner_id = $2
    ORDER BY id
`;

const CREATE_SCENARIO = "INSERT INTO public.scenario(id, name, owner_id) VALUES ($1, $2, $3);";

const DELETE_SCENARIO_BY_ID = `
    DELETE FROM scenario
    WHERE id = $1
`;

export const ScenarioQueries = {
    SELECT_SCENARIO_BY_USER_ID,
    UPDATE_SCENARIO,
    SELECT_SCENARIO_BY_ID_AND_USER_ID,
    CREATE_SCENARIO,
    DELETE_SCENARIO_BY_ID
}